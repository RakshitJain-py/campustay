interface FeatureCardProps {
  icon: React.ReactNode;
  heading: string;
  description: string;
  onClick?: () => void;
}

export default function FeatureCard({
  icon,
  heading,
  description,
  onClick,
}: FeatureCardProps) {
  const content = (
    <>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{heading}</h3>
      <p className="mt-2 text-sm leading-relaxed text-foreground/70">{description}</p>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full rounded-xl border border-border bg-card p-6 text-left shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-violet-500"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {content}
    </div>
  );
}
