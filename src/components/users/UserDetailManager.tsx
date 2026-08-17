"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  Loader2,
} from "lucide-react";

import { useRouter } from "next/navigation";

import {
  useDeleteAdminProfileMutation,
  useDeleteAdminUserMutation,
  useGetAdminProfileQuery,
  useGetAdminUserProfilesQuery,
  useGetAdminUserQuery,
  useHardDeleteAdminProfileMutation,
  useHardDeleteAdminUserMutation,
  useRestoreAdminProfileMutation,
  useUpdateAdminUserStatusMutation,
} from "@/src/app/store/userProfileApi";

import type {
  AdminProfile,
  AdminUser,
  MutableAdminUserStatus,
  ProfileStatusFilter,
} from "@/src/types/userProfile";

import { getAdminApiErrorMessage } from "@/src/lib/adminApiError";

import DeleteUserConfirmModal from "./DeleteUserConfirmModal";
import HardDeleteProfileConfirmModal from "./HardDeleteProfileConfirmModal";
import HardDeleteUserConfirmModal from "./HardDeleteUserConfirmModal";
import ProfileActionConfirmModal from "./ProfileActionConfirmModal";
import ProfileDetailPanel from "./ProfileDetailPanel";
import RelatedProfilesPanel from "./RelatedProfilesPanel";
import UserDetailHeader from "./UserDetailHeader";
import UserEditModal from "./UserEditModal";

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

  const [deleteUser, setDeleteUser] =
    useState<AdminUser | null>(null);

  const [hardDeleteUser, setHardDeleteUser] =
    useState<AdminUser | null>(null);

  const [hardDeleteProfile, setHardDeleteProfile] =
    useState<AdminProfile | null>(null);

  const [profileAction, setProfileAction] = useState<{
    action: "DELETE" | "RESTORE";
    profile: AdminProfile;
  } | null>(null);

  const [notice, setNotice] = useState<Notice>(null);

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

  useEffect(() => {
    const profiles = profilePageData?.contents ?? [];

    if (profiles.length === 0) {
      setSelectedProfileUuid(null);
      return;
    }

    const selectionStillVisible = profiles.some(
      (profile) => profile.uuid === selectedProfileUuid,
    );

    if (!selectedProfileUuid || !selectionStillVisible) {
      setSelectedProfileUuid(profiles[0].uuid);
    }
  }, [profilePageData, selectedProfileUuid]);

  const {
    data: selectedProfile,
    error: profileError,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useGetAdminProfileQuery(selectedProfileUuid ?? "", {
    skip: !selectedProfileUuid,
  });

  const [updateStatus, { isLoading: updatingStatus }] =
    useUpdateAdminUserStatusMutation();

  const [deleteAdminUser, { isLoading: deletingUser }] =
    useDeleteAdminUserMutation();

  const [hardDeleteAdminUser, { isLoading: hardDeletingUser }] =
    useHardDeleteAdminUserMutation();

  const [deleteAdminProfile, { isLoading: deletingProfile }] =
    useDeleteAdminProfileMutation();

  const [hardDeleteAdminProfile, { isLoading: hardDeletingProfile }] =
    useHardDeleteAdminProfileMutation();

  const [restoreAdminProfile, { isLoading: restoringProfile }] =
    useRestoreAdminProfileMutation();

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

  const handleDeleteUser = async () => {
    if (!deleteUser) {
      return;
    }

    const target = deleteUser;

    try {
      await deleteAdminUser(target.uuid).unwrap();

      setDeleteUser(null);

      setNotice({
        type: "success",
        text: "User ត្រូវបាន soft-delete។ កំពុងត្រឡប់ទៅ User list...",
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

  const handleHardDeleteUser = async () => {
    if (!hardDeleteUser) {
      return;
    }

    const target = hardDeleteUser;

    try {
      await hardDeleteAdminUser(target.uuid).unwrap();

      setHardDeleteUser(null);

      setNotice({
        type: "success",
        text: "User ត្រូវបាន hard-delete ជាអចិន្ត្រៃយ៍។ កំពុងត្រឡប់ទៅ User list...",
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
        text: `Profile "${target.profileName}" ត្រូវបានលុបជាអចិន្ត្រៃយ៍។`,
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
          text: "Profile ត្រូវបាន soft-delete ដោយជោគជ័យ។",
        });
      } else {
        await restoreAdminProfile(profileAction.profile.uuid).unwrap();

        setNotice({
          type: "success",
          text: "Profile ត្រូវបាន Restore ដោយជោគជ័យ។",
        });
      }

      setProfileAction(null);
      await refetchProfiles();

      if (selectedProfileUuid) {
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
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <Loader2 size={34} className="animate-spin text-primary-700" />
      </div>
    );
  }

  if (userError || !user) {
    return (
      <div className="w-full min-w-0 max-w-full">
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-red-100 bg-white px-6 text-center">
          <AlertTriangle size={42} className="text-red-400" />

          <p className="mt-4 text-xl font-bold text-gray-800">
            មិនអាចទាញយក User detail
          </p>

          <p className="mt-2 max-w-lg text-base leading-7 text-gray-500">
            {getAdminApiErrorMessage(userError)}
          </p>
        </div>
      </div>
    );
  }

  const profileBusy = deletingProfile || restoringProfile || hardDeletingProfile;
  const userBusy = updatingStatus || deletingUser || hardDeletingUser;

  return (
    <div className="w-full min-w-0 max-w-full space-y-5">
      <UserDetailHeader
        user={user}
        busy={userBusy}
        onStatusEdit={() => setStatusUser(user)}
        onDelete={() => setDeleteUser(user)}
        onHardDelete={() => setHardDeleteUser(user)}
      />

      {notice && (
        <div
          className={`rounded-2xl border px-4 py-3 text-base ${
            notice.type === "success"
              ? "border-primary-100 bg-primary-50 text-primary-700"
              : "border-red-100 bg-red-50 text-red-600"
          }`}
        >
          {notice.text}
        </div>
      )}

      {profilesError && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-base text-red-600">
          {getAdminApiErrorMessage(profilesError)}
        </div>
      )}

      <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(300px,360px)_minmax(0,1fr)]">
        <div className="min-w-0 xl:sticky xl:top-5">
          <RelatedProfilesPanel
            data={profilePageData}
            loading={profilesLoading}
            fetching={profilesFetching}
            filter={profileFilter}
            selectedProfileUuid={selectedProfileUuid}
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
          profile={selectedProfile}
          loading={profileLoading}
          error={profileError}
          busy={profileBusy}
          onDelete={() => {
            if (selectedProfile) {
              setProfileAction({
                action: "DELETE",
                profile: selectedProfile,
              });
            }
          }}
          onHardDelete={() => {
            if (selectedProfile) {
              setHardDeleteProfile(selectedProfile);
            }
          }}
          onRestore={() => {
            if (selectedProfile) {
              setProfileAction({
                action: "RESTORE",
                profile: selectedProfile,
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

      <DeleteUserConfirmModal
        user={deleteUser}
        deleting={deletingUser}
        onClose={() => {
          if (!deletingUser) {
            setDeleteUser(null);
          }
        }}
        onConfirm={handleDeleteUser}
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
    </div>
  );
}
