import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { RSVPButtons } from '../components/invites/RSVPButtons';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Card } from '../components/ui/Card';
import api from '../api/client';

const skillColors = { beginner: 'green', intermediate: 'yellow', advanced: 'red', all: 'blue' };

export default function InviteJoin() {
  const { token } = useParams();
  const { user } = useAuth();
  const [invite, setInvite] = useState(null);
  const [rsvpData, setRsvpData] = useState({ rsvps: [], counts: {} });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const inv = await api.get(`/invites/join/${token}`).then(r => r.data);
    setInvite(inv);
    const rsvps = await api.get(`/invites/${inv.id}/rsvps`).then(r => r.data);
    setRsvpData(rsvps);
    setLoading(false);
  };

  useEffect(() => { load(); }, [token]);

  if (loading) return <Spinner />;
  if (!invite) return <div className="p-8 text-center text-gray-500">Invite not found.</div>;

  const date = invite.scheduled_at ? new Date(invite.scheduled_at) : null;
  const myRSVP = user ? rsvpData.rsvps.find(r => r.user_id === user.id) : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">🏐</div>
        <div className="inline-flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">{invite.title}</h1>
          <Badge color={skillColors[invite.skill_level] || 'gray'}>{invite.skill_level}</Badge>
        </div>
        <p className="text-gray-500 text-sm">You've been invited by {invite.creator_username}</p>
      </div>

      <div className="flex justify-center gap-6 text-sm text-gray-500 mb-6 flex-wrap">
        {date && <span>📅 {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
        {invite.location && <span>📍 {invite.location}</span>}
        <span>✅ {invite.going_count || 0} going · 🤔 {invite.maybe_count || 0} maybe</span>
      </div>

      {invite.description && <p className="text-gray-600 text-center mb-6">{invite.description}</p>}

      <Card className="p-6">
        <h2 className="font-semibold mb-4 text-center">Will you be there?</h2>
        <RSVPButtons inviteId={invite.id} onRSVP={load} userRSVP={myRSVP} />
      </Card>
    </div>
  );
}
