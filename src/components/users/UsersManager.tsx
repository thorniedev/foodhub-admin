"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  Users,
} from "lucide-react";

import {
  useCreateAdminUserMutation,
  useDeleteAdminUserMutation,
  useGetAdminUsersQuery,
  useRestoreAdminUserMutation,
  useUpdateAdminUserStatusMutation,
} from "@/src/app/store/userProfileApi";
import type {
  AdminUser,
  CreateAdminUserPayload,
  MutableAdminUserStatus,
  UserStatusFilter,
} from "@/src/types/userProfile";

// import { getAdminApiErrorMessage } from "@/src/lib/adminApiError";

import DeleteUserConfirmModal from "./DeleteUserConfirmModal";
import UserCreateModal from "./UserCreateModal";
import UserEditModal from "./UserEditModal";
import UsersHeader from "./UsersHeader";
import UsersPagination from "./UsersPagination";
import UsersTable from "./UsersTable";
import UsersTabs from "./UsersTabs";
import { getAdminApiErrorMessage } from "@/src/lib/adminApiError";

type Notice =
  | { type: "success"; text: string }
  | { type: "error"; text: string }
  | null;

export default function UsersManager() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("ALL");

  const [createOpen, setCreateOpen] = useState(false);
  const [statusUser, setStatusUser] = useState<AdminUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
  const [recentlyDeleted, setRecentlyDeleted] = useState<AdminUser | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  const { data, error, isLoading, isFetching, refetch } =
    useGetAdminUsersQuery({
      page,
      size,
      sort: "createdAt,desc",
    });

  const [createAdminUser, { isLoading: creating }] =
    useCreateAdminUserMutation();
  const [updateStatus, { isLoading: updatingStatus }] =
    useUpdateAdminUserStatusMutation();
  const [deleteAdminUser, { isLoading: deleting }] =
    useDeleteAdminUserMutation();
  const [restoreAdminUser, { isLoading: restoring }] =
    useRestoreAdminUserMutation();

  const users = data?.contents ?? [];

  const counts = useMemo(
    () => ({
      all: users.length,
      active: users.filter((user) => user.status === "ACTIVE").length,
      suspended: users.filter((user) => user.status === "SUSPENDED").length,
      disabled: users.filter((user) => user.status === "DISABLED").length,
    }),
    [users],
  );

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const statusMatches =
        statusFilter === "ALL" || user.status === statusFilter;

      if (!statusMatches) return false;
      if (!query) return true;

      return [
        user.username,
        user.primaryEmail ?? "",
        user.firstName ?? "",
        user.lastName ?? "",
        user.uuid,
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [search, statusFilter, users]);

  const handleCreate = async (values: CreateAdminUserPayload) => {
    setNotice(null);

    try {
      await createAdminUser(values).unwrap();
      setCreateOpen(false);
      setPage(0);
      setNotice({
        type: "success",
        text: "បានបង្កើតអ្នកប្រើថ្មីដោយជោគជ័យ។",
      });
      await refetch();
    } catch (requestError) {
      setNotice({
        type: "error",
        text: getAdminApiErrorMessage(requestError),
      });
    }
  };

  const handleStatusUpdate = async (status: MutableAdminUserStatus) => {
    if (!statusUser) return;

    setNotice(null);

    try {
      await updateStatus({
        userUuid: statusUser.uuid,
        status,
      }).unwrap();

      setStatusUser(null);
      setNotice({
        type: "success",
        text: `បានប្តូរស្ថានភាពទៅ ${status} ដោយជោគជ័យ។`,
      });
      await refetch();
    } catch (requestError) {
      setNotice({
        type: "error",
        text: getAdminApiErrorMessage(requestError),
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;

    const target = deleteUser;
    setNotice(null);

    try {
      await deleteAdminUser(target.uuid).unwrap();

      setDeleteUser(null);
      setRecentlyDeleted(target);
      setNotice({
        type: "success",
        text: "បាន soft-delete អ្នកប្រើ។ អ្នកអាច Undo មុនពេលចាកចេញពីទំព័រនេះ។",
      });

      await refetch();
    } catch (requestError) {
      setNotice({
        type: "error",
        text: getAdminApiErrorMessage(requestError),
      });
    }
  };

  const handleUndoDelete = async () => {
    if (!recentlyDeleted) return;

    try {
      await restoreAdminUser(recentlyDeleted.uuid).unwrap();
      setRecentlyDeleted(null);
      setNotice({
        type: "success",
        text: "បាន Restore អ្នកប្រើដោយជោគជ័យ។",
      });
      await refetch();
    } catch (requestError) {
      setNotice({
        type: "error",
        text: getAdminApiErrorMessage(requestError),
      });
    }
  };

  const busy = creating || updatingStatus || deleting || restoring;

  return (
    <div className="space-y-5 p-4 sm:p-6 lg:p-7">
      <UsersHeader
        total={data?.totalElements ?? 0}
        activeCount={counts.active}
        suspendedCount={counts.suspended}
        onCreate={() => {
          setNotice(null);
          setCreateOpen(true);
        }}
      />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <UsersTabs
          value={statusFilter}
          counts={counts}
          onChange={(value) => {
            setStatusFilter(value);
          }}
        />

        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative block min-w-0 sm:w-[320px]">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ស្វែងរកឈ្មោះ, username, email..."
              className="h-11 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
            />
          </label>

          <select
            value={size}
            onChange={(event) => {
              setSize(Number(event.target.value));
              setPage(0);
            }}
            className="h-11 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-600 outline-none"
          >
            {[10, 20, 50].map((value) => (
              <option key={value} value={value}>
                {value} / ទំព័រ
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={isFetching}
            onClick={() => void refetch()}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={18} className={isFetching ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {notice && (
        <div
          className={`flex flex-col gap-3 rounded-2xl border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between ${
            notice.type === "success"
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : "border-red-100 bg-red-50 text-red-600"
          }`}
        >
          <span className="font-medium">{notice.text}</span>

          {notice.type === "success" && recentlyDeleted && (
            <button
              type="button"
              disabled={restoring}
              onClick={() => void handleUndoDelete()}
              className="inline-flex items-center gap-2 self-start rounded-xl bg-white px-3 py-2 font-bold text-[#137A3D] shadow-sm disabled:opacity-50"
            >
              {restoring ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RotateCcw size={16} />
              )}
              Undo / Restore
            </button>
          )}
        </div>
      )}

      <section className="overflow-hidden rounded-[26px] border border-gray-100 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.05)]">
        {isLoading ? (
          <div className="flex min-h-[360px] items-center justify-center">
            <Loader2 size={30} className="animate-spin text-[#137A3D]" />
          </div>
        ) : error ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <AlertTriangle size={38} className="text-red-400" />
            <h3 className="mt-4 text-xl font-black text-gray-800">
              មិនអាចទាញយកអ្នកប្រើប្រាស់បានទេ
            </h3>
            <p className="mt-2 max-w-lg text-sm leading-6 text-gray-500">
              {getAdminApiErrorMessage(error)}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-5 rounded-xl bg-[#137A3D] px-4 py-2.5 font-bold text-white"
            >
              សាកល្បងម្តងទៀត
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex min-h-[340px] flex-col items-center justify-center text-center">
            <Users size={42} className="text-gray-300" />
            <p className="mt-3 font-bold text-gray-600">មិនមានអ្នកប្រើត្រូវនឹង filter</p>
          </div>
        ) : (
          <UsersTable
            users={filteredUsers}
            disabled={busy}
            onStatusEdit={setStatusUser}
            onDelete={setDeleteUser}
          />
        )}

        {!isLoading && !error && (
          <UsersPagination
            page={data?.pageNumber ?? page}
            totalPages={data?.totalPages ?? 0}
            totalElements={data?.totalElements ?? 0}
            disabled={isFetching}
            onPageChange={setPage}
          />
        )}
      </section>

      <UserCreateModal
        open={createOpen}
        saving={creating}
        onClose={() => {
          if (!creating) setCreateOpen(false);
        }}
        onSubmit={handleCreate}
      />

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
        deleting={deleting}
        onClose={() => {
          if (!deleting) setDeleteUser(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
