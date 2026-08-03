import { UserProfile } from "../../../types/userProfile";
import { calculateAge } from "../../../lib/age";
import { formatLongDate } from "../../../lib/formatDate";

const RELATIONSHIP_LABEL: Record<string, string> = {
  SELF: "ខ្លួនឯង",
  CHILD: "កូន",
  PARENT: "ឪពុកម្តាយ",
  SPOUSE: "ប្តី/ប្រពន្ធ",
  OTHER: "ផ្សេងៗ",
};

const GENDER_LABEL: Record<string, string> = {
  MALE: "ប្រុស",
  FEMALE: "ស្រី",
  OTHER: "ផ្សេងៗ",
};

const LANGUAGE_LABEL: Record<string, string> = {
  km: "ខ្មែរ",
  en: "English",
};

interface BasicInfoSectionProps {
  profile: UserProfile;
}

export default function BasicInfoSection({ profile }: BasicInfoSectionProps) {
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "លេខសម្គាល់ប្រវត្តិរូប", value: <code className="text-xs bg-gray-100 px-2 py-1 rounded">{profile.uuid}</code> },
    { label: "ឈ្មោះប្រវត្តិរូប", value: profile.profileName },
    { label: "ទំនាក់ទំនង", value: RELATIONSHIP_LABEL[profile.relationship] ?? profile.relationship },
    { label: "ភេទ", value: GENDER_LABEL[profile.gender] ?? profile.gender },
    { label: "ថ្ងៃខែឆ្នាំកំណើត", value: formatLongDate(profile.dateOfBirth) },
    { label: "អាយុបច្ចុប្បន្ន", value: `${calculateAge(profile.dateOfBirth)} ឆ្នាំ` },
    { label: "ភាសាដែលចូលចិត្ត", value: LANGUAGE_LABEL[profile.preferredLanguage] ?? profile.preferredLanguage },
    { label: "ប្រវត្តិរូបលំនាំដើម", value: profile.isDefault ? "បាទ/ចាស" : "ទេ" },
    { label: "ស្ថានភាព", value: profile.isActive ? "សកម្ម" : "អសកម្ម" },
  ];

  return (
    <div>
      <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3">ព័ត៌មានមូលដ្ឋាន</h3>
      <div className="divide-y divide-gray-50">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between py-2.5 text-sm gap-4">
            <span className="text-gray-500">{row.label}</span>
            <span className="text-gray-800 font-medium text-right">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}