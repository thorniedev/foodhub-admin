import React from "react";
import SessionDetailPage from "@/src/components/recommendations/SessionDetailPage";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export default async function AdminRecommendationSessionPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <SessionDetailPage uuid={resolvedParams.uuid} />;
}
