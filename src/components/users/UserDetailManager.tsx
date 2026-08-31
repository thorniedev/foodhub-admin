"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";

import { useRouter } from "next/navigation";

import {
  useCreateAdminProfileMutation,
  useDeleteAdminProfileMutation,
  useGetAdminProfileQuery,
  useGetAdminUserProfilesQuery,
  useGetAdminUserQuery,
  useHardDeleteAdminProfileMutation,
  useHardDeleteAdminUserMutation,
  useRestoreAdminProfileMutation,
  useRestoreAdminUserMutation,
  useSetDefaultAdminProfileMutation,
  useUpdateAdminProfileMutation,
  useUpdateAdminUserStatusMutation,
} from "@/src/app/store/userProfileApi";

import type {
  AdminProfile,
  AdminProfileDetail,
  AdminUser,
  CreateAdminProfilePayload,
  MutableAdminUserStatus,
  ProfileStatusFilter,
  UpdateAdminProfilePayload,
} from "@/src/types/userProfile";

import { getAdminApiErrorMessage } from "@/src/lib/adminApiError";
import { displayName } from "@/src/lib/userProfileFormat";

import HardDeleteProfileConfirmModal from "./HardDeleteProfileConfirmModal";
import HardDeleteUserConfirmModal from "./HardDeleteUserConfirmModal";
import ProfileActionConfirmModal from "./ProfileActionConfirmModal";
import ProfileCreateModal from "./ProfileCreateModal";
import ProfileDetailPanel from "./ProfileDetailPanel";
import ProfileEditModal from "./ProfileEditModal";
import RelatedProfilesPanel from "./RelatedProfilesPanel";
import UserDetailHeader from "./UserDetailHeader";
import UserDetailSkeleton from "./UserDetailSkeleton";
import UserEditModal from "./UserEditModal";
import {
  removeDisabledUserCache,
} from "./disabledUserCache";

type Notice =
  | { type: "success"; text: string }
  | { type: "error"; text: string }
  | null;

