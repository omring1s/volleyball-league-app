import { Badge } from '../ui/Badge';

const statusColors = { scheduled: 'blue', completed: 'green', cancelled: 'red' };

export function GameCard({ game, leagueName, onEdit, isAdmin }) {
  const date = new Date(game.scheduled_at);
  const isCompleted = game.status === 'completed';
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">
          {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <div className="flex items-center gap-2">
          {leagueName && <span className="text-xs text-gray-500">{leagueName}</span>}
          <Badge color={statusColors[game.status]}>{game.status}</Badge>
        </div>
      </div>
      <div className="flex items-center justify-center gap-4">
        <div className="text-center flex-1">
          <div className="font-semibold text-gray-900">{game.home_team}</div>
          {isCompleted && <div className="text-2xl font-bold text-blue-700">{game.home_score ?? '–'}</div>}
        </div>
        <div className="text-gray-400 font-medium">vs</div>
        <div className="text-center flex-1">
          <div className="font-semibold text-gray-900">{game.away_team}</div>
          {isCompleted && <div className="text-2xl font-bold text-blue-700">{game.away_score ?? '–'}</div>}
        </div>
      </div>
      {game.location && <div className="text-xs text-gray-500 text-center mt-2">📍 {game.location}</div>}
      {isAdmin && onEdit && (
        <button onClick={() => onEdit(game)} className="mt-3 w-full text-xs text-blue-600 hover:text-blue-800 font-medium">
          Edit / Enter Score
        </button>
      )}
    </div>
  );
}
