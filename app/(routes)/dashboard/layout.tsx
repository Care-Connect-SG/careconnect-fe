import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TopBar } from "@/components/ui/topbar"; // Import the named export TopBar component

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full"> {/* Ensure full width */}
        {/* Sidebar */}
        <AppSidebar className="flex-shrink-0" />
  
        {/* Main Content */}
        <div className="flex flex-col flex-1 w-full"> {/* Ensures content takes full width */}
          <TopBar /> {/* TopBar inside the main content */}
          <main className="flex-1 overflow-auto w-full">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
  