import {
  AlertTriangle,
  Loader2,
  Plus,
  User,
} from "lucide-react";

import type { AdminProfileDetail } from "@/src/types/userProfile";
import { getAdminApiErrorMessage } from "@/src/lib/adminApiError";

import AgeGroupSection from "./detail/AgeGroupSection";
import AllergiesSection from "./detail/AllergiesSection";
import BasicInfoSection from "./detail/BasicInfoSection";
import DietarySection from "./detail/DietarySection";
import MedicalConditionsSection from "./detail/MedicalConditionsSection";
import PreferencesSection from "./detail/PreferencesSection";
import ProfileHeader from "./detail/ProfileHeader";
import SystemInfoSection from "./detail/SystemInfoSection";

interface ProfileDetailPanelProps {
  profile: AdminProfileDetail | undefined;
  loading: boolean;
  error: unknown;
  hasProfiles?: boolean;
  safetyErrors?: {
    allergies?: unknown;
    dietaryTypes?: unknown;
    medicalConditions?: unknown;
  };
  busy?: boolean;
  onCreateProfile?: () => void;
  onEdit?: () => void;
  onSetDefault?: () => void;
  onDelete: () => void;
  onHardDelete?: () => void;
  onRestore: () => void;
}

export default function ProfileDetailPanel({
  profile,
  loading,
  error,
  hasProfiles = true,
  safetyErrors,
  busy = false,
  onCreateProfile,
  onEdit,
  onSetDefault,
  onDelete,
  onHardDelete,
  onRestore,
}: ProfileDetailPanelProps) {
  if (loading) {
    return (
      <section className="flex min-h-[520px] min-w-0 items-center justify-center rounded-2xl border border-gray-100 bg-white">
        <Loader2 size={30} className="animate-spin text-primary-800" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex min-h-[520px] min-w-0 flex-col items-center justify-center rounded-2xl border border-red-100 bg-white px-6 text-center">
        <AlertTriangle size={38} className="text-red-400" />

        <p className="mt-3 text-2xl font-semibold text-primary-800">
          មិនអាចផ្ទុកព័ត៌មានលម្អិតនៃ Profile បានទេ
        </p>

        <p className="mt-2 max-w-md text-lg leading-8 text-gray-500">
          {getAdminApiErrorMessage(error)}
        </p>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="flex min-h-[520px] min-w-0 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
          <User size={34} />
        </div>

        <p className="mt-4 text-2xl font-bold text-gray-800">
          {!hasProfiles
            ? "គណនីអ្នកប្រើប្រាស់នេះមិនទាន់មានកម្រងព័ត៌មាននៅឡើយទេ"
            : "ជ្រើសរើសកម្រងព័ត៌មានមួយ"}
        </p>

        <p className="mt-2 max-w-md text-base leading-7 text-gray-500">
          {!hasProfiles
            ? "កម្រងព័ត៌មាននឹងបង្ហាញនៅទីនេះ នៅពេលដែលគណនីអ្នកប្រើប្រាស់បង្កើតប្រវត្តិរូបក្នុងកម្មវិធី។"
            : "ចុចជ្រើសរើសកម្រងព័ត៌មាននៅខាងឆ្វេង ដើម្បីមើលព័ត៌មានលម្អិត។"}
        </p>

        {!hasProfiles && onCreateProfile && (
          <button
            type="button"
            onClick={onCreateProfile}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-primary-800 px-6 py-3 text-base font-bold text-white shadow-md shadow-primary-900/20 transition-all hover:bg-primary-900 hover:scale-[1.02] active:scale-95"
          >
            <Plus size={18} />
            បង្កើតកម្រងព័ត៌មានឥឡូវនេះ
          </button>
        )}
      </section>
    );
  }

  return (
    <div className="min-w-0 space-y-4">
      <ProfileHeader
        profile={profile}
        busy={busy}
        onEdit={onEdit}
        onSetDefault={onSetDefault}
        onDelete={onDelete}
        onHardDelete={onHardDelete}
        onបើកដំណើរការឡើងវិញ={onRestore}
      />

      <div className="grid min-w-0 gap-4 2xl:grid-cols-2">
        <BasicInfoSection profile={profile} />
        <AllergiesSection
          allergies={profile.allergies}
          error={safetyErrors?.allergies}
        />
        <DietarySection
          items={profile.dietaryTypes}
          error={safetyErrors?.dietaryTypes}
        />
        <MedicalConditionsSection
          items={profile.medicalConditions}
          error={safetyErrors?.medicalConditions}
        />
        <SystemInfoSection profile={profile} />
        <PreferencesSection preferences={profile.preferences} />
      </div>
    </div>
  );
}
