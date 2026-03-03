import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { InviteCard } from '../components/invites/InviteCard';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import api from '../api/client';

export default function Invites() {
  const { user } = useAuth();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/invites').then(r => setInvites(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Game Invites</h1>
          <p className="text-gray-500 text-sm mt-1">Open pickup games and events</p>
        </div>
        {user && <Link to="/invites/create"><Button>+ Create Invite</Button></Link>}
      </div>

      {loading ? <Spinner /> : invites.length === 0 ? (
        <EmptyState
          icon="📩"
          title="No invites yet"
          description="Be the first to create a game invite and share it with players!"
          action={user && <Link to="/invites/create"><Button>Create Invite</Button></Link>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {invites.map(inv => <InviteCard key={inv.id} invite={inv} />)}
        </div>
      )}
    </div>
  );
}
