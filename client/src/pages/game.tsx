import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/layout/Header";
import MobileNav from "@/components/layout/MobileNav";
import TypingArea from "@/components/game/TypingArea";
import PlayerProgress from "@/components/game/PlayerProgress";
import GameStats from "@/components/game/GameStats";
import Leaderboard from "@/components/game/Leaderboard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Game() {
  const { code } = useParams();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const [gameState, setGameState] = useState({
    currentWpm: 0,
    accuracy: 0,
    progress: 0,
    charactersTyped: 0,
    errors: 0,
    timeLeft: 180, // 3 minutes default
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  // Fetch room data
  const { data: room, isLoading: roomLoading, error: roomError } = useQuery({
    queryKey: ["/api/rooms", code],
    enabled: !!code && !!user,
    retry: false,
    meta: {
      onError: (error: Error) => {
        if (isUnauthorizedError(error)) {
          toast({
            title: "Unauthorized",
            description: "You are logged out. Logging in again...",
            variant: "destructive",
          });
          setTimeout(() => {
            window.location.href = "/api/login";
          }, 500);
        }
      },
    },
  });

  // Fetch participants
  const { data: participants, refetch: refetchParticipants } = useQuery({
    queryKey: ["/api/rooms", room?.id, "participants"],
    enabled: !!room?.id,
    refetchInterval: 2000, // Poll every 2 seconds for real-time updates
    retry: false,
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (progressData: {
      wpm: number;
      accuracy: number;
      progress: number;
      charactersTyped: number;
      errors: number;
    }) => {
      const currentParticipant = participants?.find((p: any) => p.user.id === user?.id);
      if (!currentParticipant) throw new Error("Participant not found");
      
      await apiRequest("POST", `/api/game/progress?participantId=${currentParticipant.id}`, progressData);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      console.error("Failed to update progress:", error);
    },
  });

  // Finish game mutation
  const finishGameMutation = useMutation({
    mutationFn: async () => {
      const currentParticipant = participants?.find((p: any) => p.user.id === user?.id);
      if (!currentParticipant) throw new Error("Participant not found");
      
      const response = await apiRequest("POST", "/api/game/finish", {
        participantId: currentParticipant.id,
        finalWpm: gameState.currentWpm,
        finalAccuracy: gameState.accuracy,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Game Finished!",
        description: `You placed #${data.placement} with ${gameState.currentWpm} WPM`,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/history"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      console.error("Failed to finish game:", error);
    },
  });

  // Timer countdown
  useEffect(() => {
    if (!room || room.status !== "in_progress") return;
    
    const timer = setInterval(() => {
      setGameState(prev => {
        const newTimeLeft = Math.max(0, prev.timeLeft - 1);
        if (newTimeLeft === 0 && prev.timeLeft > 0) {
          // Auto-finish when time runs out
          finishGameMutation.mutate();
        }
        return { ...prev, timeLeft: newTimeLeft };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [room?.status, finishGameMutation]);

  // Update progress periodically
  useEffect(() => {
    if (room?.status === "in_progress" && gameState.progress > 0) {
      updateProgressMutation.mutate(gameState);
    }
  }, [gameState.currentWpm, gameState.accuracy, gameState.progress]);

  const handleTypingProgress = (progress: {
    wpm: number;
    accuracy: number;
    progress: number;
    charactersTyped: number;
    errors: number;
  }) => {
    setGameState(prev => ({ ...prev, ...progress }));
  };

  const handleGameComplete = () => {
    finishGameMutation.mutate();
  };

  const handleLeaveRoom = () => {
    setLocation("/");
  };

  const copyRoomCode = () => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code);
      toast({
        title: "Room code copied!",
        description: "Share this code with friends to invite them",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading || roomLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p className="text-muted-foreground">Loading game...</p>
        </div>
      </div>
    );
  }

  if (roomError || !room) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
            <h1 className="text-2xl font-bold mb-4">Room Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The room you're looking for doesn't exist or has been closed.
            </p>
            <Button onClick={() => setLocation("/")} data-testid="button-back-home">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6 pb-20 lg:pb-6">
        {/* Game Status Bar */}
        <Card className="game-card">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary" data-testid="text-time-left">
                    {formatTime(gameState.timeLeft)}
                  </div>
                  <div className="text-sm text-muted-foreground">Time Left</div>
                </div>
                <div className="h-8 w-px bg-border"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent" data-testid="text-player-count">
                    {room.currentPlayers}/{room.maxPlayers}
                  </div>
                  <div className="text-sm text-muted-foreground">Players</div>
                </div>
                <div className="h-8 w-px bg-border"></div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Room Code</div>
                  <div 
                    className="text-lg font-mono font-bold text-yellow-500 cursor-pointer hover:text-yellow-400" 
                    onClick={copyRoomCode}
                    data-testid="text-room-code"
                  >
                    {room.code}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  onClick={copyRoomCode}
                  data-testid="button-copy-room"
                >
                  <i className="fas fa-copy mr-2"></i>Copy Room
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleLeaveRoom}
                  data-testid="button-leave-room"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>Leave
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Typing Area */}
          <div className="lg:col-span-3 space-y-6">
            <GameStats 
              wpm={gameState.currentWpm}
              accuracy={gameState.accuracy}
              charactersTyped={gameState.charactersTyped}
              errors={gameState.errors}
            />
            
            <TypingArea 
              textContent={room.textContent}
              difficulty={room.difficulty}
              onProgress={handleTypingProgress}
              onComplete={handleGameComplete}
              gameStatus={room.status}
            />
            
            {participants && (
              <PlayerProgress 
                participants={participants}
                currentUserId={user?.id}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Leaderboard participants={participants || []} />
            
            {/* Quick Actions */}
            <Card className="game-card">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={() => setLocation("/")}
                    data-testid="button-new-room"
                  >
                    <i className="fas fa-plus mr-2"></i>Create New Room
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setLocation("/")}
                    data-testid="button-join-another"
                  >
                    <i className="fas fa-door-open mr-2"></i>Join Another Room
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Personal Stats */}
            {user && (
              <Card className="game-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Your Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Games Played</span>
                      <span className="font-bold" data-testid="text-user-games-played">
                        {user.gamesPlayed}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Win Rate</span>
                      <span className="font-bold text-accent" data-testid="text-user-win-rate">
                        {user.gamesPlayed > 0 ? Math.round((user.gamesWon / user.gamesPlayed) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Avg WPM</span>
                      <span className="font-bold text-primary" data-testid="text-user-avg-wpm">
                        {user.averageWpm}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Best WPM</span>
                      <span className="font-bold text-yellow-500" data-testid="text-user-best-wpm">
                        {user.bestWpm}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
