import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ReservationForm } from '../components/equipment/ReservationForm';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import api from '../api/client';

const conditionColors = { excellent: 'green', good: 'blue', fair: 'yellow', poor: 'red' };
const typeIcons = { net: '🥅', ball: '🏐', poles: '🪧', pump: '🔧', other: '📦' };

export default function EquipmentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => api.get(`/equipment/${id}`).then(r => { setItem(r.data); setLoading(false); });
  useEffect(() => { load(); }, [id]);

  const cancelReservation = async (resId) => {
    if (!confirm('Cancel this reservation?')) return;
    await api.delete(`/equipment/${id}/reserve/${resId}`);
    load();
  };

  const deleteItem = async () => {
    if (!confirm('Delete this equipment?')) return;
    await api.delete(`/equipment/${id}`);
    navigate('/equipment');
  };

  if (loading) return <Spinner />;
  if (!item) return <div className="p-8 text-center text-gray-500">Equipment not found.</div>;

  const isOwner = user && item.owner_id === user.id;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{typeIcons[item.type] || '📦'}</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
            <p className="text-gray-500 capitalize">{item.type} · {item.location_type}</p>
          </div>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate(`/equipment/${id}/edit`)}>Edit</Button>
            <Button variant="danger" size="sm" onClick={deleteItem}>Delete</Button>
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        <Badge color={conditionColors[item.condition] || 'gray'}>Condition: {item.condition}</Badge>
        <Badge color={item.is_available ? 'green' : 'red'}>{item.is_available ? 'Available' : 'Reserved'}</Badge>
      </div>

      {item.location_name && (
        <p className="text-sm text-gray-600 mb-6">📍 {item.location_name} ({item.location_type})</p>
      )}

      {item.owner_username && (
        <p className="text-sm text-gray-500 mb-6">Owner: <span className="font-medium">{item.owner_username}</span></p>
      )}

      {user && item.is_available && (
        <Card className="p-6 mb-6">
          <h2 className="font-semibold mb-4">Reserve This Item</h2>
          <ReservationForm equipmentId={id} onReserved={load} />
        </Card>
      )}

      {item.reservations?.length > 0 && (
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Upcoming Reservations</h2>
          <ul className="divide-y divide-gray-100">
            {item.reservations.map(r => (
              <li key={r.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{r.username}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(r.reserved_at).toLocaleString()} → {new Date(r.ends_at).toLocaleString()}
                  </div>
                </div>
                {user && r.user_id === user.id && (
                  <Button variant="danger" size="sm" onClick={() => cancelReservation(r.id)}>Cancel</Button>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