export default function UserDetailManager({
  userUuid,
}: {
  userUuid: string;
}) {
  const router = useRouter();

  const [profileFilter, setProfileFilter] =
    useState<ProfileStatusFilter>("ALL");

  const [profilePage, setProfilePage] = useState(0);

  const [selectedProfileUuid, setSelectedProfileUuid] =
    useState<string | null>(null);

  const [statusUser, setStatusUser] =
    useState<AdminUser | null>(null);

  const [hardDeleteUser, setHardDeleteUser] =
    useState<AdminUser | null>(null);

  const [hardDeleteProfile, setHardDeleteProfile] =
    useState<AdminProfile | null>(null);

  const [createProfileOpen, setCreateProfileOpen] = useState(false);
  const [editProfile, setEditProfile] = useState<AdminProfile | null>(null);

  const [profileAction, setProfileAction] = useState<{
    action: "DELETE" | "RESTORE";
    profile: AdminProfile;
  } | null>(null);

  const [notice, setNotice] = useState<Notice>(null);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => {
      setNotice(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [notice]);

  const {
    data: user,
    error: userError,
    isLoading: userLoading,
    refetch: refetchUser,
  } = useGetAdminUserQuery(userUuid);

  const activeParam =
    profileFilter === "ACTIVE"
      ? true
      : profileFilter === "INACTIVE"
        ? false
        : undefined;

  const {
    data: profilePageData,
    error: profilesError,
    isLoading: profilesLoading,
    isFetching: profilesFetching,
    refetch: refetchProfiles,
  } = useGetAdminUserProfilesQuery({
    userUuid,
    active: activeParam,
    page: profilePage,
    size: 20,
    sort: "createdAt,desc",
  });

  const rawProfiles = profilePageData?.contents ?? [];

  // Default profile always first, then newly created profiles (createdAt descending)
  const visibleProfiles = useMemo(() => {
    return [...rawProfiles].sort((a, b) => {
      const aDefault = Boolean(a.isDefault);
      const bDefault = Boolean(b.isDefault);
      if (aDefault && !bDefault) return -1;
      if (!aDefault && bDefault) return 1;

      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [rawProfiles]);

  const effectiveProfilePageData = useMemo(() => {
    if (!profilePageData) return undefined;
    return {
      ...profilePageData,
      contents: visibleProfiles,
    };
  }, [profilePageData, visibleProfiles]);

  const effectiveSelectedProfileUuid =
    selectedProfileUuid &&
      visibleProfiles.some((profile) => profile.uuid === selectedProfileUuid)
      ? selectedProfileUuid
      : visibleProfiles[0]?.uuid ?? null;

  const {
    data: selectedProfile,
    error: profileError,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useGetAdminProfileQuery(effectiveSelectedProfileUuid ?? "", {
    skip: !effectiveSelectedProfileUuid,
  });

  const selectedProfileDetail: AdminProfileDetail | undefined = selectedProfile
    ? {
      ...selectedProfile,
      allergies: selectedProfile.allergies ?? [],
      dietaryTypes: selectedProfile.dietaryTypes ?? [],
      medicalConditions: selectedProfile.medicalConditions ?? [],
      ingredientAvoids: selectedProfile.ingredientAvoids ?? [],
      preferences: selectedProfile.preferences ?? null,
    }
    : undefined;

  const profileDetailLoading = profileLoading;

  const [updateStatus, { isLoading: updatingStatus }] =
    useUpdateAdminUserStatusMutation();

  const [hardDeleteAdminUser, { isLoading: hardDeletingUser }] =
    useHardDeleteAdminUserMutation();

  const [restoreAdminUser, { isLoading: restoringUser }] =
    useRestoreAdminUserMutation();

  const [createAdminProfile, { isLoading: creatingProfile }] =
    useCreateAdminProfileMutation();

  const [deleteAdminProfile, { isLoading: deletingProfile }] =
    useDeleteAdminProfileMutation();

  const [hardDeleteAdminProfile, { isLoading: hardDeletingProfile }] =
    useHardDeleteAdminProfileMutation();

  const [restoreAdminProfile, { isLoading: restoringProfile }] =
    useRestoreAdminProfileMutation();

  const [updateAdminProfile, { isLoading: updatingProfile }] =
    useUpdateAdminProfileMutation();

  const [setDefaultAdminProfile, { isLoading: settingDefault }] =
    useSetDefaultAdminProfileMutation();

  const handleCreateProfile = async (payload: CreateAdminProfilePayload) => {
    setNotice(null);
    try {
      const newProfile = await createAdminProfile({
        userUuid,
        body: payload,
      }).unwrap();

      if (newProfile?.uuid) {
        setSelectedProfileUuid(newProfile.uuid);
      }

      setNotice({
        type: "success",
        text: `បានបង្កើតប្រវត្តិរូប "${payload.profileName}" ដោយជោគជ័យ។`,
      });

      await refetchProfiles();
    } catch (requestError) {
      throw requestError;
    }
  };

  const handleProfileUpdate = async (payload: UpdateAdminProfilePayload) => {
    if (!editProfile) return;
    setNotice(null);
    try {
      await updateAdminProfile({
        profileUuid: editProfile.uuid,
        body: payload,
      }).unwrap();

      setNotice({
        type: "success",
        text: `បានកែប្រែព័ត៌មានប្រវត្តិរូប "${payload.profileName || editProfile.profileName}" ដោយជោគជ័យ។`,
      });

      setEditProfile(null);
      await Promise.all([refetchProfiles(), refetchProfile()]);
    } catch (requestError) {
      throw requestError;
    }
  };

  const handleSetDefaultProfile = async () => {
    if (!selectedProfileDetail) return;
    setNotice(null);
    try {
      await setDefaultAdminProfile(selectedProfileDetail.uuid).unwrap();
      setNotice({
        type: "success",
        text: `បានកំណត់ "${selectedProfileDetail.profileName}" ជាលំនាំដើម ដោយជោគជ័យ។`,
      });
      await Promise.all([refetchProfiles(), refetchProfile()]);
    } catch (requestError) {
      setNotice({
        type: "error",
        text: getAdminApiErrorMessage(requestError),
      });
    }
  };

  const handleStatusUpdate = async (
    status: MutableAdminUserStatus,
  ) => {
    if (!statusUser) {
      return;
    }

    try {
      await updateStatus({
        userUuid: statusUser.uuid,
        status,
      }).unwrap();

      setStatusUser(null);

      setNotice({
        type: "success",
        text: `បានប្តូរ User status ទៅ ${status}។`,
      });

      await refetchUser();
    } catch (requestError) {
      setNotice({
        type: "error",
        text: getAdminApiErrorMessage(requestError),
      });
    }
  };

  const handleHardDeleteUser = async () => {
    if (!hardDeleteUser) {
      return;
    }

    const target = hardDeleteUser;

    try {
      await hardDeleteAdminUser(target.uuid).unwrap();

      removeDisabledUserCache(target.uuid);
      setHardDeleteUser(null);

      setNotice({
        type: "success",
        text: "User ត្រូវបានលុបចេញពីប្រព័ន្ធដោយជោគជ័យ។ កំពុងត្រឡប់ទៅបញ្ជីអ្នកប្រើ...",
      });

      router.replace("/users");
      router.refresh();
    } catch (requestError) {
      setNotice({
        type: "error",
        text: getAdminApiErrorMessage(requestError),
      });
    }
  };

  const handleRestoreUser = async () => {
    if (!user) {
      return;
    }

    try {
      await restoreAdminUser(user.uuid).unwrap();

      removeDisabledUserCache(user.uuid);

      setNotice({
        type: "success",
        text: `គណនី "${displayName(
          user.firstName,
          user.lastName,
          user.username,
        )}" ត្រូវបានស្តារឡើងវិញដោយជោគជ័យ។`,
      });

      await refetchUser();
    } catch (requestError) {
      setNotice({
        type: "error",
        text: getAdminApiErrorMessage(requestError),
      });
    }
  };

  const handleHardDeleteProfile = async () => {
    if (!hardDeleteProfile) {
      return;
    }

    const target = hardDeleteProfile;

    try {
      await hardDeleteAdminProfile(target.uuid).unwrap();

      setHardDeleteProfile(null);
      setNotice({
        type: "success",
        text: `Profile "${target.profileName}" ត្រូវបានលុបចេញពីប្រព័ន្ធដោយជោគជ័យ។`,
      });

      setSelectedProfileUuid(null);
      await refetchProfiles();
    } catch (requestError) {
      setNotice({
        type: "error",
        text: getAdminApiErrorMessage(requestError),
      });
    }
  };

  const handleProfileAction = async () => {
    if (!profileAction) {
      return;
    }

    try {
      if (profileAction.action === "DELETE") {
        await deleteAdminProfile(profileAction.profile.uuid).unwrap();

        setNotice({
          type: "success",
          text: `Profile "${profileAction.profile.profileName}" ត្រូវបានផ្អាកដំណើរការដោយជោគជ័យ។`,
        });
      } else {
        await restoreAdminProfile(profileAction.profile.uuid).unwrap();

        setNotice({
          type: "success",
          text: `Profile "${profileAction.profile.profileName}" ត្រូវបានបើកដំណើរការឡើងវិញដោយជោគជ័យ។`,
        });
      }

      setProfileAction(null);
      await refetchProfiles();

      if (effectiveSelectedProfileUuid) {
        await refetchProfile();
      }
    } catch (requestError) {
      setNotice({
        type: "error",
        text: getAdminApiErrorMessage(requestError),
      });
    }
  };

  if (userLoading) {
    return <UserDetailSkeleton />;
  }

  if (userError || !user) {
    return (
      <div className="w-full min-w-0 max-w-full">
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-red-100 bg-white px-6 text-center">
          <AlertTriangle size={42} className="text-red-400" />

          <p className="mt-4 text-2xl font-medium text-gray-800">
            មិនអាចទាញយក User detail
          </p>

          <p className="mt-2 max-w-lg text-lg font-normal leading-relaxed text-gray-500">
            {getAdminApiErrorMessage(userError)}
          </p>
        </div>
      </div>
    );
  }

  const profileBusy =
    deletingProfile ||
    restoringProfile ||
    hardDeletingProfile ||
    settingDefault ||
    updatingProfile;
  const userBusy = updatingStatus || hardDeletingUser || restoringUser;

  return (
    <div className="w-full min-w-0 max-w-full space-y-5">
      <UserDetailHeader
        user={user}
        busy={userBusy}
        onCreateProfile={() => setCreateProfileOpen(true)}
        onStatusEdit={() => setStatusUser(user)}
        onHardDelete={() => setHardDeleteUser(user)}
        onRestore={handleRestoreUser}
      />

      {/* =================================================
          FLOATING TOAST NOTIFICATION
      ================================================== */}
      {notice && (
        <div className="fixed top-6 right-6 z-[9999] pointer-events-none flex max-w-md animate-in fade-in slide-in-from-top-5 duration-300">
          <div
            className={`pointer-events-auto flex items-center gap-3.5 rounded-3xl border px-5 py-4 shadow-2xl backdrop-blur-md transition-all ${notice.type === "success"
              ? "border-emerald-200 bg-white/95 text-emerald-950 shadow-emerald-500/10"
              : "border-red-200 bg-white/95 text-red-950 shadow-red-500/10"
              }`}
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${notice.type === "success"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-600"
                }`}
            >
              {notice.type === "success" ? (
                <CheckCircle2 size={24} />
              ) : (
                <AlertCircle size={24} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-medium leading-relaxed">
                {notice.text}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="cursor-pointer ml-2 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {profilesError && (
        <div className="rounded-3xl border border-red-100 bg-red-50 px-5 py-4 text-lg font-normal text-red-600">
          {getAdminApiErrorMessage(profilesError)}
        </div>
      )}

      <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(300px,360px)_minmax(0,1fr)]">
        <div className="min-w-0 xl:sticky xl:top-5">
          <RelatedProfilesPanel
            data={effectiveProfilePageData}
            loading={profilesLoading}
            fetching={profilesFetching}
            filter={profileFilter}
            selectedProfileUuid={effectiveSelectedProfileUuid}
            onFilterChange={(filter) => {
              setProfileFilter(filter);
              setProfilePage(0);
              setSelectedProfileUuid(null);
            }}
            onSelectProfile={setSelectedProfileUuid}
            onPageChange={setProfilePage}
          />
        </div>

        <ProfileDetailPanel
          profile={selectedProfileDetail}
          loading={profileDetailLoading}
          error={profileError}
          hasProfiles={visibleProfiles.length > 0}
          busy={profileBusy}
          onCreateProfile={() => setCreateProfileOpen(true)}
          onEdit={() => setEditProfile(selectedProfileDetail ?? null)}
          onSetDefault={handleSetDefaultProfile}
          onDelete={() => {
            if (selectedProfileDetail) {
              setProfileAction({
                action: "DELETE",
                profile: selectedProfileDetail,
              });
            }
          }}
          onHardDelete={() => {
            if (selectedProfileDetail) {
              setHardDeleteProfile(selectedProfileDetail);
            }
          }}
          onRestore={() => {
            if (selectedProfileDetail) {
              setProfileAction({
                action: "RESTORE",
                profile: selectedProfileDetail,
              });
            }
          }}
        />
      </div>

      <UserEditModal
        user={statusUser}
        saving={updatingStatus}
        onClose={() => {
          if (!updatingStatus) {
            setStatusUser(null);
          }
        }}
        onSubmit={handleStatusUpdate}
      />

      <HardDeleteUserConfirmModal
        user={hardDeleteUser}
        deleting={hardDeletingUser}
        onClose={() => {
          if (!hardDeletingUser) {
            setHardDeleteUser(null);
          }
        }}
        onConfirm={handleHardDeleteUser}
      />

      <HardDeleteProfileConfirmModal
        profile={hardDeleteProfile}
        deleting={hardDeletingProfile}
        onClose={() => {
          if (!hardDeletingProfile) {
            setHardDeleteProfile(null);
          }
        }}
        onConfirm={handleHardDeleteProfile}
      />

      <ProfileActionConfirmModal
        open={Boolean(profileAction)}
        action={profileAction?.action ?? "DELETE"}
        profileName={profileAction?.profile.profileName ?? ""}
        loading={profileBusy}
        onClose={() => {
          if (!profileBusy) {
            setProfileAction(null);
          }
        }}
        onConfirm={handleProfileAction}
      />

      <ProfileCreateModal
        open={createProfileOpen}
        saving={creatingProfile}
        onClose={() => {
          if (!creatingProfile) {
            setCreateProfileOpen(false);
          }
        }}
        onSubmit={handleCreateProfile}
      />

      <ProfileEditModal
        profile={editProfile}
        saving={updatingProfile}
        onClose={() => {
          if (!updatingProfile) {
            setEditProfile(null);
          }
        }}
        onSubmit={handleProfileUpdate}
      />
    </div>
  );
}
