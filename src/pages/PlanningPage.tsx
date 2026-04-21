import { PlanningGrid } from '@/components/PlanningGrid';

export function PlanningPage() {
  return (
    <div className="page-enter">
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--mp-font-display)',
              fontSize: '1.5rem',
              fontWeight: 600,
              marginBottom: '2px',
            }}
          >
            Planning des repas
          </h1>
          <p
            style={{
              color: 'var(--mp-text-secondary)',
              fontSize: '0.8rem',
            }}
          >
            2 semaines glissantes — midi et soir
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            fontSize: '0.7rem',
            color: 'var(--mp-text-muted)',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--mp-present)', display: 'inline-block' }} />
            Présent
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--mp-gamelle)', display: 'inline-block' }} />
            Gamelle
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--mp-absent)', display: 'inline-block' }} />
            Absent
          </span>
        </div>
      </div>

      <PlanningGrid />
    </div>
  );
}
