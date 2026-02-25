interface RoleCardProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
}

export default function RoleCard({ label, selected, onSelect }: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-xl border-2 bg-card p-6 text-left shadow-sm transition-all duration-200 hover:shadow-md ${selected
          ? "border-violet-500 ring-2 ring-violet-200 dark:ring-violet-900/30"
          : "border-border hover:border-violet-300 dark:hover:border-violet-700"
        }`}
    >
      <span className="font-semibold text-foreground">{label}</span>
    </button>
  );
}
