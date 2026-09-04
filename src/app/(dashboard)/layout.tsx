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
      {/* `bg-canvas` sits one step below `bg-card`, so the cards inside read as
          raised. It was `bg-gray-50`, which pinned the shell to a light value
          regardless of theme. */}
      <div className="flex h-screen w-full overflow-hidden bg-canvas">
        <Sidebar />
        <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar />
          {/* The scrollbar is visible here now: this column can run several
              screens deep and the hidden bar removed the only cue for how far. */}
          <main className="flex-1 overflow-y-auto p-4">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}