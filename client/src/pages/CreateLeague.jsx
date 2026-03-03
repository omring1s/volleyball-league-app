import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import api from '../api/client';

export default function CreateLeague() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', description: '', location: '', skill_level: 'all',
    season_start: '', season_end: '', max_teams: 8,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return <div className="p-8 text-center">Please <a href="/auth" className="text-blue-600 underline">sign in</a> to create a league.</div>;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name) { setError('League name is required'); return; }
    setLoading(true); setError('');
    try {
      const r = await api.post('/leagues', form);
      navigate(`/leagues/${r.data.id}`);
    } catch (e) { setError(e.response?.data?.error || 'Failed to create league'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create a League</h1>
      <Card className="p-6">
        <form onSubmit={submit} className="space-y-5">
          <Input label="League Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Sunday Recreational Volleyball" required />
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tell players about your league..." />
          </div>
          <Input label="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Central Park, NYC" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Skill Level" value={form.skill_level} onChange={e => setForm(f => ({ ...f, skill_level: e.target.value }))}>
              <option value="all">All levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Select>
            <Input label="Max Teams" type="number" min="2" max="64" value={form.max_teams} onChange={e => setForm(f => ({ ...f, max_teams: parseInt(e.target.value) }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Season Start" type="date" value={form.season_start} onChange={e => setForm(f => ({ ...f, season_start: e.target.value }))} />
            <Input label="Season End" type="date" value={form.season_end} onChange={e => setForm(f => ({ ...f, season_end: e.target.value }))} />
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => navigate('/leagues')}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create League'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
