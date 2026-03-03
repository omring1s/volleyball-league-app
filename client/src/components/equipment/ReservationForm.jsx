import { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import api from '../../api/client';

export function ReservationForm({ equipmentId, onReserved }) {
  const [form, setForm] = useState({ reserved_at: '', ends_at: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.reserved_at || !form.ends_at) {
      setError('Both start and end times are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post(`/equipment/${equipmentId}/reserve`, form);
      setSuccess(true);
      setForm({ reserved_at: '', ends_at: '' });
      onReserved?.();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to reserve');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-4 bg-green-50 rounded-lg text-green-800 text-sm">
        ✅ Reserved! <button onClick={() => setSuccess(false)} className="underline ml-2">Make another</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Start time"
          type="datetime-local"
          value={form.reserved_at}
          onChange={e => setForm(f => ({ ...f, reserved_at: e.target.value }))}
          required
        />
        <Input
          label="End time"
          type="datetime-local"
          value={form.ends_at}
          onChange={e => setForm(f => ({ ...f, ends_at: e.target.value }))}
          required
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading}>{loading ? 'Reserving...' : 'Reserve'}</Button>
    </form>
  );
}
