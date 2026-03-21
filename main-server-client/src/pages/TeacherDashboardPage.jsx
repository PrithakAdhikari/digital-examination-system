import TeacherExaminationOverviewCard from "../components/dashboard/teacher/TeacherExaminationOverviewCard.jsx";
import TeacherUpcomingExaminationsCard from "../components/dashboard/teacher/TeacherUpcomingExaminationsCard.jsx";
import TeacherTopStudentsCard from "../components/dashboard/teacher/TeacherTopStudentsCard.jsx";
import TeacherAverageResultsTrendCard from "../components/dashboard/teacher/TeacherAverageResultsTrendCard.jsx";

export default function TeacherDashboardPage() {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good Morning" : currentHour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in px-2 md:px-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 md:py-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{greeting}, Teacher</h1>
          <p className="text-sm md:text-base text-base-content/50 mt-1 font-medium">Here is your assigned center and examination activity overview.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 h-full">
          <TeacherExaminationOverviewCard />
        </div>
        <div className="lg:col-span-1 h-full">
          <TeacherUpcomingExaminationsCard />
        </div>
        <div className="lg:col-span-1 h-full">
          <TeacherTopStudentsCard />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <TeacherAverageResultsTrendCard />
      </div>
    </div>
  );
}
