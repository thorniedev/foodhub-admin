"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  useDeleteAdminProfileMutation,
  useDeleteAdminUserMutation,
  useGetAdminProfileQuery,
  useGetAdminUserProfilesQuery,
  useGetAdminUserQuery,
  useRestoreAdminProfileMutation,
  useRestoreAdminUserMutation,
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

  const [statusUser, setStatusUser] = useState<AdminUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
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
  const [restoreAdminUser, { isLoading: restoringUser }] =
    useRestoreAdminUserMutation();
  const [deleteAdminProfile, { isLoading: deletingProfile }] =
    useDeleteAdminProfileMutation();
  const [restoreAdminProfile, { isLoading: restoringProfile }] =
    useRestoreAdminProfileMutation();

  const handleStatusUpdate = async (status: MutableAdminUserStatus) => {
    if (!statusUser) return;

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
    if (!deleteUser) return;

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

  const handleProfileAction = async () => {
    if (!profileAction) return;

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
        <Loader2 size={34} className="animate-spin text-[#137A3D]" />
      </div>
    );
  }

  if (userError || !user) {
    return (
      <div className="p-5 sm:p-7">
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-red-100 bg-white px-6 text-center">
          <AlertTriangle size={42} className="text-red-400" />
          <h1 className="mt-4 text-xl font-black text-gray-800">
            មិនអាចទាញយក User detail
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-6 text-gray-500">
            {getAdminApiErrorMessage(userError)}
          </p>
        </div>
      </div>
    );
  }

  const profileBusy = deletingProfile || restoringProfile;
  const userBusy =
    updatingStatus || deletingUser || restoringUser;

  return (
    <div className="space-y-5 p-4 sm:p-6 lg:p-7">
      <UserDetailHeader
        user={user}
        busy={userBusy}
        onStatusEdit={() => setStatusUser(user)}
        onDelete={() => setDeleteUser(user)}
      />

      {notice && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
            notice.type === "success"
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : "border-red-100 bg-red-50 text-red-600"
          }`}
        >
          {notice.text}
        </div>
      )}

      {profilesError && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {getAdminApiErrorMessage(profilesError)}
        </div>
      )}

      <div className="grid items-start gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="xl:sticky xl:top-5">
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
          if (!updatingStatus) setStatusUser(null);
        }}
        onSubmit={handleStatusUpdate}
      />

      <DeleteUserConfirmModal
        user={deleteUser}
        deleting={deletingUser}
        onClose={() => {
          if (!deletingUser) setDeleteUser(null);
        }}
        onConfirm={handleDeleteUser}
      />

      <ProfileActionConfirmModal
        open={Boolean(profileAction)}
        action={profileAction?.action ?? "DELETE"}
        profileName={profileAction?.profile.profileName ?? ""}
        loading={profileBusy}
        onClose={() => {
          if (!profileBusy) setProfileAction(null);
        }}
        onConfirm={handleProfileAction}
      />
    </div>
  );
}
