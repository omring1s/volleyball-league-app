import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

export function LeagueFilters({ filters, onChange }) {
  const update = (key, val) => onChange({ ...filters, [key]: val });
  return (
    <div className="flex flex-wrap gap-3">
      <Input
        placeholder="Search leagues..."
        value={filters.q || ''}
        onChange={e => update('q', e.target.value)}
        className="min-w-48"
      />
      <Select value={filters.skill || ''} onChange={e => update('skill', e.target.value)} className="min-w-36">
        <option value="">All levels</option>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </Select>
      <Input
        placeholder="Location..."
        value={filters.location || ''}
        onChange={e => update('location', e.target.value)}
        className="min-w-36"
      />
    </div>
  );
}
