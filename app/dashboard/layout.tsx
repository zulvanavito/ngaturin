import { Sidebar, MobileHeader } from "@/components/sidebar";
import { DashboardTour } from "@/components/dashboard-tour";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex bg-[#FAFAFA] dark:bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header (Hidden on Desktop) */}
        <MobileHeader />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <DashboardTour />
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
            {children}
          </div>
          
          {/* Footer inside scroll area so it doesn't stick to bottom of screen permanently */}
          <footer className="py-6 mt-auto">
            <div className="max-w-6xl mx-auto px-6 text-center text-xs text-muted-foreground">
              &copy; 2026 Budggt. — Manage your finances beautifully.
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

