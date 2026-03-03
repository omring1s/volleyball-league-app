import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EquipmentCard } from '../components/equipment/EquipmentCard';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { useAuth } from '../hooks/useAuth';
import api from '../api/client';

export default function Equipment() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', location_type: '', available: '' });

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.type) params.type = filters.type;
    if (filters.location_type) params.location_type = filters.location_type;
    if (filters.available !== '') params.available = filters.available;
    api.get('/equipment', { params }).then(r => setItems(r.data)).finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipment</h1>
          <p className="text-gray-500 text-sm mt-1">Borrow and share volleyball gear</p>
        </div>
        {user && <Link to="/equipment/add"><Button>+ Add Equipment</Button></Link>}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))} className="min-w-32">
          <option value="">All types</option>
          <option value="net">Net</option>
          <option value="ball">Ball</option>
          <option value="poles">Poles</option>
          <option value="pump">Pump</option>
          <option value="other">Other</option>
        </Select>
        <Select value={filters.location_type} onChange={e => setFilters(f => ({ ...f, location_type: e.target.value }))} className="min-w-32">
          <option value="">All locations</option>
          <option value="park">Park</option>
          <option value="gym">Gym</option>
          <option value="beach">Beach</option>
        </Select>
        <Select value={filters.available} onChange={e => setFilters(f => ({ ...f, available: e.target.value }))} className="min-w-36">
          <option value="">All availability</option>
          <option value="true">Available now</option>
          <option value="false">Reserved</option>
        </Select>
      </div>

      {loading ? <Spinner /> : items.length === 0 ? (
        <EmptyState icon="🏐" title="No equipment found" description="Adjust filters or add the first item!" action={user && <Link to="/equipment/add"><Button>Add Equipment</Button></Link>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map(item => <EquipmentCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
}
