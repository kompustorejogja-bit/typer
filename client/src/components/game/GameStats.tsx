import { Card, CardContent } from "@/components/ui/card";

interface GameStatsProps {
  wpm: number;
  accuracy: number;
  charactersTyped: number;
  errors: number;
}

export default function GameStats({ wpm, accuracy, charactersTyped, errors }: GameStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="game-card">
        <CardContent className="p-4 text-center">
          <div className="text-3xl font-bold wpm-counter" data-testid="text-current-wpm">{wpm}</div>
          <div className="text-sm text-muted-foreground">WPM</div>
        </CardContent>
      </Card>
      
      <Card className="game-card">
        <CardContent className="p-4 text-center">
          <div className="text-3xl font-bold text-accent" data-testid="text-current-accuracy">{accuracy}%</div>
          <div className="text-sm text-muted-foreground">Accuracy</div>
        </CardContent>
      </Card>
      
      <Card className="game-card">
        <CardContent className="p-4 text-center">
          <div className="text-3xl font-bold text-yellow-500" data-testid="text-characters-typed">{charactersTyped}</div>
          <div className="text-sm text-muted-foreground">Characters</div>
        </CardContent>
      </Card>
      
      <Card className="game-card">
        <CardContent className="p-4 text-center">
          <div className="text-3xl font-bold text-red-500" data-testid="text-errors">{errors}</div>
          <div className="text-sm text-muted-foreground">Errors</div>
        </CardContent>
      </Card>
    </div>
  );
}
