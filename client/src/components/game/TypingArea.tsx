import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface TypingAreaProps {
  textContent: string;
  difficulty: string;
  onProgress: (progress: {
    wpm: number;
    accuracy: number;
    progress: number;
    charactersTyped: number;
    errors: number;
  }) => void;
  onComplete: () => void;
  gameStatus: string;
}

export default function TypingArea({ 
  textContent, 
  difficulty, 
  onProgress, 
  onComplete, 
  gameStatus 
}: TypingAreaProps) {
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [errors, setErrors] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (gameStatus === "in_progress" && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [gameStatus]);

  const calculateStats = (input: string) => {
    const charactersTyped = input.length;
    const progress = (charactersTyped / textContent.length) * 100;
    
    // Calculate errors
    let errorCount = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] !== textContent[i]) {
        errorCount++;
      }
    }
    
    // Calculate WPM
    let wpm = 0;
    if (startTime) {
      const timeElapsed = (Date.now() - startTime.getTime()) / 1000 / 60; // minutes
      const wordsTyped = charactersTyped / 5; // standard: 5 characters = 1 word
      wpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
    }

    // Calculate accuracy
    const accuracy = charactersTyped > 0 ? Math.round(((charactersTyped - errorCount) / charactersTyped) * 100) : 100;

    return { wpm, accuracy, progress, charactersTyped, errors: errorCount };
  };

  const handleInputChange = (value: string) => {
    if (gameStatus !== "in_progress") return;

    // Start timer on first character
    if (!startTime && value.length === 1) {
      setStartTime(new Date());
    }

    // Prevent typing beyond text length
    if (value.length > textContent.length) return;

    setUserInput(value);
    
    const stats = calculateStats(value);
    setErrors(stats.errors);
    onProgress(stats);

    // Check if completed
    if (value.length === textContent.length) {
      onComplete();
    }
  };

  const renderText = () => {
    return textContent.split('').map((char, index) => {
      let className = '';
      
      if (index < userInput.length) {
        className = userInput[index] === char ? 'correct-char' : 'incorrect-char';
      } else if (index === userInput.length) {
        className = 'typing-cursor';
      }

      return (
        <span key={index} className={className}>
          {char}
          {index === userInput.length && <span className="typing-cursor">|</span>}
        </span>
      );
    });
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-orange-500';
      case 'expert': return 'text-red-500';
      default: return 'text-accent';
    }
  };

  return (
    <Card className="game-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Typing Challenge</CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Difficulty:</span>
            <span className={`px-2 py-1 bg-accent text-accent-foreground rounded text-sm font-medium capitalize ${getDifficultyColor(difficulty)}`}>
              {difficulty}
            </span>
          </div>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className="progress-fill h-2 rounded-full transition-all duration-300" 
            style={{ width: `${(userInput.length / textContent.length) * 100}%` }}
          ></div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Text to type */}
        <div 
          className="bg-muted rounded-lg p-6 font-mono text-lg leading-relaxed min-h-[120px]" 
          style={{ lineHeight: 1.8 }}
          data-testid="text-content"
        >
          {renderText()}
        </div>
        
        {/* Input area */}
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={userInput}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full h-32 bg-input border border-border rounded-lg p-4 font-mono text-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder={gameStatus === "waiting" ? "Waiting for game to start..." : "Start typing here..."}
            disabled={gameStatus !== "in_progress"}
            data-testid="input-typing"
          />
          <div className="absolute bottom-3 right-3 text-sm text-muted-foreground">
            <i className="fas fa-volume-up mr-1"></i>
            Sound: ON
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
