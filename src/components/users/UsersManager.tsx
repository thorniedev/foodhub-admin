"use client";

import { useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  ArrowUpDown,
  Check,
  ChevronDown,
  Loader2,
  RotateCcw,
  Search,
  UserRound,
  Users,
  X,
} from "lucide-react";

import {
  useCreateAdminUserMutation,
  useDeleteAdminUserMutation,
  useGetAdminUsersQuery,
  useHardDeleteAdminUserMutation,
  useRestoreAdminUserMutation,
  useUpdateAdminUserStatusMutation,
} from "@/src/app/store/userProfileApi";

import type {
  AdminUser,
  CreateAdminUserPayload,
  MutableAdminUserStatus,
  UserStatusFilter,
} from "@/src/types/userProfile";

import { displayName } from "@/src/lib/userProfileFormat";
import { getAdminApiErrorMessage } from "@/src/lib/adminApiError";

import DeleteUserConfirmModal from "./DeleteUserConfirmModal";
import HardDeleteUserConfirmModal from "./HardDeleteUserConfirmModal";
import UserCreateModal from "./UserCreateModal";
import UserEditModal from "./UserEditModal";
import UsersHeader from "./UsersHeader";
import UsersPagination from "./UsersPagination";
import UsersTable from "./UsersTable";
import UsersTabs from "./UsersTabs";
import {
  mergeUsersWithDisabledCache,
  readDisabledUserCache,
  writeDisabledUserCache,
} from "./disabledUserCache";

type Notice =
  | {
      type: "success";
      text: string;
    }
  | {
      type: "error";
      text: string;
    }
  | null;

type UserSort = "A_Z" | "Z_A" | "NEWEST" | "OLDEST";

