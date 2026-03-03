import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge';

export function MemberList({ members }) {
  return (
    <ul className="divide-y divide-gray-100">
      {members.map(m => (
        <li key={m.id} className="flex items-center justify-between py-3">
          <Link to={`/profile/${m.user_id}`} className="flex items-center gap-3 hover:underline">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
              {(m.full_name || m.username)?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{m.full_name || m.username}</div>
              {m.team_name && <div className="text-xs text-gray-500">{m.team_name}</div>}
            </div>
          </Link>
          <div className="flex items-center gap-2">
            {m.skill_level && <Badge color="gray">{m.skill_level}</Badge>}
            {m.role === 'admin' && <Badge color="blue">Admin</Badge>}
          </div>
        </li>
      ))}
    </ul>
  );
}
