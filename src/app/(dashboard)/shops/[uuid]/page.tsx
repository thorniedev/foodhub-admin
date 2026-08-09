// import ShopDetailManager from "@/src/components/shops/ShopDetailManager";

// export default async function ShopDetailPage({
//   params,
// }: {
//   params: Promise<{ uuid: string }>;
// }) {
//   const { uuid } = await params;
//   return <ShopDetailManager storeUuid={uuid} />;
// }
import ShopDetailManager from "@/src/components/shops/ShopDetailManager";

export default async function ShopDetailPage({
  params,
}: {
  params: Promise<{
    uuid: string;
  }>;
}) {
  const { uuid } = await params;

  return (
    <ShopDetailManager
      storeUuid={uuid}
    />
  );
}