export default function UsersManager() {
  /* =======================================================
     PAGINATION
  ======================================================= */

  const [page, setPage] = useState(0);

  const [size, setSize] = useState(20);

  const [sizeOpen, setSizeOpen] = useState(false);

  /* =======================================================
     SEARCH
  ======================================================= */

  const [search, setSearch] = useState("");

  const [showSuggestions, setShowSuggestions] = useState(false);

  /* =======================================================
     FILTER
  ======================================================= */

  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("ALL");

  /* =======================================================
     SORT
  ======================================================= */

  const [sortBy, setSortBy] = useState<UserSort>("NEWEST");

  const [sortOpen, setSortOpen] = useState(false);

  /* =======================================================
     MODALS / NOTICE
  ======================================================= */

  const [createOpen, setCreateOpen] = useState(false);

  const [statusUser, setStatusUser] = useState<AdminUser | null>(null);

  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);

  const [hardDeleteUser, setHardDeleteUser] = useState<AdminUser | null>(null);

  const [recentlyDeleted, setRecentlyDeleted] = useState<AdminUser | null>(
    null,
  );

  const [locallyDisabledUsers, setLocallyDisabledUsers] = useState<AdminUser[]>(
    [],
  );

  const [disabledCacheReady, setDisabledCacheReady] = useState(false);

  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    setLocallyDisabledUsers(readDisabledUserCache());
    setDisabledCacheReady(true);
  }, []);

  useEffect(() => {
    if (!disabledCacheReady) {
      return;
    }

    writeDisabledUserCache(locallyDisabledUsers);
  }, [disabledCacheReady, locallyDisabledUsers]);

  /* =======================================================
     MAIN QUERY
  ======================================================= */

  const { data, error, isLoading, isFetching, refetch } = useGetAdminUsersQuery(
    {
      page,
      size,
      sort: "createdAt,desc",
    },
  );

  /* =======================================================
     SUGGESTION DATA

     Current API usage has no search query argument here,
     so this keeps the existing backend contract unchanged
     and uses a larger client-side dataset for suggestions.
  ======================================================= */

  const { data: suggestionData } = useGetAdminUsersQuery({
    page: 0,
    size: 100,
    sort: "createdAt,desc",
  });

  /* =======================================================
     MUTATIONS
  ======================================================= */

  const [createAdminUser, { isLoading: creating }] =
    useCreateAdminUserMutation();

  const [updateStatus, { isLoading: updatingStatus }] =
    useUpdateAdminUserStatusMutation();

  const [deleteAdminUser, { isLoading: deleting }] =
    useDeleteAdminUserMutation();

  const [hardDeleteAdminUser, { isLoading: hardDeleting }] =
    useHardDeleteAdminUserMutation();

  const [restoreAdminUser, { isLoading: restoring }] =
    useRestoreAdminUserMutation();

  /* =======================================================
     DATA
  ======================================================= */

  const apiUsers = data?.contents ?? [];

  const apiSuggestionUsers = suggestionData?.contents ?? [];

  /*
   * The backend may hide soft-disabled users from the normal users list.
   * Keep a small admin-side cache so they remain visible in the Disabled tab
   * and can still be restored from this browser.
   */
  const users = useMemo(
    () => mergeUsersWithDisabledCache(apiUsers, locallyDisabledUsers),
    [apiUsers, locallyDisabledUsers],
  );

  const suggestionUsers = useMemo(
    () => mergeUsersWithDisabledCache(apiSuggestionUsers, locallyDisabledUsers),
    [apiSuggestionUsers, locallyDisabledUsers],
  );

  useEffect(() => {
    if (!disabledCacheReady || apiUsers.length === 0) {
      return;
    }

    const visibleActiveUserIds = new Set(
      apiUsers
        .filter(
          (user) => user.status !== "DISABLED" && user.status !== "DELETED",
        )
        .map((user) => user.uuid),
    );

    if (visibleActiveUserIds.size === 0) {
      return;
    }

    setLocallyDisabledUsers((current) =>
      current.filter((user) => !visibleActiveUserIds.has(user.uuid)),
    );
  }, [apiUsers, disabledCacheReady]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const counts = useMemo(
    () => ({
      all: users.length,

      active: users.filter((user) => user.status === "ACTIVE").length,

      suspended: users.filter((user) => user.status === "SUSPENDED").length,

      disabled: users.filter(
        (user) => user.status === "DISABLED" || user.status === "DELETED",
      ).length,
    }),
    [users],
  );

  /* =======================================================
     SEARCH
  ======================================================= */

  const normalizedSearch = search.trim().toLowerCase();

  // const matchesSearch = (
  //   user: AdminUser,
  //   query: string,
  // ) => {
  //   const name =
  //     displayName(
  //       user.firstName,
  //       user.lastName,
  //       user.username,
  //     );

  //   return [
  //     name,
  //     user.username,
  //     user.primaryEmail ??
  //       "",
  //     user.firstName ??
  //       "",
  //     user.lastName ??
  //       "",
  //   ].some((value) =>
  //     value
  //       .toLowerCase()
  //       .includes(query),
  //   );
  // };

  const matchesSearch = (user: AdminUser, query: string) => {
    const name =
      displayName(user.firstName, user.lastName, user.username) ?? "";

    return [
      name,
      user.username,
      user.primaryEmail,
      user.firstName,
      user.lastName,
    ].some((value) =>
      String(value ?? "")
        .toLowerCase()
        .includes(query),
    );
  };

  const suggestions = useMemo(() => {
    if (!normalizedSearch) {
      return [];
    }

    return suggestionUsers
      .filter((user) => matchesSearch(user, normalizedSearch))
      .slice(0, 8);
  }, [normalizedSearch, suggestionUsers]);

  /*
   * When there is a search, use the larger
   * suggestion dataset instead of only the
   * current paginated page.
   */
  const searchSource = normalizedSearch ? suggestionUsers : users;

  const filteredUsers = useMemo(() => {
    return searchSource.filter((user) => {
      const statusMatches =
        statusFilter === "ALL" ||
        (statusFilter === "DISABLED"
          ? user.status === "DISABLED" || user.status === "DELETED"
          : user.status === statusFilter);

      if (!statusMatches) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return matchesSearch(user, normalizedSearch);
    });
  }, [normalizedSearch, searchSource, statusFilter]);

  /* =======================================================
     SORT
  ======================================================= */

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((first, second) => {
      const firstName =
        displayName(first.firstName, first.lastName, first.username) ?? "";

      const secondName =
        displayName(second.firstName, second.lastName, second.username) ?? "";

      switch (sortBy) {
        case "A_Z":
          return firstName.localeCompare(secondName, undefined, {
            sensitivity: "base",
          });

        case "Z_A":
          return secondName.localeCompare(firstName, undefined, {
            sensitivity: "base",
          });

        case "NEWEST": {
          const firstTime = first.createdAt
            ? new Date(first.createdAt).getTime()
            : 0;

          const secondTime = second.createdAt
            ? new Date(second.createdAt).getTime()
            : 0;

          return secondTime - firstTime;
        }

        case "OLDEST": {
          const firstTime = first.createdAt
            ? new Date(first.createdAt).getTime()
            : 0;

          const secondTime = second.createdAt
            ? new Date(second.createdAt).getTime()
            : 0;

          return firstTime - secondTime;
        }

        default:
          return 0;
      }
    });
  }, [filteredUsers, sortBy]);

  const sortOptions: Array<{
    value: UserSort;
    label: string;
  }> = [
    {
      value: "A_Z",
      label: "A → Z",
    },
    {
      value: "Z_A",
      label: "Z → A",
    },
    {
      value: "NEWEST",
      label: "ថ្មីបំផុត",
    },
    {
      value: "OLDEST",
      label: "ចាស់បំផុត",
    },
  ];

  /* =======================================================
     CREATE
  ======================================================= */

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

  /* =======================================================
     STATUS
  ======================================================= */

  const handleStatusUpdate = async (status: MutableAdminUserStatus) => {
    if (!statusUser) {
      return;
    }

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

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = async () => {
    if (!deleteUser) {
      return;
    }

    const target = deleteUser;

    setNotice(null);

    try {
      await deleteAdminUser(target.uuid).unwrap();

      const disabledUser: AdminUser = {
        ...target,
        status: "DISABLED" as AdminUser["status"],
      };

      setLocallyDisabledUsers((current) => [
        disabledUser,
        ...current.filter((user) => user.uuid !== target.uuid),
      ]);

      setDeleteUser(null);
      setRecentlyDeleted(disabledUser);

      // Move the admin directly to the place where the user can be restored.
      setStatusFilter("DISABLED");
      setPage(0);

      setNotice({
        type: "success",
        text: `បានបញ្ឈប់អ្នកប្រើ "${displayName(
          target.firstName,
          target.lastName,
          target.username,
        )}"។ អ្នកអាចស្តារឡើងវិញពីផ្ទាំង Disabled។`,
      });

      await refetch();
    } catch (requestError) {
      setNotice({
        type: "error",
        text: getAdminApiErrorMessage(requestError),
      });
    }
  };

  /* =======================================================
     លុប
  ======================================================= */

  const handleHardDelete = async () => {
    if (!hardDeleteUser) {
      return;
    }

    const target = hardDeleteUser;

    setNotice(null);

    try {
      await hardDeleteAdminUser(target.uuid).unwrap();

      setLocallyDisabledUsers((current) =>
        current.filter((user) => user.uuid !== target.uuid),
      );

      if (recentlyDeleted?.uuid === target.uuid) {
        setRecentlyDeleted(null);
      }

      setHardDeleteUser(null);

      setNotice({
        type: "success",
        text: `បានលុបអ្នកប្រើ "${displayName(
          target.firstName,
          target.lastName,
          target.username,
        )}" ជាអចិន្ត្រៃយ៍។`,
      });

      await refetch();
    } catch (requestError) {
      setNotice({
        type: "error",
        text: getAdminApiErrorMessage(requestError),
      });
    }
  };

  /* =======================================================
     RESTORE
  ======================================================= */

  const handleUndoDelete = async () => {
    if (!recentlyDeleted) {
      return;
    }

    try {
      const restoredUuid = recentlyDeleted.uuid;

      await restoreAdminUser(restoredUuid).unwrap();

      setLocallyDisabledUsers((current) =>
        current.filter((user) => user.uuid !== restoredUuid),
      );

      setRecentlyDeleted(null);

      setNotice({
        type: "success",
        text: "បានស្តារអ្នកប្រើឡើងវិញដោយជោគជ័យ។",
      });

      await refetch();
    } catch (requestError) {
      setNotice({
        type: "error",
        text: getAdminApiErrorMessage(requestError),
      });
    }
  };

  const handleRestoreUser = async (user: AdminUser) => {
    setNotice(null);

    try {
      await restoreAdminUser(user.uuid).unwrap();

      setLocallyDisabledUsers((current) =>
        current.filter((item) => item.uuid !== user.uuid),
      );

      if (recentlyDeleted?.uuid === user.uuid) {
        setRecentlyDeleted(null);
      }

      setNotice({
        type: "success",
        text: `បានស្តារអ្នកប្រើ "${displayName(
          user.firstName,
          user.lastName,
          user.username,
        )}" ដោយជោគជ័យ។`,
      });

      await refetch();
    } catch (requestError) {
      setNotice({
        type: "error",
        text: getAdminApiErrorMessage(requestError),
      });
    }
  };

  const busy =
    creating || updatingStatus || deleting || hardDeleting || restoring;

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="space-y-5">
      <UsersHeader
        total={Math.max(data?.totalElements ?? 0, users.length)}
        activeCount={counts.active}
        suspendedCount={counts.suspended}
        disabledCount={counts.disabled}
        onCreate={() => {
          setNotice(null);
          setCreateOpen(true);
        }}
      />

      {/* =================================================
          TABS + TOOLBAR
      ================================================== */}

      <div className="flex w-full flex-nowrap items-center justify-between gap-4">
        <div className="shrink-0">
          <UsersTabs
            value={statusFilter}
            counts={counts}
            onChange={(value) => {
              setStatusFilter(value);

              setPage(0);
            }}
          />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {/* SEARCH */}

          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(event) => {
                const value = event.target.value;

                setSearch(value);

                setPage(0);

                setShowSuggestions(value.trim().length > 0);
              }}
              onFocus={() => {
                if (search.trim().length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setShowSuggestions(false);
                }

                if (event.key === "Enter") {
                  setShowSuggestions(false);
                }
              }}
              placeholder="ស្វែងរកឈ្មោះ, username ឬ email..."
              className="h-11 w-[430px] rounded-2xl border border-gray-200 bg-white py-2 pl-11 pr-10 text-lg text-gray-700 outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
            />

            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");

                  setShowSuggestions(false);

                  setPage(0);
                }}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}

            {showSuggestions && normalizedSearch && (
              <div className="absolute left-0 top-[52px] z-[100] w-[430px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.13)]">
                {suggestions.length === 0 ? (
                  <div className="px-5 py-6 text-center">
                    <Users size={32} className="mx-auto text-secondary-500" />

                    <p className="mt-2 text-lg text-secondary-500">
                      មិនមានអ្នកប្រើដែលត្រូវគ្នា
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="border-b border-gray-100 px-5 py-3">
                      <p className="text-lg text-secondary-500">
                        លទ្ធផលស្វែងរក
                      </p>
                    </div>

                    <div className="max-h-[340px] overflow-y-auto p-2">
                      {suggestions.map((user) => {
                        const name = displayName(
                          user.firstName,
                          user.lastName,
                          user.username,
                        );

                        return (
                          <button
                            key={user.uuid}
                            type="button"
                            onMouseDown={(event) => {
                              event.preventDefault();
                            }}
                            onClick={() => {
                              setSearch(name);

                              setShowSuggestions(false);

                              setPage(0);
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-primary-50"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                              <UserRound size={20} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-base font-semibold text-gray-800">
                                {name}
                              </p>

                              <p className="mt-0.5 truncate text-sm text-gray-400">
                                @{user.username}
                              </p>

                              {user.primaryEmail && (
                                <p className="mt-0.5 truncate text-sm text-gray-400">
                                  {user.primaryEmail}
                                </p>
                              )}
                            </div>

                            <span
                              className={`shrink-0 rounded-full px-2.5 py-1 text-sm ${
                                user.status === "ACTIVE"
                                  ? "bg-primary-50 text-primary-700"
                                  : user.status === "SUSPENDED"
                                    ? "bg-secondary-50 text-secondary-600"
                                    : user.status === "DELETED"
                                      ? "bg-red-50 text-red-700"
                                      : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {user.status}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* PAGE SIZE */}

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setSizeOpen((current) => !current);

                setSortOpen(false);

                setShowSuggestions(false);
              }}
              className={`flex h-11 min-w-[125px] items-center justify-between gap-3 rounded-2xl border bg-white px-4 text-sm font-semibold transition ${
                sizeOpen
                  ? "border-primary-600 ring-2 ring-primary-100"
                  : "border-gray-200 hover:border-primary-600/50"
              }`}
            >
              <span className="text-gray-700">{size} / ទំព័រ</span>

              <ChevronDown
                size={17}
                className={`text-gray-400 transition-transform duration-200 ${
                  sizeOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {sizeOpen && (
              <div className="absolute right-0 top-[52px] z-[100] w-[170px] rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_15px_45px_rgba(0,0,0,0.12)]">
                <p className="px-3 pb-2 pt-1 text-lg text-secondary-500">
                  ចំនួនក្នុងទំព័រ
                </p>

                {[10, 20, 50].map((value) => {
                  const selected = size === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setSize(value);

                        setPage(0);

                        setSizeOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-base font-semibold transition ${
                        selected
                          ? "bg-primary-50 text-primary-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-primary-700"
                      }`}
                    >
                      <span>{value} / ទំព័រ</span>

                      {selected && (
                        <Check size={16} className="text-primary-700" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* SORT */}

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setSortOpen((current) => !current);

                setSizeOpen(false);

                setShowSuggestions(false);
              }}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
                sortOpen
                  ? "border-primary-600 bg-primary-50 text-primary-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-primary-600 hover:bg-primary-50 hover:text-primary-700"
              }`}
              aria-label="Sort users"
              title="Sort users"
            >
              <ArrowUpDown size={18} />
            </button>

            {sortOpen && (
              <div className="absolute right-0 top-[52px] z-[100] w-[190px] rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_15px_45px_rgba(0,0,0,0.12)]">
                <p className="px-3 pb-2 pt-1 text-lg text-secondary-500">
                  តម្រៀប
                </p>

                {sortOptions.map((option) => {
                  const selected = sortBy === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSortBy(option.value);

                        setSortOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-base font-semibold transition ${
                        selected
                          ? "bg-primary-50 text-primary-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-primary-700"
                      }`}
                    >
                      <span>{option.label}</span>

                      {selected && (
                        <Check size={16} className="text-primary-700" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =================================================
          NOTICE
      ================================================== */}

      {notice && (
        <div
          className={`flex flex-col gap-3 rounded-2xl border px-4 py-3 text-base sm:flex-row sm:items-center sm:justify-between ${
            notice.type === "success"
              ? "border-primary-100 bg-primary-50 text-primary-700"
              : "border-red-100 bg-red-50 text-red-600"
          }`}
        >
          <span>{notice.text}</span>

          {notice.type === "success" && recentlyDeleted && (
            <button
              type="button"
              disabled={restoring}
              onClick={() => void handleUndoDelete()}
              className="inline-flex items-center gap-2 self-start rounded-xl bg-white px-3 py-2 font-semibold text-primary-700 shadow-sm disabled:opacity-50"
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

      {/* =================================================
          TABLE
      ================================================== */}

      <section className="w-full min-w-0 max-w-full overflow-visible rounded-[24px] border border-gray-100 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex min-h-[360px] items-center justify-center">
            <Loader2 size={30} className="animate-spin text-primary-800" />
          </div>
        ) : error ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <AlertTriangle size={38} className="text-red-400" />

            <p className="mt-4 text-xl font-bold text-gray-800">
              មិនអាចទាញយកអ្នកប្រើប្រាស់បានទេ
            </p>

            <p className="mt-2 max-w-lg text-base leading-7 text-gray-500">
              {getAdminApiErrorMessage(error)}
            </p>

            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-5 rounded-full bg-primary-800 px-5 py-2.5 text-lg font-medium text-white transition hover:bg-primary-900"
            >
              សាកល្បងម្តងទៀត
            </button>
          </div>
        ) : sortedUsers.length === 0 ? (
          <div className="flex min-h-[340px] flex-col items-center justify-center text-center">
            <Users size={42} className="text-secondary-500" />

            <p className="mt-3 text-lg text-secondary-500">
              មិនមានអ្នកប្រើត្រូវនឹង filter
            </p>
          </div>
        ) : (
          <UsersTable
            users={sortedUsers}
            disabled={busy}
            onStatusEdit={setStatusUser}
            onDelete={setDeleteUser}
            onHardDelete={setHardDeleteUser}
            onRestore={handleRestoreUser}
          />
        )}

        {!isLoading &&
          !error &&
          !normalizedSearch &&
          statusFilter !== "DISABLED" && (
            <UsersPagination
              page={data?.pageNumber ?? page}
              totalPages={data?.totalPages ?? 0}
              totalElements={data?.totalElements ?? 0}
              disabled={isFetching}
              onPageChange={setPage}
            />
          )}
      </section>

      {/* =================================================
          MODALS
      ================================================== */}

      <UserCreateModal
        open={createOpen}
        saving={creating}
        onClose={() => {
          if (!creating) {
            setCreateOpen(false);
          }
        }}
        onSubmit={handleCreate}
      />

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
        deleting={deleting}
        onClose={() => {
          if (!deleting) {
            setDeleteUser(null);
          }
        }}
        onConfirm={handleDelete}
      />

      <HardDeleteUserConfirmModal
        user={hardDeleteUser}
        deleting={hardDeleting}
        onClose={() => {
          if (!hardDeleting) {
            setHardDeleteUser(null);
          }
        }}
        onConfirm={handleHardDelete}
      />
    </div>
  );
}
