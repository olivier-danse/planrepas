export function ShoppingListPage() {
  return (
    <div className="page-enter">
      <h1
        style={{
          fontFamily: 'var(--mp-font-display)',
          fontSize: '1.5rem',
          fontWeight: 600,
          marginBottom: '8px',
        }}
      >
        Liste de courses
      </h1>
      <p style={{ color: 'var(--mp-text-secondary)', fontSize: '0.875rem' }}>
        Synthèse des courses par catégorie
      </p>

      <div
        style={{
          marginTop: '24px',
          padding: '48px 24px',
          background: 'var(--mp-bg-subtle)',
          borderRadius: 'var(--mp-radius-lg)',
          border: '1px dashed var(--mp-border)',
          textAlign: 'center',
          color: 'var(--mp-text-muted)',
          fontSize: '0.875rem',
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🛒</div>
        La liste de courses apparaîtra ici.
        <br />
        <span style={{ fontSize: '0.75rem' }}>
          Étape 5 — Notes et liste de courses
        </span>
      </div>
    </div>
  );
}
