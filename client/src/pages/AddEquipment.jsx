import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import api from '../api/client';

export default function AddEquipment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', type: 'ball', location_type: 'park', location_name: '', condition: 'good' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return <div className="p-8 text-center">Please <a href="/auth" className="text-blue-600 underline">sign in</a> to add equipment.</div>;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name) { setError('Name is required'); return; }
    setLoading(true); setError('');
    try {
      const r = await api.post('/equipment', form);
      navigate(`/equipment/${r.data.id}`);
    } catch (e) { setError(e.response?.data?.error || 'Failed to add equipment'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Add Equipment</h1>
      <Card className="p-6">
        <form onSubmit={submit} className="space-y-5">
          <Input label="Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Mikasa V200W Ball" required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="net">Net</option>
              <option value="ball">Ball</option>
              <option value="poles">Poles</option>
              <option value="pump">Pump</option>
              <option value="other">Other</option>
            </Select>
            <Select label="Condition" value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Location type" value={form.location_type} onChange={e => setForm(f => ({ ...f, location_type: e.target.value }))}>
              <option value="park">Park</option>
              <option value="gym">Gym</option>
              <option value="beach">Beach</option>
            </Select>
            <Input label="Location name" value={form.location_name} onChange={e => setForm(f => ({ ...f, location_name: e.target.value }))} placeholder="Riverside Park" />
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => navigate('/equipment')}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Equipment'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
