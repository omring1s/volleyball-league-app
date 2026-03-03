import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LeagueCard } from '../components/leagues/LeagueCard';
import { LeagueFilters } from '../components/leagues/LeagueFilters';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import api from '../api/client';

export default function LeagueBrowser() {
  const { user } = useAuth();
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ q: '', skill: '', location: '' });
  const debouncedFilters = useDebounce(filters, 300);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (debouncedFilters.q) params.q = debouncedFilters.q;
    if (debouncedFilters.skill) params.skill = debouncedFilters.skill;
    if (debouncedFilters.location) params.location = debouncedFilters.location;
    api.get('/leagues', { params })
      .then(r => setLeagues(r.data))
      .finally(() => setLoading(false));
  }, [debouncedFilters]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leagues</h1>
          <p className="text-gray-500 text-sm mt-1">{leagues.length} league{leagues.length !== 1 ? 's' : ''} found</p>
        </div>
        {user && <Link to="/leagues/create"><Button>+ Create League</Button></Link>}
      </div>

      <div className="mb-6">
        <LeagueFilters filters={filters} onChange={setFilters} />
      </div>

      {loading ? <Spinner /> : leagues.length === 0 ? (
        <EmptyState icon="🏆" title="No leagues found" description="Try adjusting your filters or create the first one!" action={user && <Link to="/leagues/create"><Button>Create League</Button></Link>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {leagues.map(l => <LeagueCard key={l.id} league={l} />)}
        </div>
      )}
    </div>
  );
}
