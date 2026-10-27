const BITS = ['🎉', '✨', '☀️', '💪', '🔥', '🌟', '🎊', '😄'];

export default function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={i}
          className="absolute animate-float text-3xl"
          style={{ left: `${(i * 37) % 100}%`, bottom: `${10 + ((i * 53) % 40)}%`, animationDelay: `${(i % 6) * 0.12}s` }}
        >
          {BITS[i % BITS.length]}
        </span>
      ))}
    </div>
  );
}
