import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LeagueCard } from '../components/leagues/LeagueCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Spinner } from '../components/ui/Spinner';
import api from '../api/client';

const skillColors = { beginner: 'green', intermediate: 'yellow', advanced: 'red' };

export default function Profile() {
  const { id } = useParams();
  const { user, login, token } = useAuth();
  const isOwn = user && String(user.id) === String(id);
  const [profile, setProfile] = useState(null);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [p, l] = await Promise.all([
      api.get(`/users/${id}`).then(r => r.data),
      api.get(`/users/${id}/leagues`).then(r => r.data),
    ]);
    setProfile(p);
    setLeagues(l);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const startEdit = () => {
    setForm({ full_name: profile.full_name || '', skill_level: profile.skill_level, position: profile.position || '', username: profile.username });
    setEditing(true);
  };

  const save = async () => {
    setSaving(true); setSaveError('');
    try {
      const r = await api.put('/auth/me', form);
      login({ user: r.data, token });
      setProfile(r.data);
      setEditing(false);
    } catch (e) { setSaveError(e.response?.data?.error || 'Failed to save'); }
    finally { setSaving(false); }
  };

  if (loading) return <Spinner />;
  if (!profile) return <div className="p-8 text-center text-gray-500">User not found.</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold">
              {(profile.full_name || profile.username)?.[0]?.toUpperCase()}
            </div>
            <div>
              {editing ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Full name" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
                    <Input label="Username" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Select label="Skill level" value={form.skill_level} onChange={e => setForm(f => ({ ...f, skill_level: e.target.value }))}>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </Select>
                    <Input label="Position" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} placeholder="Setter, Libero..." />
                  </div>
                  {saveError && <p className="text-sm text-red-600">{saveError}</p>}
                  <div className="flex gap-2">
                    <Button onClick={save} disabled={saving} size="sm">{saving ? 'Saving...' : 'Save'}</Button>
                    <Button variant="secondary" onClick={() => setEditing(false)} size="sm">Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-gray-900">{profile.full_name || profile.username}</h1>
                  <p className="text-gray-500 text-sm">@{profile.username}</p>
                  <div className="flex gap-2 mt-2">
                    {profile.skill_level && <Badge color={skillColors[profile.skill_level] || 'gray'}>{profile.skill_level}</Badge>}
                    {profile.position && <Badge color="gray">{profile.position}</Badge>}
                  </div>
                </>
              )}
            </div>
          </div>
          {isOwn && !editing && <Button variant="outline" size="sm" onClick={startEdit}>Edit Profile</Button>}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{profile.league_count}</div>
            <div className="text-xs text-gray-500 mt-1">Leagues</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-sm font-medium text-gray-700">Member since</div>
            <div className="text-xs text-gray-500 mt-1">{new Date(profile.created_at).toLocaleDateString()}</div>
          </div>
        </div>
      </Card>

      {leagues.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-4">Leagues</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {leagues.map(l => <LeagueCard key={l.id} league={l} />)}
          </div>
        </div>
      )}
    </div>
  );
}
