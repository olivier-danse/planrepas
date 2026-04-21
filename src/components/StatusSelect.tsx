import type { MealStatus } from '@/types';
import { MEAL_STATUS_LABELS } from '@/types';
import './StatusSelect.css';

interface StatusSelectProps {
  value: MealStatus;
  onChange: (status: MealStatus) => void;
  locked: boolean;
  personColor: string;
}

const STATUS_OPTIONS: MealStatus[] = ['absent', 'present', 'gamelle'];

export function StatusSelect({
  value,
  onChange,
  locked,
  personColor,
}: StatusSelectProps) {
  return (
    <div
      className={`status-select status-${value}${locked ? ' status-locked' : ''}`}
      style={
        value === 'present'
          ? ({ '--person-accent': personColor } as React.CSSProperties)
          : undefined
      }
    >
      {locked ? (
        <div className="status-display">
          <span className="status-icon">{getIcon(value)}</span>
          <span className="status-label">{MEAL_STATUS_LABELS[value]}</span>
          <span className="status-lock" title="Verrouillé">🔒</span>
        </div>
      ) : (
        <select
          className="status-dropdown"
          value={value}
          onChange={(e) => onChange(e.target.value as MealStatus)}
          aria-label={`Statut: ${MEAL_STATUS_LABELS[value]}`}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {getIcon(s)} {MEAL_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

function getIcon(status: MealStatus): string {
  switch (status) {
    case 'present':
      return '✓';
    case 'gamelle':
      return '◉';
    case 'absent':
    default:
      return '✕';
  }
}
