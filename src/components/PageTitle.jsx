export default function PageTitle({ title, emoji, subtitle }) {
  return (
    <header className="mb-8 animate-rise">
      <h1 className="text-4xl font-bold tracking-tight">
        {title} <span className="ml-1">{emoji}</span>
      </h1>
      {subtitle && <p className="mt-2 text-lg text-muted">{subtitle}</p>}
    </header>
  );
}
