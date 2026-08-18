import MenuItemDetailPage from "@/src/components/menu-management/MenuItemDetailPage";

export default async function MenuItemDetailRoute({
  params,
}: {
  params: Promise<{
    uuid: string;
  }>;
}) {
  const { uuid } = await params;

  return <MenuItemDetailPage uuid={uuid} />;
}
