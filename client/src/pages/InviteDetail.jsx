import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { RSVPButtons } from '../components/invites/RSVPButtons';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Card } from '../components/ui/Card';
import api from '../api/client';

const skillColors = { beginner: 'green', intermediate: 'yellow', advanced: 'red', all: 'blue' };

export default function InviteDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [invite, setInvite] = useState(null);
  const [rsvpData, setRsvpData] = useState({ rsvps: [], counts: {} });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    const [inv, rsvps] = await Promise.all([
      api.get(`/invites/${id}`).then(r => r.data),
      api.get(`/invites/${id}/rsvps`).then(r => r.data),
    ]);
    setInvite(inv);
    setRsvpData(rsvps);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const copyLink = () => {
    const url = `${window.location.origin}/invites/join/${invite.share_token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <Spinner />;
  if (!invite) return <div className="p-8 text-center text-gray-500">Invite not found.</div>;

  const date = invite.scheduled_at ? new Date(invite.scheduled_at) : null;
  const myRSVP = user ? rsvpData.rsvps.find(r => r.user_id === user.id) : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900">{invite.title}</h1>
        <Badge color={skillColors[invite.skill_level] || 'gray'}>{invite.skill_level}</Badge>
      </div>

      <div className="flex gap-4 text-sm text-gray-500 mb-4 flex-wrap">
        {date && <span>📅 {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
        {invite.location && <span>📍 {invite.location}</span>}
        <span>👤 By {invite.creator_username}</span>
      </div>

      {invite.description && <p className="text-gray-600 mb-6">{invite.description}</p>}

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{rsvpData.counts.going || 0}</div>
          <div className="text-xs text-gray-500 mt-1">Going</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{rsvpData.counts.maybe || 0}</div>
          <div className="text-xs text-gray-500 mt-1">Maybe</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-400">{invite.max_players}</div>
          <div className="text-xs text-gray-500 mt-1">Max players</div>
        </Card>
      </div>

      <Card className="p-6 mb-6">
        <h2 className="font-semibold mb-4">RSVP</h2>
        <RSVPButtons inviteId={id} onRSVP={load} userRSVP={myRSVP} />
      </Card>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm text-gray-600">Share this invite:</span>
        <button onClick={copyLink} className="text-sm text-blue-600 hover:underline font-medium">
          {copied ? '✅ Copied!' : '📋 Copy link'}
        </button>
      </div>

      {rsvpData.rsvps.length > 0 && (
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Attendees ({rsvpData.rsvps.length})</h2>
          <ul className="divide-y divide-gray-100">
            {rsvpData.rsvps.map(r => (
              <li key={r.id} className="flex items-center justify-between py-2">
                <span className="text-sm font-medium">{r.name} {r.username && <span className="text-gray-400 text-xs">@{r.username}</span>}</span>
                <Badge color={r.status === 'going' ? 'green' : r.status === 'maybe' ? 'yellow' : 'gray'}>
                  {r.status.replace('_', ' ')}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
