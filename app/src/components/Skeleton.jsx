export function SkeletonCard({ lines = 1 }) {
  return (
    <div className="skeleton-card">
      <div className="skeleton-line" style={{ width: "40%" }} />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton-line"
          style={{ width: `${60 + Math.random() * 35}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonTree({ count = 6 }) {
  return (
    <div className="skeleton-tree">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton-tree-item"
          style={{
            marginLeft: (i % 3) * 14,
            width: `${50 + Math.random() * 40}%`,
            height: 12,
            borderRadius: 4,
            background: "var(--border)",
            animation: "pulse 1.5s ease-in-out infinite",
            opacity: 1 - i * 0.08,
          }}
        />
      ))}
    </div>
  );
}
