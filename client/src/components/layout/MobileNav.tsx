import { Link, useLocation } from "wouter";

export default function MobileNav() {
  const [location] = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around py-2">
        <Link href="/" data-testid="nav-play">
          <button
            className={`flex flex-col items-center py-2 px-4 ${
              location === "/" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <i className="fas fa-play text-lg"></i>
            <span className="text-xs mt-1">Play</span>
          </button>
        </Link>
        <Link href="/" data-testid="nav-leaderboard">
          <button className="flex flex-col items-center py-2 px-4 text-muted-foreground">
            <i className="fas fa-trophy text-lg"></i>
            <span className="text-xs mt-1">Leaderboard</span>
          </button>
        </Link>
        <Link href="/" data-testid="nav-stats">
          <button className="flex flex-col items-center py-2 px-4 text-muted-foreground">
            <i className="fas fa-chart-line text-lg"></i>
            <span className="text-xs mt-1">Stats</span>
          </button>
        </Link>
        <Link href="/" data-testid="nav-profile">
          <button className="flex flex-col items-center py-2 px-4 text-muted-foreground">
            <i className="fas fa-user text-lg"></i>
            <span className="text-xs mt-1">Profile</span>
          </button>
        </Link>
      </div>
    </nav>
  );
}
