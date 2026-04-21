import './NoteButton.css';

interface NoteButtonProps {
  hasNote: boolean;
  onClick: () => void;
  locked?: boolean;
}

export function NoteButton({ hasNote, onClick, locked = false }: NoteButtonProps) {
  return (
    <button
      className={`note-btn${hasNote ? ' has-note' : ''}${locked ? ' note-locked' : ''}`}
      onClick={onClick}
      title={hasNote ? 'Voir / modifier la note' : 'Ajouter une note'}
      aria-label={hasNote ? 'Note existante' : 'Ajouter une note'}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M7 1.5V3.5M7 1.5C4 1.5 1.5 4 1.5 7C1.5 10 4 12.5 7 12.5C10 12.5 12.5 10 12.5 7C12.5 4 10 1.5 7 1.5Z"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        {hasNote ? (
          <path
            d="M4.5 7H9.5M4.5 9H8"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M7 5.5V8.5M5.5 7H8.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        )}
      </svg>
    </button>
  );
}
