import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import api from '../api/client';

export default function CreateInvite() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', location: '', scheduled_at: '', max_players: 12, skill_level: 'all' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return <div className="p-8 text-center">Please <a href="/auth" className="text-blue-600 underline">sign in</a> to create an invite.</div>;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title) { setError('Title is required'); return; }
    setLoading(true); setError('');
    try {
      const r = await api.post('/invites', form);
      navigate(`/invites/${r.data.id}`);
    } catch (e) { setError(e.response?.data?.error || 'Failed to create invite'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create a Game Invite</h1>
      <Card className="p-6">
        <form onSubmit={submit} className="space-y-5">
          <Input label="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Saturday pickup game" required />
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <Input label="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Riverside Park Court 3" />
          <Input label="Date & Time" type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Skill Level" value={form.skill_level} onChange={e => setForm(f => ({ ...f, skill_level: e.target.value }))}>
              <option value="all">All levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Select>
            <Input label="Max Players" type="number" min="2" max="50" value={form.max_players} onChange={e => setForm(f => ({ ...f, max_players: parseInt(e.target.value) }))} />
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => navigate('/invites')}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Invite'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
