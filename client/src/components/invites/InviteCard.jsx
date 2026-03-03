import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

const skillColors = { beginner: 'green', intermediate: 'yellow', advanced: 'red', all: 'blue' };

export function InviteCard({ invite }) {
  const date = invite.scheduled_at ? new Date(invite.scheduled_at) : null;
  return (
    <Link to={`/invites/${invite.id}`}>
      <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer h-full">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{invite.title}</h3>
          <Badge color={skillColors[invite.skill_level] || 'gray'}>{invite.skill_level}</Badge>
        </div>
        {invite.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{invite.description}</p>}
        <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
          {date && <span>📅 {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
          {invite.location && <span>📍 {invite.location}</span>}
          <span>✅ {invite.rsvp_count || 0} going</span>
          <span>👥 Max {invite.max_players}</span>
        </div>
      </Card>
    </Link>
  );
}
