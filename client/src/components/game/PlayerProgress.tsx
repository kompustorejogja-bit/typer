import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GameParticipantWithUser } from "@shared/schema";

interface PlayerProgressProps {
  participants: GameParticipantWithUser[];
  currentUserId?: string;
}

export default function PlayerProgress({ participants, currentUserId }: PlayerProgressProps) {
  // Sort participants by progress (descending)
  const sortedParticipants = [...participants].sort((a, b) => b.progress - a.progress);

  const getPositionColor = (index: number) => {
    switch (index) {
      case 0: return 'from-primary to-accent';
      case 1: return 'from-yellow-500 to-orange-500';
      case 2: return 'from-orange-500 to-red-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getPositionBadgeColor = (index: number) => {
    switch (index) {
      case 0: return 'bg-primary';
      case 1: return 'bg-yellow-500';
      case 2: return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getWpmColor = (index: number) => {
    switch (index) {
      case 0: return 'text-primary';
      case 1: return 'text-yellow-500';
      case 2: return 'text-orange-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <Card className="game-card">
      <CardHeader>
        <CardTitle>Live Race Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedParticipants.map((participant, index) => (
            <div key={participant.id} className="flex items-center space-x-4" data-testid={`player-progress-${index}`}>
              <div className="flex items-center space-x-3 w-32">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${getPositionBadgeColor(index)}`}>
                  {index + 1}
                </div>
                <span className={`font-medium text-sm ${participant.user.id === currentUserId ? 'text-primary' : ''}`}>
                  {participant.user.id === currentUserId ? 'You' : (participant.user.username || 'Anonymous')}
                </span>
              </div>
              <div className="flex-1 bg-secondary rounded-full h-3 relative">
                <div 
                  className={`absolute left-0 top-0 h-full bg-gradient-to-r ${getPositionColor(index)} rounded-full transition-all duration-300`}
                  style={{ width: `${Math.min(100, participant.progress)}%` }}
                ></div>
              </div>
              <div className={`text-sm font-bold w-16 ${getWpmColor(index)}`}>
                {participant.currentWpm} WPM
              </div>
            </div>
          ))}
          
          {/* Empty slots for missing players */}
          {Array.from({ length: Math.max(0, 4 - sortedParticipants.length) }).map((_, index) => (
            <div key={`empty-${index}`} className="flex items-center space-x-4 opacity-50">
              <div className="flex items-center space-x-3 w-32">
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-sm">
                  {sortedParticipants.length + index + 1}
                </div>
                <span className="font-medium text-sm text-muted-foreground">Waiting...</span>
              </div>
              <div className="flex-1 bg-secondary rounded-full h-3 relative">
                <div className="absolute left-0 top-0 h-full bg-gray-600 rounded-full transition-all duration-300" style={{ width: '0%' }}></div>
              </div>
              <div className="text-sm font-bold text-gray-400 w-16">0 WPM</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
