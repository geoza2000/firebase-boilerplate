import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function DashboardPage() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
      <p className="text-muted-foreground mb-8">Welcome, {user?.displayName || 'User'}</p>
      <Button onClick={signOut} variant="outline">
        Sign Out
      </Button>
    </div>
  );
}
