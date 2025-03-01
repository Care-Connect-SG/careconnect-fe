import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
// import { TopBar } from "@/components/ui/topbar"; // Import the named export TopBar component

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />

        <div className="flex flex-col flex-1 w-full">
          {/* <TopBar /> */}
          <main className="flex-1 overflow-auto w-full">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
