import { useWeeks } from '@/hooks/useWeeks';
import { useAppConfig } from '@/hooks/useAppConfig';
import { useMealEntries } from '@/hooks/useMealEntries';
import { useLocking } from '@/hooks/useLocking';
import { StatusSelect } from './StatusSelect';
import { GroceryDoneToggle } from './GroceryDoneToggle';
import { NoteButton } from './NoteButton';
import type { MealSlot, MealStatus } from '@/types';
import { SLOT_LABELS } from '@/types';
import './PlanningGrid.css';

const SLOTS: MealSlot[] = ['midi', 'soir'];

export function PlanningGrid() {
  const { weeks } = useWeeks();
  const { persons, lockHoursBefore } = useAppConfig();
  const { getStatus, setStatus } = useMealEntries();
  const { isGroceryDoneForDate, isCellLocked, toggleDone } =
    useLocking(lockHoursBefore);

  const handleStatusChange = (
    dateStr: string,
    slot: MealSlot,
    personId: string,
    newStatus: MealStatus
  ) => {
    setStatus(dateStr, slot, personId, newStatus);
  };

  return (
    <div className="planning-container">
      {weeks.map((week) => (
        <section key={week.weekNumber} className="week-section">
          <h2 className="week-header">{week.label}</h2>

          <div className="planning-grid">
            {/* En-tête de colonnes */}
            <div className="grid-header">
              <div className="grid-header-cell grid-col-day">Jour</div>
              <div className="grid-header-cell grid-col-slot">Repas</div>
              {persons.map((person) => (
                <div
                  key={person.id}
                  className="grid-header-cell grid-col-person"
                  style={{ '--person-color': person.color } as React.CSSProperties}
                >
                  <span
                    className="person-dot"
                    style={{ background: person.color }}
                  />
                  {person.name}
                </div>
              ))}
              <div className="grid-header-cell grid-col-note">Note</div>
            </div>

            {/* Lignes par jour */}
            {week.days.map((day) => {
              const groceryDone = isGroceryDoneForDate(day.dateStr);

              return (
                <div
                  key={day.dateStr}
                  className={`day-group${day.isToday ? ' today' : ''}${
                    day.isPast ? ' past' : ''
                  }${day.isWeekend ? ' weekend' : ''}${
                    groceryDone ? ' grocery-done' : ''
                  }`}
                >
                  {/* Le label du jour span 2 lignes (midi + soir) */}
                  <div className="day-label-cell">
                    <div className="day-label">
                      <span className="day-name">{day.label}</span>
                      {day.isToday && (
                        <span className="today-badge">Auj.</span>
                      )}
                    </div>
                    <GroceryDoneToggle
                      done={groceryDone}
                      onToggle={() => toggleDone(day.dateStr)}
                      disabled={day.isPast}
                    />
                  </div>

                  {/* 2 lignes par jour : midi et soir */}
                  <div className="day-slots">
                    {SLOTS.map((slot) => {
                      const locked = isCellLocked(day.dateStr, slot);

                      return (
                        <div key={slot} className="slot-row">
                          <div className="slot-label">
                            <span className={`slot-dot slot-${slot}`} />
                            {SLOT_LABELS[slot]}
                          </div>

                          {persons.map((person) => (
                            <div
                              key={person.id}
                              className="meal-cell"
                            >
                              <StatusSelect
                                value={getStatus(
                                  day.dateStr,
                                  slot,
                                  person.id
                                )}
                                onChange={(s) =>
                                  handleStatusChange(
                                    day.dateStr,
                                    slot,
                                    person.id,
                                    s
                                  )
                                }
                                locked={locked}
                                personColor={person.color}
                              />
                            </div>
                          ))}

                          <div className="note-cell">
                            <NoteButton
                              hasNote={false}
                              onClick={() => {
                                /* TODO: étape 5 — ouvrir modal note */
                              }}
                              locked={locked}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
