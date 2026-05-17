export default function AmbientBlobs() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="ambient-blob a"
        style={{
          top: '10%',
          left: '8%',
          width: 420,
          height: 420,
          background: 'radial-gradient(circle, var(--accent-glow), transparent 70%)',
        }}
      />
      <div
        className="ambient-blob b"
        style={{
          bottom: '5%',
          right: '6%',
          width: 360,
          height: 360,
          background: 'radial-gradient(circle, var(--accent-2-glow), transparent 70%)',
        }}
      />
    </div>
  )
}
