export default function Home() {
  return (
    <main
      style={{
        display: 'flex',
        minHeight: '100vh',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6rem 1.5rem',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1
          style={{
            fontSize: '2.25rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
          }}
        >
          営業日報システム
        </h1>
        <p
          style={{
            fontSize: '1.25rem',
            color: '#4b5563',
            marginBottom: '2rem',
          }}
        >
          Sales Daily Report System
        </p>
        <p
          style={{
            fontSize: '0.875rem',
            color: '#6b7280',
          }}
        >
          Powered by Next.js 16, React 19, and TypeScript
        </p>
      </div>
    </main>
  );
}
