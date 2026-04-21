import { useWeeks } from '@/hooks/useWeeks';
import { useAppConfig } from '@/hooks/useAppConfig';
import { useMealEntries } from '@/hooks/useMealEntries';
import type { MealSlot, MealStatus, Person } from '@/types';
import { getDayName } from '@/utils/dates';
import './SynthesisPage.css';

const SLOTS: MealSlot[] = ['midi', 'soir'];
const SLOT_LABELS: Record<MealSlot, string> = { midi: 'Midi', soir: 'Soir' };
const SHOWN_STATUSES: MealStatus[] = ['present', 'gamelle'];

function weekDateRange(days: { date: Date }[]): string {
  const first = days[0].date;
  const last = days[days.length - 1].date;
  const months = ['jan', 'fév', 'mars', 'avr', 'mai', 'juin',
    'juil', 'août', 'sept', 'oct', 'nov', 'déc'];
  const d1 = first.getDate();
  const d2 = last.getDate();
  const m1 = months[first.getMonth()];
  const m2 = months[last.getMonth()];
  return first.getMonth() === last.getMonth()
    ? `${d1} – ${d2} ${m1}`
    : `${d1} ${m1} – ${d2} ${m2}`;
}

function PersonBadge({ person, status }: { person: Person; status: MealStatus }) {
  return (
    <span className={`synth-badge synth-badge--${status}`}>
      <span className="synth-badge__dot" style={{ background: person.color }} />
      {person.name}
      {status === 'gamelle' && ' ◉'}
    </span>
  );
}

function MealCell({ dateStr, slot, persons, getStatus }: {
  dateStr: string;
  slot: MealSlot;
  persons: Person[];
  getStatus: (d: string, s: MealSlot, p: string) => MealStatus;
}) {
  const present = persons.filter(
    (p) => SHOWN_STATUSES.includes(getStatus(dateStr, slot, p.id))
  );

  if (present.length === 0) {
    return <td className="synth-cell synth-cell--empty"><span>—</span></td>;
  }

  return (
    <td className="synth-cell">
      <div className="synth-badges">
        {present.map((p) => (
          <PersonBadge key={p.id} person={p} status={getStatus(dateStr, slot, p.id)} />
        ))}
      </div>
    </td>
  );
}

export function SynthesisPage() {
  const { weeks } = useWeeks();
  const { persons } = useAppConfig();
  const { getStatus } = useMealEntries();

  return (
    <div className="synth-page">
      <div className="synth-header">
        <div>
          <h1 className="synth-title">Synthèse des repas</h1>
          <p className="synth-subtitle">2 semaines glissantes · présents et gamelles</p>
        </div>
        <button className="synth-print-btn" onClick={() => window.print()}>
          Imprimer
        </button>
      </div>

      {weeks.map((week) => (
        <div key={week.weekNumber} className="synth-week">
          <div className="synth-week-label">
            Semaine {week.weekNumber} — {weekDateRange(week.days)}
          </div>
          <table className="synth-table">
            <thead>
              <tr>
                <th className="synth-th synth-th--day">Jour</th>
                {SLOTS.map((slot) => (
                  <th key={slot} className="synth-th">{SLOT_LABELS[slot]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {week.days.map((day) => {
                const hasAnyone = SLOTS.some((slot) =>
                  persons.some((p) =>
                    SHOWN_STATUSES.includes(getStatus(day.dateStr, slot, p.id))
                  )
                );
                return (
                  <tr
                    key={day.dateStr}
                    className={[
                      'synth-row',
                      day.isToday ? 'synth-row--today' : '',
                      !hasAnyone ? 'synth-row--empty' : '',
                      day.isWeekend ? 'synth-row--weekend' : '',
                    ].filter(Boolean).join(' ')}
                  >
                    <td className="synth-day">
                      <span className="synth-day__name">{getDayName(day.date)}</span>
                      <span className="synth-day__date">
                        {String(day.date.getDate()).padStart(2, '0')}/
                        {String(day.date.getMonth() + 1).padStart(2, '0')}
                      </span>
                    </td>
                    {SLOTS.map((slot) => (
                      <MealCell
                        key={slot}
                        dateStr={day.dateStr}
                        slot={slot}
                        persons={persons}
                        getStatus={getStatus}
                      />
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}

      <div className="synth-legend">
        <span className="synth-badge synth-badge--present">
          <span className="synth-badge__dot" style={{ background: '#588157' }} />
          Présent(e)
        </span>
        <span className="synth-badge synth-badge--gamelle">
          <span className="synth-badge__dot" style={{ background: '#3d5a80' }} />
          Gamelle ◉
        </span>
        <span className="synth-legend__empty">— Personne à table</span>
      </div>
    </div>
  );
}
