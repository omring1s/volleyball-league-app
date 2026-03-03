import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

const conditionColors = { excellent: 'green', good: 'blue', fair: 'yellow', poor: 'red' };
const typeIcons = { net: '🥅', ball: '🏐', poles: '🪧', pump: '🔧', other: '📦' };

export function EquipmentCard({ item }) {
  return (
    <Link to={`/equipment/${item.id}`}>
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{typeIcons[item.type] || '📦'}</span>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
              <p className="text-xs text-gray-500 capitalize">{item.type}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge color={conditionColors[item.condition] || 'gray'}>{item.condition}</Badge>
            <Badge color={item.is_available ? 'green' : 'red'}>{item.is_available ? 'Available' : 'Reserved'}</Badge>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          {item.location_name && <span>📍 {item.location_name} </span>}
          <span className="capitalize">({item.location_type})</span>
        </div>
        {item.owner_username && <div className="text-xs text-gray-400 mt-1">Owner: {item.owner_username}</div>}
      </Card>
    </Link>
  );
}
