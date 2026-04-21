import './GroceryDoneToggle.css';

interface GroceryDoneToggleProps {
  done: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function GroceryDoneToggle({
  done,
  onToggle,
  disabled = false,
}: GroceryDoneToggleProps) {
  return (
    <button
      className={`grocery-done-btn${done ? ' done' : ''}`}
      onClick={onToggle}
      disabled={disabled}
      title={done ? 'Courses faites — cliquer pour débloquer' : 'Marquer les courses comme faites'}
      aria-label={done ? 'Courses faites' : 'Courses non faites'}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className="grocery-done-icon"
      >
        {done ? (
          <>
            <rect x="1" y="3" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.2" />
            <path d="M4.5 9L7 11.5L11.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 3V1.5C4 1.22 4.22 1 4.5 1H11.5C11.78 1 12 1.22 12 1.5V3" stroke="currentColor" strokeWidth="1.2" />
          </>
        ) : (
          <>
            <rect x="1" y="3" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.2" />
            <line x1="5" y1="7" x2="11" y2="7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <line x1="5" y1="9.5" x2="9" y2="9.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <line x1="5" y1="12" x2="10" y2="12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <path d="M4 3V1.5C4 1.22 4.22 1 4.5 1H11.5C11.78 1 12 1.22 12 1.5V3" stroke="currentColor" strokeWidth="1.2" />
          </>
        )}
      </svg>
    </button>
  );
}
