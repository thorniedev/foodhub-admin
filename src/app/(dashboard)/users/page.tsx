"use client";

import { useMemo, useState } from "react";
import {
  useDeleteUserMutation,
  useGetUsersQuery,
  useToggleUserStatusMutation,
  useUpdateUserMutation,
} from "../../store/userApi";
import { User } from "../../../types/user";
import UsersHeader from "../../../components/users/UsersHeader";
import UsersTabs, { UserFilter } from "../../../components/users/UsersTabs";
import UsersTable from "../../../components/users/UsersTable";
import UsersPagination from "../../../components/users/UsersPagination";
import UserEditModal from "../../../components/users/UserEditModal";
import DeleteUserConfirmModal from "../../../components/users/DeleteUserConfirmModal";

const PAGE_SIZE = 10;

export default function UsersPage() {
  const { data, isLoading } = useGetUsersQuery();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [toggleStatus] = useToggleUserStatusMutation();

  const [activeTab, setActiveTab] = useState<UserFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const allData: User[] = data ?? [];

  const filtered = useMemo(() => {
    return allData.filter((user) => {
      const matchesTab = activeTab === "all" || user.status === activeTab;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        query === "" ||
        user.name.toLowerCase().includes(query) ||
        user.phone.includes(query) ||
        user.email.toLowerCase().includes(query);
      return matchesTab && matchesSearch;
    });
  }, [allData, activeTab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAddNew = () => {
    // Wire this to a create form/route once you have one, similar to
    // /dashboard/shops/create — tell me if you want that scaffolded too.
    console.log("add new user");
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (id: string, changes: Partial<User>) => {
    await updateUser({ id, changes });
    setEditModalOpen(false);
    setEditingUser(null);
  };

  const handleDelete = (user: User) => {
    setDeletingUser(user);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    await deleteUser(deletingUser.id);
    setDeleteModalOpen(false);
    setDeletingUser(null);
  };

  const handleToggleStatus = async (user: User) => {
    await toggleStatus(user.id);
  };

  if (isLoading || !data) return null;

  return (
    <div className="p-6">
      <UsersHeader
        total={allData.length}
        filteredCount={filtered.length}
        onAddNew={handleAddNew}
      />

      <UsersTabs
        data={allData}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setPage(1);
        }}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
      />

      <UsersTable
        users={paginated}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      <UsersPagination
        total={filtered.length}
        shown={paginated.length}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <UserEditModal
        open={editModalOpen}
        initialData={editingUser}
        onClose={() => {
          setEditModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleEditSubmit}
      />

      <DeleteUserConfirmModal
        open={deleteModalOpen}
        userName={deletingUser?.name ?? ""}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeletingUser(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}