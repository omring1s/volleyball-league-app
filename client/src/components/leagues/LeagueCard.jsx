import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

const skillColors = { beginner: 'green', intermediate: 'yellow', advanced: 'red', all: 'blue' };

export function LeagueCard({ league }) {
  return (
    <Link to={`/leagues/${league.id}`}>
      <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer h-full">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-base leading-snug">{league.name}</h3>
          <Badge color={skillColors[league.skill_level] || 'gray'}>{league.skill_level}</Badge>
        </div>
        {league.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{league.description}</p>
        )}
        <div className="flex items-center gap-4 text-xs text-gray-500 mt-auto">
          {league.location && <span>📍 {league.location}</span>}
          <span>👥 {league.member_count || 0} members</span>
        </div>
        {league.season_start && (
          <div className="text-xs text-gray-400 mt-2">
            {new Date(league.season_start).toLocaleDateString()} – {league.season_end ? new Date(league.season_end).toLocaleDateString() : 'TBD'}
          </div>
        )}
      </Card>
    </Link>
  );
}
