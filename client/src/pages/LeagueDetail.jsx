import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MemberList } from '../components/leagues/MemberList';
import { ScheduleGrid } from '../components/games/ScheduleGrid';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import api from '../api/client';

const skillColors = { beginner: 'green', intermediate: 'yellow', advanced: 'red', all: 'blue' };

export default function LeagueDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [league, setLeague] = useState(null);
  const [members, setMembers] = useState([]);
  const [games, setGames] = useState([]);
  const [tab, setTab] = useState('schedule');
  const [loading, setLoading] = useState(true);
  const [myRole, setMyRole] = useState(null);
  const [showAddGame, setShowAddGame] = useState(false);
  const [gameForm, setGameForm] = useState({ home_team: '', away_team: '', scheduled_at: '', location: '' });
  const [gameError, setGameError] = useState('');

  const load = async () => {
    try {
      const [l, m, g] = await Promise.all([
        api.get(`/leagues/${id}`).then(r => r.data),
        api.get(`/leagues/${id}/members`).then(r => r.data),
        api.get(`/leagues/${id}/games`).then(r => r.data),
      ]);
      setLeague(l);
      setMembers(m);
      setGames(g);
      if (user) {
        const me = m.find(mem => mem.user_id === user.id);
        setMyRole(me?.role || null);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const join = async () => {
    await api.post(`/leagues/${id}/join`);
    load();
  };

  const leave = async () => {
    await api.delete(`/leagues/${id}/leave`);
    setMyRole(null);
    load();
  };

  const deleteLeague = async () => {
    if (!confirm('Delete this league? This cannot be undone.')) return;
    await api.delete(`/leagues/${id}`);
    navigate('/leagues');
  };

  const addGame = async (e) => {
    e.preventDefault();
    setGameError('');
    try {
      await api.post(`/leagues/${id}/games`, gameForm);
      setShowAddGame(false);
      setGameForm({ home_team: '', away_team: '', scheduled_at: '', location: '' });
      const g = await api.get(`/leagues/${id}/games`).then(r => r.data);
      setGames(g);
    } catch (e) { setGameError(e.response?.data?.error || 'Failed to add game'); }
  };

  if (loading) return <Spinner />;
  if (!league) return <div className="p-8 text-center text-gray-500">League not found.</div>;

  const isMember = !!myRole;
  const isAdmin = myRole === 'admin';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{league.name}</h1>
            <Badge color={skillColors[league.skill_level] || 'gray'}>{league.skill_level}</Badge>
          </div>
          {league.description && <p className="text-gray-500">{league.description}</p>}
          <div className="flex gap-4 text-sm text-gray-500 mt-2">
            {league.location && <span>📍 {league.location}</span>}
            <span>👥 {league.member_count} members</span>
            {league.season_start && <span>📅 {new Date(league.season_start).toLocaleDateString()}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          {user && !isMember && <Button onClick={join}>Join League</Button>}
          {user && isMember && !isAdmin && <Button variant="secondary" onClick={leave}>Leave</Button>}
          {isAdmin && (
            <>
              <Button onClick={() => setShowAddGame(true)} size="sm">+ Add Game</Button>
              <Link to={`/leagues/${id}/edit`}><Button variant="outline" size="sm">Edit</Button></Link>
              <Button variant="danger" size="sm" onClick={deleteLeague}>Delete</Button>
            </>
          )}
        </div>
      </div>

      <div className="flex border-b mb-6 gap-1">
        {['schedule', 'members'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${tab === t ? 'border-b-2 border-blue-700 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}>
            {t} {t === 'members' ? `(${members.length})` : `(${games.length})`}
          </button>
        ))}
      </div>

      {tab === 'schedule' && (
        <ScheduleGrid games={games} isAdmin={isAdmin} leagueId={id} onGameUpdated={load} />
      )}
      {tab === 'members' && <MemberList members={members} />}

      <Modal isOpen={showAddGame} onClose={() => setShowAddGame(false)} title="Add Game">
        <form onSubmit={addGame} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Home team *" value={gameForm.home_team} onChange={e => setGameForm(f => ({ ...f, home_team: e.target.value }))} required />
            <Input label="Away team *" value={gameForm.away_team} onChange={e => setGameForm(f => ({ ...f, away_team: e.target.value }))} required />
          </div>
          <Input label="Date & Time *" type="datetime-local" value={gameForm.scheduled_at} onChange={e => setGameForm(f => ({ ...f, scheduled_at: e.target.value }))} required />
          <Input label="Location" value={gameForm.location} onChange={e => setGameForm(f => ({ ...f, location: e.target.value }))} />
          {gameError && <p className="text-sm text-red-600">{gameError}</p>}
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => setShowAddGame(false)}>Cancel</Button>
            <Button type="submit">Add Game</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
