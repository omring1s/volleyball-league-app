import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import api from '../../api/client';

export function RSVPButtons({ inviteId, onRSVP, userRSVP }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(userRSVP?.status || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(!userRSVP);

  const submit = async (s) => {
    if (!name && !userRSVP) {
      setError('Please enter your name');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post(`/invites/${inviteId}/rsvp`, {
        name: name || userRSVP?.name,
        email: email || userRSVP?.email,
        status: s,
      });
      setStatus(s);
      setShowForm(false);
      onRSVP?.();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to RSVP');
    } finally {
      setLoading(false);
    }
  };

  if (!showForm && status) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">Your RSVP: <strong>{status.replace('_', ' ')}</strong></span>
        <button onClick={() => setShowForm(true)} className="text-xs text-blue-600 hover:underline">Change</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!userRSVP && (
        <div className="grid grid-cols-2 gap-3">
          <Input label="Your name *" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" />
          <Input label="Email (optional)" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com" />
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={() => submit('going')} disabled={loading} variant={status === 'going' ? 'primary' : 'outline'}>✅ Going</Button>
        <Button onClick={() => submit('maybe')} disabled={loading} variant={status === 'maybe' ? 'primary' : 'outline'}>🤔 Maybe</Button>
        <Button onClick={() => submit('not_going')} disabled={loading} variant={status === 'not_going' ? 'danger' : 'secondary'}>❌ Can't go</Button>
      </div>
    </div>
  );
}
