import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import api from '../../api/client';

export function ScoreEntry({ game, leagueId, onClose, onSaved }) {
  const [form, setForm] = useState({
    home_score: game.home_score ?? '',
    away_score: game.away_score ?? '',
    status: game.status,
    scheduled_at: game.scheduled_at?.slice(0, 16) || '',
    location: game.location || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await api.put(`/leagues/${leagueId}/games/${game.id}`, {
        ...form,
        home_score: form.home_score !== '' ? Number(form.home_score) : null,
        away_score: form.away_score !== '' ? Number(form.away_score) : null,
      });
      onSaved();
      onClose();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen title={`Edit: ${game.home_team} vs ${game.away_team}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label={`${game.home_team} score`} type="number" min="0" value={form.home_score} onChange={e => setForm(f => ({ ...f, home_score: e.target.value }))} />
          <Input label={`${game.away_team} score`} type="number" min="0" value={form.away_score} onChange={e => setForm(f => ({ ...f, away_score: e.target.value }))} />
        </div>
        <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
        <Input label="Date & Time" type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} />
        <Input label="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </div>
    </Modal>
  );
}
