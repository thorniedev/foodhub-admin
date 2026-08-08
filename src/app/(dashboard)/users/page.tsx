"use client";

import { useState } from "react";
import {
  useGetUserProfilesQuery,
  useDeleteUserProfileMutation,
  useToggleProfileActiveMutation,
  useUpdateUserProfileMutation,
} from "../../store/userProfileApi";
import { UserProfile } from "../../../types/userProfile";

import UsersHeader from "../../../components/users/UsersHeader";
import UsersTabs, { UserFilter } from "../../../components/users/UsersTabs";
import UsersTable from "../../../components/users/UsersTable";
import UsersPagination from "../../../components/users/UsersPagination";
import UserEditModal from "../../../components/users/UserEditModal";
import DeleteUserConfirmModal from "../../../components/users/DeleteUserConfirmModal";

const PAGE_SIZE = 8;

export default function UsersPage() {
  const { data: profiles = [] } = useGetUserProfilesQuery();
  const [updateUserProfile] = useUpdateUserProfileMutation();
  const [deleteUserProfile] = useDeleteUserProfileMutation();
  const [toggleActive] = useToggleProfileActiveMutation();

  const [tab, setTab] = useState<UserFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editProfile, setEditProfile] = useState<UserProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);

  const filtered = profiles.filter((p) => {
    if (tab === "active" && !p.isActive) return false;
    if (tab === "inactive" && p.isActive) return false;
    return p.profileName.toLowerCase().includes(search.toLowerCase());
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <UsersHeader
        total={profiles.length}
        filteredCount={filtered.length}
        onAddNew={() => {}}
      />
      <UsersTabs
        data={profiles}
        activeTab={tab}
        onTabChange={(t) => {
          setTab(t);
          setPage(1);
        }}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
      />
      <UsersTable
        profiles={paged}
        onEdit={setEditProfile}
        onDelete={setDeleteTarget}
        onToggleStatus={(p) => toggleActive(p.uuid)}
      />
      <UsersPagination
        total={filtered.length}
        shown={paged.length}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <UserEditModal
        open={!!editProfile}
        initialData={editProfile}
        onClose={() => setEditProfile(null)}
        onSubmit={(uuid, changes) => {
          updateUserProfile({ uuid, changes });
          setEditProfile(null);
        }}
      />
      <DeleteUserConfirmModal
        open={!!deleteTarget}
        profileName={deleteTarget?.profileName ?? ""}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteUserProfile(deleteTarget.uuid);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
