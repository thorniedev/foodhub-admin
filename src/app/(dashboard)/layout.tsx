
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="h-screen w-full overflow-hidden bg-gray-50 flex">
        <div className="h-screen shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 h-screen flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-5">{children}</main>
        </div>
      </div>
    </>
  );
}
