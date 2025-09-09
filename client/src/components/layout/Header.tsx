import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

export default function Header() {
  const { user } = useAuth();
  const [location] = useLocation();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
              <i className="fas fa-keyboard text-primary text-2xl"></i>
              <h1 className="text-xl font-bold text-primary">TypeRace Pro</h1>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link 
                href="/" 
                className={`text-muted-foreground hover:text-primary transition-colors ${
                  location === "/" ? "text-primary" : ""
                }`}
                data-testid="link-play"
              >
                Play
              </Link>
              <Link 
                href="/" 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-leaderboard"
              >
                Leaderboard
              </Link>
              <Link 
                href="/" 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-profile"
              >
                Profile
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm">
              <i className="fas fa-trophy text-yellow-500"></i>
              <span className="text-muted-foreground">Best WPM:</span>
              <span className="font-bold text-accent" data-testid="text-header-best-wpm">
                {user?.bestWpm || 0}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                {user?.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover"
                    data-testid="img-profile-avatar"
                  />
                ) : (
                  <i className="fas fa-user text-primary-foreground text-sm"></i>
                )}
              </div>
              <span className="hidden md:inline font-medium" data-testid="text-username">
                {user?.username || user?.firstName || 'Player'}
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = "/api/logout"}
                data-testid="button-logout"
              >
                <i className="fas fa-sign-out-alt"></i>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
