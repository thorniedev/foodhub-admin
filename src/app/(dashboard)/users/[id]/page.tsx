import UserDetailManager from "@/src/components/users/UserDetailManager";

interface UserDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UserDetailPage({
  params,
}: UserDetailPageProps) {
  const { id } = await params;

  return <UserDetailManager userUuid={id} />;
}
