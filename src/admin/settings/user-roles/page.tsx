import type { SettingConfig } from "@medusajs/admin";
import { PlusMini } from "@medusajs/icons";

import { useAdminCustomQuery } from "medusa-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import UserShield from "../../ui-components/icons/user-shield";
import BackButton from "../../ui-components/atoms/back-button";
import BodyCard from "../../ui-components/organisms/body-card";
import CreateRoleModal from "../../ui-components/organisms/create-role-modal";
import RoleTable from "../../ui-components/templates/role-table";
import Spinner from "../../ui-components/atoms/spinner";

const CustomSettingPage = () => {
  const { t } = useTranslation();

  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [refetchFlag, setRefetchFlag] = useState(false);

  const { data, isLoading, error, refetch } = useAdminCustomQuery(
    "/roles/get-roles",
    []
  );

  const triggerRefetch = () => {
    setRefetchFlag((prev) => !prev);
  };

  useEffect(() => {
    if (refetchFlag) {
      refetch();
      setRefetchFlag(false);
    }
  }, [refetchFlag]);

  if (isLoading) {
    return <Spinner size={24} />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const actionables = [
    {
      label: t("roles-create-role", "Create Role"),
      onClick: () => setShowCreateRoleModal(true),
      icon: (
        <span className="text-grey-90">
          <PlusMini />
        </span>
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex w-full grow flex-col">
        <BackButton
          path="/a/settings"
          label={t("back-to-settings", "Back to settings")}
          className="mb-xsmall"
        />
        <BodyCard
          title={t("roles-permissions-title", "Roles & Permissions")}
          subtitle={t(
            "roles-permissions-subtitle",
            "Manage the user roles and Permissions"
          )}
          actionables={actionables}
        >
          <div className="flex grow flex-col justify-between">
            <RoleTable roles={data.role} triggerRefetch={triggerRefetch} />
            <p className="inter-small-regular text-grey-50">
              {t("roles-count", "{{count}}", { count: data.role.length ?? 0 })}
            </p>
          </div>
          {showCreateRoleModal && (
            <CreateRoleModal
              handleClose={() => {
                triggerRefetch();
                setShowCreateRoleModal(false);
              }}
            />
          )}
        </BodyCard>
      </div>
    </div>
  );
};

export const config: SettingConfig = {
  card: {
    label: "Roles & Permissions",
    description: "Manage User roles and Permission",
    icon: UserShield,
  },
};

export default CustomSettingPage;
