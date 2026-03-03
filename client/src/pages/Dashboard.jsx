import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { GameCard } from '../components/games/GameCard';
import { LeagueCard } from '../components/leagues/LeagueCard';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import api from '../api/client';

export default function Dashboard() {
  const { user } = useAuth();
  const [upcomingGames, setUpcomingGames] = useState([]);
  const [myLeagues, setMyLeagues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    Promise.all([
      api.get('/games/upcoming').then(r => setUpcomingGames(r.data)),
      api.get(`/users/${user.id}/leagues`).then(r => setMyLeagues(r.data)),
    ]).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <Spinner />;

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-6">🏐</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to VBLeague</h1>
        <p className="text-lg text-gray-500 mb-8">Find leagues, schedule games, and connect with volleyball players near you.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/auth"><Button size="lg">Get Started</Button></Link>
          <Link to="/leagues"><Button variant="secondary" size="lg">Browse Leagues</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.full_name || user.username}! 👋</h1>
        <p className="text-gray-500 mt-1">Here's what's coming up</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Upcoming Games</h2>
            <Link to="/schedule" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          {upcomingGames.length === 0 ? (
            <EmptyState icon="📅" title="No upcoming games" description="Join a league to see your games here." />
          ) : (
            <div className="space-y-3">
              {upcomingGames.slice(0, 5).map(g => (
                <GameCard key={g.id} game={g} leagueName={g.league_name} />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">My Leagues</h2>
            <Link to="/leagues" className="text-sm text-blue-600 hover:underline">Browse</Link>
          </div>
          {myLeagues.length === 0 ? (
            <EmptyState icon="🏆" title="No leagues yet" description="Browse and join a league." action={<Link to="/leagues"><Button variant="outline" size="sm">Find Leagues</Button></Link>} />
          ) : (
            <div className="space-y-3">
              {myLeagues.map(l => <LeagueCard key={l.id} league={l} />)}
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-blue-700">{myLeagues.length}</div>
              <div className="text-xs text-gray-500 mt-1">Leagues</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-700">{upcomingGames.length}</div>
              <div className="text-xs text-gray-500 mt-1">Upcoming Games</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
