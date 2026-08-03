import { UserProfile } from "../../types/userProfile";
import { calculateAge } from "../../lib/age";

const RELATIONSHIP_LABEL: Record<string, string> = {
  SELF: "ខ្លួនឯង",
  CHILD: "កូន",
  PARENT: "ឪពុកម្តាយ",
  SPOUSE: "ប្តី/ប្រពន្ធ",
  OTHER: "ផ្សេងៗ",
};

interface RelatedProfilesPanelProps {
  profiles: UserProfile[];
  activeUuid: string;
  onSelect: (profile: UserProfile) => void;
}

export default function RelatedProfilesPanel({
  profiles,
  activeUuid,
  onSelect,
}: RelatedProfilesPanelProps) {
  const others = profiles.filter((p) => p.uuid !== activeUuid);

  return (
    <div>
      <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3">
        {profiles.length} ប្រវត្តិរូប
      </h3>
      <div className="space-y-3">
        {others.map((p) => (
          <button
            key={p.uuid}
            onClick={() => onSelect(p)}
            className="w-full text-left bg-white border border-gray-100 rounded-xl p-3 flex gap-3 items-center hover:border-emerald-200 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold shrink-0">
              {p.profileName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-800 truncate">{p.profileName}</p>
              <p className="text-xs text-gray-400">
                អាយុ {calculateAge(p.dateOfBirth)} • {p.ageGroup.name}
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {RELATIONSHIP_LABEL[p.relationship] ?? p.relationship}
                </span>
                {p.dietaryTypes[0] && (
                  <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                    {p.dietaryTypes[0].name}
                  </span>
                )}
                {p.allergies[0] && (
                  <span className="text-[10px] font-medium bg-red-50 text-red-500 px-2 py-0.5 rounded-full">
                    {p.allergies[0].name}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
        {others.length === 0 && (
          <p className="text-sm text-gray-400">មិនមានប្រវត្តិរូបផ្សេងទៀត</p>
        )}
      </div>
    </div>
  );
}