"use client";

import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  AlertTriangle,
  ArrowUpDown,
  Check,
  CheckCircle2,
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
  useUpdateAdminUserMutation,
} from "@/src/app/store/userProfileApi";

import type {
  AdminUser,
  CreateAdminUserPayload,
  MutableAdminUserStatus,
  UserStatusFilter,
} from "@/src/types/userProfile";

import { useCurrentAdmin } from "@/src/hooks/useCurrentAdmin";
import { getAdminRole } from "@/src/lib/currentAdminDisplay";
import { getAdminUserPrimaryRole } from "@/src/lib/adminUserRoles";
import { displayName } from "@/src/lib/userProfileFormat";
import { getAdminApiErrorMessage } from "@/src/lib/adminApiError";

import HardDeleteUserConfirmModal from "./HardDeleteUserConfirmModal";
import RestoreUserConfirmModal from "./RestoreUserConfirmModal";
import SuspendUserConfirmModal from "./SuspendUserConfirmModal";
import UserCreateModal from "./UserCreateModal";
import UserEditModal from "./UserEditModal";
import UserProfileEditModal from "./UserProfileEditModal";
import UsersHeader from "./UsersHeader";
import UsersPagination from "./UsersPagination";
import UsersTable from "./UsersTable";
import UsersTabs from "./UsersTabs";

