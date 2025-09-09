import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GameParticipantWithUser } from "@shared/schema";

interface LeaderboardProps {
  participants: GameParticipantWithUser[];
}

export default function Leaderboard({ participants }: LeaderboardProps) {
  // Sort participants by current WPM (descending)
  const sortedParticipants = [...participants].sort((a, b) => b.currentWpm - a.currentWpm);

  const getRankBadgeColor = (index: number) => {
    switch (index) {
      case 0: return 'rank-badge';
      case 1: return 'bg-gray-400';
      case 2: return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  const getWpmColor = (index: number) => {
    switch (index) {
      case 0: return 'text-primary';
      case 1: return 'text-yellow-500';
      case 2: return 'text-orange-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className="game-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <i className="fas fa-trophy text-yellow-500 mr-2"></i>
          Live Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedParticipants.slice(0, 6).map((participant, index) => (
            <div key={participant.id} className="flex items-center justify-between p-3 bg-muted rounded-lg" data-testid={`leaderboard-entry-${index}`}>
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 ? 'rank-badge text-black' : 
                  index === 1 ? 'bg-gray-400 text-white' :
                  index === 2 ? 'bg-orange-600 text-white' : 'bg-gray-600 text-white'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-sm" data-testid={`text-leaderboard-username-${index}`}>
                    {participant.user.username || 'Anonymous'}
                  </div>
                  <div className="text-xs text-muted-foreground" data-testid={`text-leaderboard-accuracy-${index}`}>
                    {Math.round(participant.currentAccuracy)}% accuracy
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-bold ${getWpmColor(index)}`} data-testid={`text-leaderboard-wpm-${index}`}>
                  {participant.currentWpm}
                </div>
                <div className="text-xs text-muted-foreground">WPM</div>
              </div>
            </div>
          ))}
          
          {/* Show empty slots if less than 3 participants */}
          {Array.from({ length: Math.max(0, 3 - sortedParticipants.length) }).map((_, index) => (
            <div key={`empty-${index}`} className="flex items-center justify-between p-3 bg-muted rounded-lg opacity-50">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold">
                  {sortedParticipants.length + index + 1}
                </div>
                <div>
                  <div className="font-medium text-sm text-muted-foreground">Waiting...</div>
                  <div className="text-xs text-muted-foreground">-- accuracy</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-muted-foreground">0</div>
                <div className="text-xs text-muted-foreground">WPM</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
