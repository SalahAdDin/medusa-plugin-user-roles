import type { SettingConfig } from "@medusajs/admin";
import { Plus, Users as UsersIcon } from "@medusajs/icons";

import { useAdminCustomQuery } from "medusa-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import BackButton from "../../ui-components/atoms/back-button";
import BodyCard from "../../ui-components/organisms/body-card";
import InviteModal from "../../ui-components/organisms/invite-modal";
import UserTable from "../../ui-components/templates/user-table";
import Spinner from "../../ui-components/atoms/spinner";

const Team: React.FC = () => {
  const { t } = useTranslation();

  const [rbacRoles, setRbacRoles] = useState([]);
  const [shouldRefetch, setShouldRefetch] = useState(0);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const {
    data: roles,
    isLoading: isLoadingRoles,
    error: errorOnRoles,
    refetch: refetchRoles,
  } = useAdminCustomQuery("/roles/get-roles", ["get-roles"]);

  const {
    data: users,
    isLoading: isLoadingUsers,
    error: errorOnUsers,
    refetch: refetchUsers,
  } = useAdminCustomQuery("/admin/users", ["get-roles"]);

  const {
    data: invites,
    isLoading: isLoadingInvites,
    error: errorOnInvites,
    refetch: refetchInvites,
  } = useAdminCustomQuery("/admin/invites", ["get-roles"]);

  const triggerRefetch = () => {
    setShouldRefetch((prev) => prev + 1);
  };

  useEffect(() => {
    if (roles?.role)
      setRbacRoles(
        roles?.role.map((role) => ({ value: role.id, label: role.name }))
      );
  }, [roles]);

  useEffect(() => {
    refetchUsers();
    refetchInvites();
    refetchRoles();
  }, [shouldRefetch]);

  const actionables = [
    {
      label: t("users-invite-users", "Invite Users"),
      onClick: () => setShowInviteModal(true),
      icon: (
        <span className="text-grey-90">
          <Plus size={20} />
        </span>
      ),
    },
  ];

  if (isLoadingRoles || isLoadingInvites || isLoadingUsers) {
    return <Spinner size="large" />;
  }

  if (errorOnInvites || errorOnRoles || errorOnUsers) {
    return (
      <div>
        Error: {(errorOnInvites || errorOnRoles || errorOnUsers).message}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex w-full grow flex-col">
        <BackButton
          path="/a/settings"
          label={t("users-back-to-settings", "Back to settings")}
          className="mb-xsmall"
        />
        <BodyCard
          title={t("users-the-team", "The Team")}
          subtitle={t(
            "users-manage-users-of-your-medusa-store",
            "Manage users of your Medusa Store"
          )}
          actionables={actionables}
        >
          <div className="flex grow flex-col justify-between">
            <UserTable
              users={users.users}
              // invites={invites.invites}
              triggerRefetch={triggerRefetch}
            />
            <p className="inter-small-regular text-grey-50">
              {t("users-count", "{{count}}", { count: users.length })}
            </p>
          </div>
          {showInviteModal && (
            <InviteModal
              handleClose={() => {
                triggerRefetch();
                setShowInviteModal(false);
              }}
              rbacRolesOptions={rbacRoles}
            />
          )}
        </BodyCard>
      </div>
    </div>
  );
};

export const config: SettingConfig = {
  card: {
    label: "The Team",
    description: "Manage users of your Medusa Store",
    icon: UsersIcon,
  },
};

export default Team;
