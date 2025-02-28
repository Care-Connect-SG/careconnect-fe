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
      <AppSidebar />
      <main className="w-full pt-14"> {/* Prevent content from being hidden under TopBar */}
        <TopBar /> {/* Add TopBar here */}
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
