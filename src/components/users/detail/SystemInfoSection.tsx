import { UserProfile } from "../../../types/userProfile";
import { formatDateTime } from "../../../lib/formatDate";

interface SystemInfoSectionProps {
  profile: UserProfile;
}

export default function SystemInfoSection({ profile }: SystemInfoSectionProps) {
  return (
    <div className="border-t border-gray-100 pt-4 mt-2 space-y-1.5 text-xs text-gray-400">
      <p>បង្កើតនៅ: {formatDateTime(profile.createdAt)}</p>
      <p>កែប្រែចុងក្រោយ: {formatDateTime(profile.updatedAt)}</p>
      <p>លេខសម្គាល់រូបភាព: {profile.avatarMediaUuid ?? "មិនមាន"}</p>
      <p>លេខសម្គាល់ប្រវត្តិរូប: {profile.uuid}</p>
    </div>
  );
}