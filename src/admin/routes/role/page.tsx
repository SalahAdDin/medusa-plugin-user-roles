import { PlusMini } from "@medusajs/icons";
import { useAdminCustomQuery } from "medusa-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import BackButton from "../../ui-components/atoms/back-button";
import Spinner from "../../ui-components/atoms/spinner";
import BodyCard from "../../ui-components/organisms/body-card";
import UserTable from "../../ui-components/templates/user-table";
import PermissionTable from "../../ui-components/templates/permission-table";
import CreatePermissionModal from "../../ui-components/organisms/create-permission-modal";

const SetPermission = () => {
  const { t } = useTranslation();
  const { "*": id } = useParams();

  const [refetchFlag, setRefetchFlag] = useState(false);
  const [showCreatePermissionModal, setShowCreatePermissionModal] =
    useState(false);

  const {
    data: roleData,
    isLoading: roleIsLoading,
    error: roleError,
    refetch,
  } = useAdminCustomQuery(`/roles/get-role-permissions/${id}`, [
    "getRolePermissions",
  ]);

  const triggerRefetch = () => {
    setRefetchFlag((prev) => !prev);
  };

  useEffect(() => {
    if (refetchFlag) {
      refetch();
      setRefetchFlag(false);
    }
  }, [refetchFlag]);

  if (roleIsLoading) {
    return <Spinner size="large" />;
  }

  if (roleError) {
    return <div>Error: {roleError.message}</div>;
  }

  const permissions = roleData.role.permissions;
  const users = roleData.role.users;

  const actionables = [
    {
      label: t("roles-create-permission", "Create Permission"),
      onClick: () => {
        setShowCreatePermissionModal(true);
        return null;
      },
      icon: (
        <span className="text-grey-90">
          <PlusMini />
        </span>
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <BackButton
        path="/a/settings/user-roles"
        label={t("roles-back-to-settings", "Back to Roles")}
        className="mb-xsmall"
      />
      <BodyCard
        title={`${t("roles-name-title", "Roles Name")}: ${roleData.role.name}`}
        actionables={actionables}
      >
        <div className="flex grow flex-col justify-between">
          <h2 className="text-grey-90 inter-large-semibold">
            {t("roles-permissions-title", "Permissions")}
          </h2>
          <PermissionTable
            roleId={roleData.role.id}
            permissions={permissions}
            triggerRefetch={() => {
              triggerRefetch();
            }}
          />
          <p className="inter-small-regular text-grey-50">
            {t("roles-permissions-count", "{{count}}", {
              count: permissions.length ?? 0,
            })}
          </p>
          <h2 className="text-grey-90 inter-large-semibold mt-large">
            {t("roles-users-title", "Users")}
          </h2>
          <UserTable
            roleId={roleData.role.id}
            users={users}
            triggerRefetch={() => {
              triggerRefetch();
            }}
          />
          <p className="inter-small-regular text-grey-50">
            {t("roles-users-count", "{{count}}", {
              count: users.length ?? 0,
            })}
          </p>
        </div>
        {showCreatePermissionModal && (
          <CreatePermissionModal
            handleClose={() => {
              triggerRefetch();
              setShowCreatePermissionModal(false);
            }}
          />
        )}
      </BodyCard>
    </div>
  );
};

export default SetPermission;
