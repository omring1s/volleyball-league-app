import { useState } from 'react';
import { GameCard } from './GameCard';
import { ScoreEntry } from './ScoreEntry';
import { EmptyState } from '../ui/EmptyState';

export function ScheduleGrid({ games, leagueName, isAdmin, onGameUpdated, leagueId }) {
  const [editing, setEditing] = useState(null);

  return (
    <>
      {games.length === 0 ? (
        <EmptyState icon="📅" title="No games scheduled" description="Games will appear here once added." />
      ) : (
        <div className="grid gap-3">
          {games.map(g => (
            <GameCard
              key={g.id}
              game={g}
              leagueName={leagueName}
              isAdmin={isAdmin}
              onEdit={setEditing}
            />
          ))}
        </div>
      )}
      {editing && (
        <ScoreEntry
          game={editing}
          leagueId={leagueId}
          onClose={() => setEditing(null)}
          onSaved={onGameUpdated}
        />
      )}
    </>
  );
}
