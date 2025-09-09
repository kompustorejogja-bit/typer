import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import MobileNav from "@/components/layout/MobileNav";
import CreateRoomModal from "@/components/modals/CreateRoomModal";
import JoinRoomModal from "@/components/modals/JoinRoomModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);

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

  const { data: leaderboard } = useQuery({
    queryKey: ["/api/leaderboard"],
    retry: false,
  });

  const { data: gameHistory } = useQuery({
    queryKey: ["/api/user/history"],
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

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="mb-4 container mx-auto px-4 py-6 space-y-6 pb-20 lg:pb-6">
        {/* Welcome Section */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold mb-4">
            Welcome back,{" "}
            <span className="text-primary">{user.username || "Player"}</span>!
          </h1>
          <p className="text-xl text-muted-foreground">
            Ready for your next typing challenge?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="game-card">
            <CardHeader className="text-center">
              <i className="fas fa-plus text-primary text-3xl mb-2"></i>
              <CardTitle>Create Room</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Start a new typing battle and invite friends
              </p>
              <Button
                className="w-full"
                onClick={() => setShowCreateRoom(true)}
                data-testid="button-create-room"
              >
                Create New Room
              </Button>
            </CardContent>
          </Card>

          <Card className="game-card">
            <CardHeader className="text-center">
              <i className="fas fa-door-open text-accent text-3xl mb-2"></i>
              <CardTitle>Join Room</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Enter a room code to join an existing game
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowJoinRoom(true)}
                data-testid="button-join-room"
              >
                Join with Code
              </Button>
            </CardContent>
          </Card>

          <Card className="game-card">
            <CardHeader className="text-center">
              <i className="fas fa-dumbbell text-yellow-500 text-3xl mb-2"></i>
              <CardTitle>Practice Mode</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Improve your skills in solo practice
              </p>
              <Button
                variant="secondary"
                className="w-full"
                data-testid="button-practice"
              >
                Start Practice
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Personal Stats */}
          <Card className="game-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-chart-line text-primary mr-2"></i>
                Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div
                    className="text-2xl font-bold text-primary"
                    data-testid="text-best-wpm"
                  >
                    {user.bestWpm || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Best WPM</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div
                    className="text-2xl font-bold text-accent"
                    data-testid="text-avg-wpm"
                  >
                    {user.averageWpm || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg WPM</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div
                    className="text-2xl font-bold text-yellow-500"
                    data-testid="text-games-played"
                  >
                    {user.gamesPlayed || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Games Played
                  </div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div
                    className="text-2xl font-bold text-green-500"
                    data-testid="text-win-rate"
                  >
                    {user.gamesPlayed > 0
                      ? Math.round((user.gamesWon / user.gamesPlayed) * 100)
                      : 0}
                    %
                  </div>
                  <div className="text-sm text-muted-foreground">Win Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Global Leaderboard */}
          <Card className="game-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-trophy text-yellow-500 mr-2"></i>
                Global Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard?.slice(0, 5).map((player: any, index: number) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    data-testid={`leaderboard-player-${index}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0
                            ? "bg-yellow-500 text-black"
                            : index === 1
                              ? "bg-gray-400 text-white"
                              : index === 2
                                ? "bg-orange-600 text-white"
                                : "bg-gray-600 text-white"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div
                          className="font-medium text-sm"
                          data-testid={`text-player-username-${index}`}
                        >
                          {player.username || "Anonymous"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {player.gamesPlayed} games
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className="font-bold text-primary"
                        data-testid={`text-player-wpm-${index}`}
                      >
                        {player.bestWpm}
                      </div>
                      <div className="text-xs text-muted-foreground">WPM</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <MobileNav />

      <CreateRoomModal
        open={showCreateRoom}
        onOpenChange={setShowCreateRoom}
        onRoomCreated={(roomCode) => setLocation(`/game/${roomCode}`)}
      />
      <JoinRoomModal
        open={showJoinRoom}
        onOpenChange={setShowJoinRoom}
        onRoomJoined={(roomCode) => setLocation(`/game/${roomCode}`)}
      />
    </div>
  );
}
