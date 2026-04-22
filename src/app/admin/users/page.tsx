"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  AlertTriangle,
  KeyRound,
  ShieldBan,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  useAdminUsers,
  useResetAdminUserPassword,
  useUpdateAdminUserStatus,
} from "@/hooks/useAdmin";
import {
  adminResetPasswordSchema,
  type AdminResetPasswordFormValues,
} from "@/lib/validators";
import { formatDate } from "@/lib/utils";
import type { AdminUserSummary, UserStatus } from "@/types/admin.types";

interface ApiErrorResponse {
  message?: string;
}

const USERS_PAGE_SIZE = 10;

const USER_STATUS_STYLES: Record<UserStatus, string> = {
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  INACTIVE: "border-slate-200 bg-slate-50 text-slate-700",
  BANNED: "border-rose-200 bg-rose-50 text-rose-700",
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [userToToggle, setUserToToggle] = useState<AdminUserSummary | null>(null);
  const [userToReset, setUserToReset] = useState<AdminUserSummary | null>(null);

  const usersQuery = useAdminUsers({
    page: page - 1,
    size: USERS_PAGE_SIZE,
    sortBy: "createdAt",
    sortDir: "desc",
  });
  const updateStatusMutation = useUpdateAdminUserStatus();
  const resetPasswordMutation = useResetAdminUserPassword();

  const resetPasswordForm = useForm<AdminResetPasswordFormValues>({
    resolver: zodResolver(adminResetPasswordSchema),
    defaultValues: {
      newPassword: "",
    },
  });

  const users = useMemo(() => usersQuery.data?.content ?? [], [usersQuery.data?.content]);
  const totalUsers = usersQuery.data?.totalElements ?? 0;

  const stats = useMemo(
    () => ({
      active: users.filter((user) => user.status === "ACTIVE").length,
      banned: users.filter((user) => user.status === "BANNED").length,
      admins: users.filter((user) => user.roles.includes("ADMIN")).length,
    }),
    [users],
  );

  const handleToggleStatus = async () => {
    if (!userToToggle) {
      return;
    }

    const nextStatus: UserStatus = userToToggle.status === "BANNED" ? "ACTIVE" : "BANNED";

    try {
      await updateStatusMutation.mutateAsync({
        userId: userToToggle.id,
        payload: { status: nextStatus },
      });
      toast.success(
        nextStatus === "BANNED"
          ? "User has been banned successfully."
          : "User access has been restored.",
      );
      setUserToToggle(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update user status."));
    }
  };

  const handleResetPassword = async (values: AdminResetPasswordFormValues) => {
    if (!userToReset) {
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        userId: userToReset.id,
        payload: { newPassword: values.newPassword.trim() },
      });
      toast.success("Password reset successfully.");
      setUserToReset(null);
      resetPasswordForm.reset();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to reset password."));
    }
  };

  const columns: DataTableColumn<AdminUserSummary>[] = [
    {
      key: "user",
      header: "User",
      cell: (user) => (
        <div className="space-y-1">
          <p className="font-semibold text-foreground">{user.fullName}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      ),
      skeletonClassName: "max-w-[14rem]",
    },
    {
      key: "roles",
      header: "Roles",
      cell: (user) => (
        <div className="flex flex-wrap gap-2">
          {user.roles.map((role) => (
            <Badge key={role} variant="outline" className="rounded-full px-3 py-1 text-xs">
              {role}
            </Badge>
          ))}
        </div>
      ),
      skeletonClassName: "max-w-[8rem]",
    },
    {
      key: "status",
      header: "Status",
      cell: (user) => (
        <Badge
          variant="outline"
          className={`rounded-full px-3 py-1 text-xs ${USER_STATUS_STYLES[user.status]}`}
        >
          {user.status}
        </Badge>
      ),
      cellClassName: "w-[8.5rem]",
      skeletonClassName: "max-w-[6rem]",
    },
    {
      key: "createdAt",
      header: "Joined",
      cell: (user) => (
        <span className="text-sm text-muted-foreground">
          {user.createdAt ? formatDate(user.createdAt) : "Recently"}
        </span>
      ),
      cellClassName: "w-[8rem]",
      skeletonClassName: "max-w-[5rem]",
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      cellClassName: "w-[15rem] text-right",
      cell: (user) => (
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => {
              setUserToReset(user);
              resetPasswordForm.reset({ newPassword: "" });
            }}
          >
            <KeyRound className="size-3.5" />
            Reset password
          </Button>
          <Button
            type="button"
            size="sm"
            variant={user.status === "BANNED" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setUserToToggle(user)}
          >
            {user.status === "BANNED" ? "Restore" : "Ban"}
          </Button>
        </div>
      ),
      skeletonClassName: "ml-auto max-w-[10rem]",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_repeat(3,minmax(0,1fr))]">
        <div className="rounded-[28px] border border-border/80 bg-gradient-to-br from-primary/8 via-background to-sky-50/50 px-5 py-6 shadow-soft sm:px-6">
          <Badge className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            User management
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            Account access control
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Review account states, restore or ban risky users, and reset passwords without leaving the admin workspace.
          </p>
        </div>

        <div className="rounded-[28px] border border-border/80 bg-background px-5 py-6 shadow-soft sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/8 text-primary">
              <Users className="size-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Total users</p>
              <p className="text-3xl font-semibold tracking-tight text-foreground">{totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-border/80 bg-background px-5 py-6 shadow-soft sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Active on this page</p>
              <p className="text-3xl font-semibold tracking-tight text-foreground">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-border/80 bg-background px-5 py-6 shadow-soft sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
              <ShieldBan className="size-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Banned on this page</p>
              <p className="text-3xl font-semibold tracking-tight text-foreground">{stats.banned}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {stats.admins} admin account(s) are visible in the current slice.
          </p>
        </div>
      </section>

      <DataTable
        title="Platform users"
        description="Keep account access clean and reversible. Password resets are immediate, while banning is best reserved for abuse or serious policy violations."
        columns={columns}
        data={users}
        isLoading={usersQuery.isLoading}
        emptyTitle={usersQuery.error ? "Could not load users" : "No users found"}
        emptyDescription={
          usersQuery.error
            ? getErrorMessage(usersQuery.error, "Please try again in a moment.")
            : "User accounts will appear here once people start registering."
        }
        pagination={{
          page: usersQuery.data?.page ?? 0,
          size: usersQuery.data?.size ?? USERS_PAGE_SIZE,
          totalElements: usersQuery.data?.totalElements ?? 0,
          totalPages: usersQuery.data?.totalPages ?? 0,
          onPageChange: (nextPage) => setPage(nextPage + 1),
          itemLabel: "users",
          isDisabled: usersQuery.isFetching,
        }}
      />

      <ConfirmDialog
        open={Boolean(userToToggle)}
        onOpenChange={(open) => {
          if (!open) {
            setUserToToggle(null);
          }
        }}
        title={
          userToToggle?.status === "BANNED"
            ? "Restore this user?"
            : "Ban this user?"
        }
        description={
          userToToggle?.status === "BANNED"
            ? "This will allow the account to authenticate and use protected features again."
            : "Use banning only when this account should immediately lose access to the platform."
        }
        confirmText={userToToggle?.status === "BANNED" ? "Restore access" : "Ban user"}
        isLoading={updateStatusMutation.isPending}
        onConfirm={handleToggleStatus}
      />

      <Dialog
        open={Boolean(userToReset)}
        onOpenChange={(open) => {
          if (!open) {
            setUserToReset(null);
            resetPasswordForm.reset();
          }
        }}
      >
        <DialogContent className="max-w-xl rounded-[28px] border border-border/80 bg-background p-0">
          <form onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)}>
            <DialogHeader className="border-b border-border/70 px-5 py-5 sm:px-6">
              <Badge className="w-fit rounded-full bg-primary/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                Password reset
              </Badge>
              <DialogTitle className="text-2xl font-semibold tracking-tight">
                Reset password for {userToReset?.fullName ?? "user"}
              </DialogTitle>
              <DialogDescription className="max-w-lg leading-6">
                Set a temporary password and share it through a secure internal channel. The user can change it later from their account.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 px-5 py-5 sm:px-6">
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-10 items-center justify-center rounded-2xl bg-white text-amber-700 shadow-sm">
                    <AlertTriangle className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-amber-950">Security note</p>
                    <p className="mt-1 text-sm leading-6 text-amber-900/80">
                      Use a strong temporary password and avoid sending it over public chat channels.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Temporary password</label>
                <Input
                  type="password"
                  placeholder="Enter a secure temporary password"
                  className="h-11 rounded-2xl"
                  {...resetPasswordForm.register("newPassword")}
                />
                {resetPasswordForm.formState.errors.newPassword ? (
                  <p className="text-sm text-destructive">
                    {resetPasswordForm.formState.errors.newPassword.message}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Backend requires a password between 8 and 72 characters.
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="rounded-b-[28px]">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-full"
                onClick={() => {
                  setUserToReset(null);
                  resetPasswordForm.reset();
                }}
                disabled={resetPasswordMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-10 rounded-full shadow-sm"
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? "Resetting..." : "Reset password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
