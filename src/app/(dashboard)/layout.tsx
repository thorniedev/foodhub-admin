import { SidebarProvider } from "../../context/SidebarContext";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="h-screen w-full overflow-hidden bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 h-screen flex flex-col overflow-hidden min-w-0">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-4 ">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}