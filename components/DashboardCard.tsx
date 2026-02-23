interface DashboardCardProps {
  title: string;
  value: string;
}

export default function DashboardCard({ title, value }: DashboardCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
      <p className="text-sm font-medium text-zinc-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
        {value}
      </p>
    </div>
  );
}
