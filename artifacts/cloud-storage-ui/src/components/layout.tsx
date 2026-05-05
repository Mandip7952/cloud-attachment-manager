import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, Cloud } from "lucide-react";
import { Link } from "wouter";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoggingOut } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <div className="bg-primary/10 p-1.5 rounded-md">
                <Cloud className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold tracking-tight">Cloud Storage</span>
            </Link>
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline-block">
                {user.username}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                disabled={isLoggingOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline-block">Log out</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 container max-w-screen-2xl py-6 md:py-8">
        {children}
      </main>
    </div>
  );
}
