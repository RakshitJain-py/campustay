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
      className={`rounded-xl border-2 bg-white p-6 text-left shadow-sm transition-all duration-200 hover:shadow-md ${
        selected
          ? "border-violet-500 ring-2 ring-violet-200"
          : "border-zinc-200 hover:border-violet-300"
      }`}
    >
      <span className="font-semibold text-zinc-900">{label}</span>
    </button>
  );
}
