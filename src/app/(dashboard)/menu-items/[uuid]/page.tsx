import MenuItemDetailPage from "@/src/components/menu-management/MenuItemDetailPage";

export default async function MenuItemPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  return <MenuItemDetailPage uuid={uuid} />;
}
