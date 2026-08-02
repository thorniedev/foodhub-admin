export default function HomeLayout({
  children,
  stats,
  growth,
  status,
  orders,
}: {
  children: React.ReactNode;
  stats: React.ReactNode;
  growth: React.ReactNode;
  status: React.ReactNode;
  orders: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-y-5">
      <div>{status}</div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 place-content-center">{growth}</div>
        {stats}
      </div>
      {orders}
      <div>{children}</div>
    </div>
  );
}
