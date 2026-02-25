import CustomLink from "@/components/CustomLink";

export default function StudentDashboardPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-lg p-12 text-center max-w-xl w-full border border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-semibold mb-3 dark:text-gray-200">
          Welcome back 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your dashboard modules and insights are being prepared.
        </p>
        <CustomLink
          href="/featured"
          className="inline-block bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-2 rounded-full font-medium hover:opacity-90 transition"
        >
          Explore Stays
        </CustomLink>
      </div>
    </div>
  );
}
