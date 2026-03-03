import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { GameCard } from '../components/games/GameCard';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import api from '../api/client';

export default function Schedule() {
  const { user } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.get('/games/upcoming')
      .then(r => setGames(r.data))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p className="text-gray-500 mb-4">Sign in to see your schedule.</p>
      <Link to="/auth"><Button>Sign In</Button></Link>
    </div>
  );

  if (loading) return <Spinner />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Schedule</h1>
      {games.length === 0 ? (
        <EmptyState icon="📅" title="No upcoming games" description="Join a league to have games appear here." action={<Link to="/leagues"><Button variant="outline">Browse Leagues</Button></Link>} />
      ) : (
        <div className="space-y-4">
          {games.map(g => <GameCard key={g.id} game={g} leagueName={g.league_name} />)}
        </div>
      )}
    </div>
  );
}
