import ExaminationOverviewCard from "../components/dashboard/ExaminationOverviewCard.jsx";
import UserStatsCard from "../components/dashboard/UserStatsCard.jsx";
import TopStudentsCard from "../components/dashboard/TopStudentsCard.jsx";
import ExamsCreatedChartCard from "../components/dashboard/ExamsCreatedChartCard.jsx";
import AverageScoreCard from "../components/dashboard/AverageScoreCard.jsx";

export default function DashboardPage() {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good Morning" : currentHour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in px-2 md:px-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 md:py-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{greeting}, Admin</h1>
          <p className="text-sm md:text-base text-base-content/50 mt-1 font-medium">Here's what's happening today in the Digital Exam System.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 h-full">
          <ExaminationOverviewCard />
        </div>
        <div className="lg:col-span-1 h-full">
          <UserStatsCard />
        </div>
        <div className="lg:col-span-1 h-full">
          <TopStudentsCard />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExamsCreatedChartCard />
        <AverageScoreCard />
      </div>
    </div>
  );
}
