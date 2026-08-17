import {
  AlertTriangle,
  Loader2,
  User,
} from "lucide-react";

import type { AdminProfile } from "@/src/types/userProfile";
import { getAdminApiErrorMessage } from "@/src/lib/adminApiError";

import AgeGroupSection from "./detail/AgeGroupSection";
import AllergiesSection from "./detail/AllergiesSection";
import BasicInfoSection from "./detail/BasicInfoSection";
import DietarySection from "./detail/DietarySection";
import IngredientAvoidsSection from "./detail/IngredientAvoidsSection";
import MedicalConditionsSection from "./detail/MedicalConditionsSection";
import PreferencesSection from "./detail/PreferencesSection";
import ProfileHeader from "./detail/ProfileHeader";
import SystemInfoSection from "./detail/SystemInfoSection";

interface ProfileDetailPanelProps {
  profile: AdminProfile | undefined;
  loading: boolean;
  error: unknown;
  busy?: boolean;
  onDelete: () => void;
  onHardDelete?: () => void;
  onRestore: () => void;
}

export default function ProfileDetailPanel({
  profile,
  loading,
  error,
  busy = false,
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
          មិនអាចផ្ទុក Profile detail
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
        <User size={42} className="text-gray-300" />

        <p className="mt-3 text-2xl font-semibold text-primary-800">
          ជ្រើសរើស Profile មួយ
        </p>

        <p className="mt-2 text-lg text-gray-400">
          ចុច Profile ខាងឆ្វេង ដើម្បីទាញយក safety detail ពី API ពិត។
        </p>
      </section>
    );
  }

  return (
    <div className="min-w-0 space-y-4">
      <ProfileHeader
        profile={profile}
        busy={busy}
        onDelete={onDelete}
        onHardDelete={onHardDelete}
        onRestore={onRestore}
      />

      <div className="grid min-w-0 gap-4 2xl:grid-cols-2">
        <BasicInfoSection profile={profile} />
        <AgeGroupSection profile={profile} />
        <AllergiesSection allergies={profile.allergies ?? []} />
        <DietarySection items={profile.dietaryTypes ?? []} />
        <MedicalConditionsSection items={profile.medicalConditions ?? []} />
        <IngredientAvoidsSection items={profile.ingredientAvoids ?? []} />
        <PreferencesSection preferences={profile.preferences ?? null} />
        <SystemInfoSection profile={profile} />
      </div>
    </div>
  );
}