export type UserRoleFilter = "ALL" | "ADMIN" | "USER";

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
  const [roleFilter, setRoleFilter] = useState<UserRoleFilter>("ALL");

  /* =======================================================
     SORT
  ======================================================= */

  const [sortBy, setSortBy] = useState<UserSort>("NEWEST");

  const [sortOpen, setSortOpen] = useState(false);

  const { admin } = useCurrentAdmin();

  const currentAdminRole = getAdminRole(admin);

  /* =======================================================
     MODALS / NOTICE
  ======================================================= */

  const [createOpen, setCreateOpen] = useState(false);

  const [statusUser, setStatusUser] = useState<AdminUser | null>(null);

  const [profileEditUser, setProfileEditUser] = useState<AdminUser | null>(null);

  const [suspendUser, setSuspendUser] = useState<AdminUser | null>(null);
  const [suspending, setSuspending] = useState(false);

  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);

  const [restoreTargetUser, setRestoreTargetUser] = useState<AdminUser | null>(
    null,
  );

  const [hardDeleteUser, setHardDeleteUser] = useState<AdminUser | null>(null);

  const [notice, setNotice] = useState<Notice>(null);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => {
      setNotice(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [notice]);

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

  const [updateAdminUser, { isLoading: updatingProfile }] =
    useUpdateAdminUserMutation();

  /* =======================================================
     DATA
  ======================================================= */

  const users = data?.contents ?? [];

  const suggestionUsers = suggestionData?.contents ?? [];

  /* =======================================================
     COUNTS
  ======================================================= */

  const counts = useMemo(
    () => ({
      all: users.length,
      active: users.filter((user) => user.status === "ACTIVE").length,
      suspended: users.filter((user) => user.status === "SUSPENDED").length,
    }),
    [users],
  );

  const roleCounts = useMemo(() => {
    let adminCount = 0;
    let userCount = 0;

    for (const u of users) {
      const r = getAdminUserPrimaryRole(u);
      if (r === "ADMIN" || r === "SUPER_ADMIN") {
        adminCount++;
      } else {
        userCount++;
      }
    }

    return {
      all: users.length,
      admin: adminCount,
      user: userCount,
    };
  }, [users]);

  /* =======================================================
     SEARCH
  ======================================================= */

  const normalizedSearch = search.trim().toLowerCase();

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
        statusFilter === "ALL" || user.status === statusFilter;

      if (!statusMatches) {
        return false;
      }

      if (roleFilter !== "ALL") {
        const userRole = getAdminUserPrimaryRole(user);
        const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";
        if (roleFilter === "ADMIN" && !isAdmin) return false;
        if (roleFilter === "USER" && isAdmin) return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return matchesSearch(user, normalizedSearch);
    });
  }, [normalizedSearch, roleFilter, searchSource, statusFilter]);

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
        text: "បានបង្កើតគណនីថ្មីដោយជោគជ័យ។",
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
     PROFILE UPDATE
  ======================================================= */

  const handleProfileUpdate = async (payload: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
  }) => {
    if (!profileEditUser) {
      return;
    }

    setNotice(null);

    try {
      await updateAdminUser({
        userUuid: profileEditUser.uuid,
        ...payload,
      }).unwrap();

      setProfileEditUser(null);

      setNotice({
        type: "success",
        text: `បានកែប្រែព័ត៌មានគណនីអ្នកប្រើប្រាស់ "${displayName(
          payload.firstName,
          payload.lastName,
          payload.username,
        )}" ដោយជោគជ័យ។`,
      });

      await refetch();
    } catch (requestError) {
      throw requestError;
    }
  };

  /* =======================================================
     SUSPEND
  ======================================================= */

  const handleSuspend = (user: AdminUser) => {
    setNotice(null);
    setSuspendUser(user);
  };

  const handleSuspendConfirm = async () => {
    if (!suspendUser) {
      return;
    }

    const target = suspendUser;
    setNotice(null);
    setSuspending(true);

    try {
      await updateStatus({
        userUuid: target.uuid,
        status: "SUSPENDED",
      }).unwrap();

      setSuspendUser(null);
      setSuspending(false);

      setNotice({
        type: "success",
        text: `បានផ្អាកដំណើរការគណនី​ "${displayName(target.firstName, target.lastName, target.username)}"ដោយជោគជ័យ។`,
      });

      await refetch();
    } catch (requestError: unknown) {
      setSuspendUser(null);
      setSuspending(false);

      // Await refetch — action may have partially succeeded (DB updated, Keycloak logout failed)
      await refetch();

      const is409 =
        typeof requestError === "object" &&
        requestError !== null &&
        "status" in requestError &&
        (requestError as { status: unknown }).status === 409;

      if (is409) {
        // Treat as success because Keycloak enabled=false succeeded, only logout failed
        setNotice({
          type: "success",
          text: `បានផ្អាកដំណើរការអ្នកប្រើ "${displayName(target.firstName, target.lastName, target.username)}" ដោយជោគជ័យ។`,
        });
      } else {
        setNotice({
          type: "error",
          text: getAdminApiErrorMessage(requestError),
        });
      }
    }
  };

  /* =======================================================
     DELETE
  ======================================================= */

  /* =======================================================
     លុបចេញពីប្រព័ន្ធ (HARD DELETE)
  ======================================================= */

  const handleHardDelete = async () => {
    if (!hardDeleteUser) {
      return;
    }

    const target = hardDeleteUser;
    setNotice(null);

    try {
      await hardDeleteAdminUser(target.uuid).unwrap();
      setHardDeleteUser(null);

      setNotice({
        type: "success",
        text: `បានលុបគណនី "${displayName(
          target.firstName,
          target.lastName,
          target.username,
        )}" ចេញពីប្រព័ន្ធដោយជោគជ័យ។`,
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

  const handleRestoreUser = (user: AdminUser) => {
    setNotice(null);
    setRestoreTargetUser(user);
  };

  const handleRestoreUserConfirm = async () => {
    if (!restoreTargetUser) {
      return;
    }

    const target = restoreTargetUser;
    setNotice(null);

    try {
      if (target.status === "SUSPENDED") {
        await updateStatus({
          userUuid: target.uuid,
          status: "ACTIVE",
        }).unwrap();
      } else {
        await restoreAdminUser(target.uuid).unwrap();
      }

      setRestoreTargetUser(null);

      setNotice({
        type: "success",
        text: `បានស្តារគណនី "${displayName(
          target.firstName,
          target.lastName,
          target.username,
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
    creating ||
    updatingStatus ||
    updatingProfile ||
    deleting ||
    hardDeleting ||
    restoring ||
    suspending;

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="space-y-5">
      <UsersHeader
        total={Math.max(data?.totalElements ?? 0, users.length)}
        activeCount={counts.active}
        suspendedCount={counts.suspended}
        onCreate={() => {
          setNotice(null);
          setCreateOpen(true);
        }}
      />

      {/* =================================================
          TABS + TOOLBAR
      ================================================== */}

      <div className="space-y-3">
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          {/* LEFT: Status Tabs (3 tabs on mobile grid + 4th slot for controls) */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2 w-full sm:w-auto">
            <UsersTabs
              value={statusFilter}
              counts={counts}
              onChange={(value) => {
                setStatusFilter(value);
                setPage(0);
              }}
            />

            {/* Mobile Controls (Slot 4): Page Size + Sort */}
            <div className="flex sm:hidden items-center gap-1.5 w-full">
              {/* PAGE SIZE */}
              <div className="relative flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    setSizeOpen((current) => !current);
                    setSortOpen(false);
                    setShowSuggestions(false);
                  }}
                  className={`flex h-12 w-full cursor-pointer items-center justify-between gap-1.5 rounded-full border bg-white px-3 text-lg font-normal transition ${sizeOpen
                    ? "border-primary-600 ring-2 ring-primary-100"
                    : "border-gray-200 hover:border-primary-600/50"
                    }`}
                >
                  <span className="text-gray-700 truncate">{size} / ទំព័រ</span>

                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-gray-400 transition-transform duration-200 ${sizeOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {sizeOpen && (
                  <div className="absolute right-0 top-[52px] z-[100] w-[180px] rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_15px_45px_rgba(0,0,0,0.12)]">
                    <p className="px-3 pb-2 pt-1 text-base font-normal text-secondary-500">
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
                          className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-lg font-normal transition ${selected
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-primary-700"
                            }`}
                        >
                          <span>{value} / ទំព័រ</span>

                          {selected && (
                            <Check size={18} className="text-primary-700" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SORT */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSortOpen((current) => !current);
                    setSizeOpen(false);
                    setShowSuggestions(false);
                  }}
                  className={`flex h-12 w-12 items-center justify-center rounded-full border transition ${sortOpen
                    ? "border-primary-800 ring-2 ring-primary-100 text-primary-800"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  aria-label="Sort users"
                  title="តម្រៀប"
                >
                  <ArrowUpDown size={18} className="shrink-0" />
                </button>

                {sortOpen && (
                  <div className="absolute right-0 top-[52px] z-[100] w-[200px] rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_15px_45px_rgba(0,0,0,0.12)]">
                    <p className="px-3 pb-2 pt-1 text-base font-normal text-secondary-500">
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
                          className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-lg font-normal transition ${selected
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-primary-700"
                            }`}
                        >
                          <span>{option.label}</span>

                          {selected && (
                            <Check size={18} className="text-primary-700" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* DESKTOP CONTROLS: Search + Page Size + Sort */}
          <div className="hidden sm:flex sm:min-w-[320px] sm:flex-1 sm:items-center sm:justify-end sm:gap-2.5">
            {/* SEARCH */}
            <div className="relative min-w-[220px] max-w-xl flex-1">
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
                placeholder="ស្វែងរកឈ្មោះ, គណនី ឬ អ៊ីមែល..."
                className="h-12 w-full rounded-full border border-gray-200 bg-white py-2 pl-11 pr-10 text-lg font-normal text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setShowSuggestions(false);
                    setPage(0);
                  }}
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 transition hover:text-gray-700 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              )}

              {showSuggestions && normalizedSearch && (
                <div className="absolute left-0 top-[52px] z-[100] w-full max-w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.13)]">
                  {suggestions.length === 0 ? (
                    <div className="px-5 py-6 text-center">
                      <Users size={32} className="mx-auto text-secondary-500" />
                      <p className="mt-2 text-lg font-normal text-secondary-500">
                        មិនមានអ្នកប្រើដែលត្រូវគ្នា
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="border-b border-gray-100 px-5 py-3">
                        <p className="text-lg font-normal text-secondary-500">
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
                              className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-primary-50"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                                <UserRound size={20} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-base font-normal text-gray-800">
                                  {name}
                                </p>

                                <p className="mt-0.5 truncate text-sm font-normal text-gray-400">
                                  @{user.username}
                                </p>

                                {user.primaryEmail && (
                                  <p className="mt-0.5 truncate text-sm font-normal text-gray-400">
                                    {user.primaryEmail}
                                  </p>
                                )}
                              </div>

                              <span
                                className={`shrink-0 rounded-full px-2.5 py-1 text-sm font-normal ${user.status === "ACTIVE"
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
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSizeOpen((current) => !current);
                  setSortOpen(false);
                  setShowSuggestions(false);
                }}
                className={`flex h-12 min-w-[140px] cursor-pointer items-center justify-between gap-2.5 rounded-full border bg-white px-4 text-lg font-normal transition ${sizeOpen
                  ? "border-primary-600 ring-2 ring-primary-100"
                  : "border-gray-200 hover:border-primary-600/50"
                  }`}
              >
                <span className="text-gray-700">{size} / ទំព័រ</span>

                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform duration-200 ${sizeOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {sizeOpen && (
                <div className="absolute right-0 top-[52px] z-[100] w-[180px] rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_15px_45px_rgba(0,0,0,0.12)]">
                  <p className="px-3 pb-2 pt-1 text-base font-normal text-secondary-500">
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
                        className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-lg font-normal transition ${selected
                          ? "bg-primary-50 text-primary-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-primary-700"
                          }`}
                      >
                        <span>{value} / ទំព័រ</span>

                        {selected && (
                          <Check size={18} className="text-primary-700" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SORT */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSortOpen((current) => !current);
                  setSizeOpen(false);
                  setShowSuggestions(false);
                }}
                className={`flex h-12 min-w-[140px] cursor-pointer items-center justify-between gap-2.5 rounded-full border bg-white px-4 text-lg font-normal transition ${sortOpen
                  ? "border-primary-800 ring-2 ring-primary-100 text-primary-800"
                  : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                aria-label="Sort users"
                title="តម្រៀប"
              >
                <span className="truncate">
                  {sortOptions.find((opt) => opt.value === sortBy)?.label || "តម្រៀប"}
                </span>
                <ArrowUpDown size={18} className="shrink-0 text-gray-400" />
              </button>

              {sortOpen && (
                <div className="absolute right-0 top-[52px] z-[100] w-[200px] rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_15px_45px_rgba(0,0,0,0.12)]">
                  <p className="px-3 pb-2 pt-1 text-base font-normal text-secondary-500">
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
                        className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-lg font-normal transition ${selected
                          ? "bg-primary-50 text-primary-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-primary-700"
                          }`}
                      >
                        <span>{option.label}</span>

                        {selected && (
                          <Check size={18} className="text-primary-700" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar (Full Width Row) */}
        <div className="relative sm:hidden w-full">
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
            placeholder="ស្វែងរកឈ្មោះ, គណនី ឬ អ៊ីមែល..."
            className="h-12 w-full rounded-full border border-gray-200 bg-white py-2 pl-11 pr-10 text-lg font-normal text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
          />

          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setShowSuggestions(false);
                setPage(0);
              }}
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 transition hover:text-gray-700 cursor-pointer"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}

          {showSuggestions && normalizedSearch && (
            <div className="absolute left-0 top-[52px] z-[100] w-full max-w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.13)]">
              {suggestions.length === 0 ? (
                <div className="px-5 py-6 text-center">
                  <Users size={32} className="mx-auto text-secondary-500" />
                  <p className="mt-2 text-lg font-normal text-secondary-500">
                    មិនមានអ្នកប្រើដែលត្រូវគ្នា
                  </p>
                </div>
              ) : (
                <>
                  <div className="border-b border-gray-100 px-5 py-3">
                    <p className="text-lg font-normal text-secondary-500">
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
                          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-primary-50"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                            <UserRound size={20} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-base font-normal text-gray-800">
                              {name}
                            </p>

                            <p className="mt-0.5 truncate text-sm font-normal text-gray-400">
                              @{user.username}
                            </p>

                            {user.primaryEmail && (
                              <p className="mt-0.5 truncate text-sm font-normal text-gray-400">
                                {user.primaryEmail}
                              </p>
                            )}
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-sm font-normal ${user.status === "ACTIVE"
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
      </div>

      {/* =================================================
          FLOATING TOAST NOTIFICATION (SHADCN STYLE)
      ================================================== */}

      {notice && (
        <div className="fixed top-6 right-6 z-[9999] pointer-events-none flex max-w-md animate-in fade-in slide-in-from-top-5 duration-300">
          <div
            className={`pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3.5 shadow-2xl backdrop-blur-md transition-all ${notice.type === "success"
              ? "border-emerald-200 bg-white/95 text-emerald-950 shadow-emerald-500/10"
              : "border-red-200 bg-white/95 text-red-950 shadow-red-500/10"
              }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${notice.type === "success"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-600"
                }`}
            >
              {notice.type === "success" ? (
                <CheckCircle2 size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-relaxed">
                {notice.text}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="ml-2 flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>
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
              មិនអាចទាញយកគណនីអ្នកប្រើប្រាស់បានទេ
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
            currentAdminRole={currentAdminRole}
            disabled={busy}
            onProfileEdit={setProfileEditUser}
            onSuspend={(user) => void handleSuspend(user)}
            onHardDelete={setHardDeleteUser}
            onRestore={handleRestoreUser}
          />
        )}

        {!isLoading &&
          !error &&
          !normalizedSearch && (
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

      <SuspendUserConfirmModal
        user={suspendUser}
        suspending={suspending}
        onClose={() => {
          if (!suspending) {
            setSuspendUser(null);
          }
        }}
        onConfirm={handleSuspendConfirm}
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

      <RestoreUserConfirmModal
        user={restoreTargetUser}
        restoring={restoring}
        onClose={() => {
          if (!restoring) {
            setRestoreTargetUser(null);
          }
        }}
        onConfirm={handleRestoreUserConfirm}
      />

      <UserProfileEditModal
        user={profileEditUser}
        saving={updatingProfile}
        onClose={() => {
          if (!updatingProfile) {
            setProfileEditUser(null);
          }
        }}
        onSubmit={handleProfileUpdate}
      />
    </div>
  );
}
