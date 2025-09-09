import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20"></div>
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <i className="fas fa-keyboard text-primary text-6xl"></i>
            <h1 className="text-6xl font-bold text-primary">TypeRace Pro</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The ultimate competitive typing arena where speed meets accuracy. 
            Challenge players worldwide in real-time typing battles.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-6"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-login"
          >
            <i className="fas fa-play mr-3"></i>
            Start Playing
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Game Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="game-card">
            <CardHeader className="text-center">
              <i className="fas fa-bolt text-primary text-4xl mb-4"></i>
              <CardTitle>Real-Time Battles</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Compete against up to 6 players simultaneously with live progress tracking
              </p>
            </CardContent>
          </Card>

          <Card className="game-card">
            <CardHeader className="text-center">
              <i className="fas fa-trophy text-accent text-4xl mb-4"></i>
              <CardTitle>Skill-Based Ranking</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Track your WPM, accuracy, and climb the global leaderboards
              </p>
            </CardContent>
          </Card>

          <Card className="game-card">
            <CardHeader className="text-center">
              <i className="fas fa-users text-yellow-500 text-4xl mb-4"></i>
              <CardTitle>Private Rooms</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Create custom rooms with friends using shareable room codes
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-card/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1M+</div>
              <div className="text-muted-foreground">Games Played</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">50K+</div>
              <div className="text-muted-foreground">Active Players</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-500 mb-2">150+</div>
              <div className="text-muted-foreground">Average WPM</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-500 mb-2">24/7</div>
              <div className="text-muted-foreground">Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Test Your Skills?</h2>
        <p className="text-xl text-muted-foreground mb-8">
          Join the competitive typing community and prove you're the fastest typist
        </p>
        <Button 
          size="lg" 
          className="text-lg px-8 py-6"
          onClick={() => window.location.href = "/api/login"}
          data-testid="button-cta-login"
        >
          <i className="fas fa-rocket mr-3"></i>
          Get Started Now
        </Button>
      </div>
    </div>
  );
}
