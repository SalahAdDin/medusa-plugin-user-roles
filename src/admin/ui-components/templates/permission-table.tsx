import { PlusMini, Trash } from "@medusajs/icons";

import { useAdminCustomDelete } from "medusa-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { TPermission } from "src/models/permission";
import useDebounce from "../hooks/use-debounce";
import useNotification from "../hooks/use-notification";
import Table from "../molecules/table";
import Actionables from "../molecules/actionables";
import DeletePrompt from "../organisms/delete-prompt";
import AssignPermissionsModal from "../organisms/assign-permissions-modal";

type PermissionListElement = {
  entity: TPermission;
  entityType: string;
  tableElement: React.JSX.Element;
};

type PermissionTableProps = {
  roleId: string;
  permissions: Array<TPermission>;
  triggerRefetch: () => void;
};

const PermissionTable: React.FC<PermissionTableProps> = ({
  roleId,
  permissions,
  triggerRefetch,
}) => {
  const notification = useNotification();
  const { t } = useTranslation();

  const [selectedPermissionId, setSelectedPermissionId] = useState<
    string | null
  >(null);
  const [deletePermission, setDeletePermission] = useState(false);
  const [showAssignPermissionsModal, setShowAssignPermissionsModal] =
    useState(false);
  const [elements, setElements] = useState<Array<PermissionListElement>>([]);
  const [shownElements, setShownElements] = useState<
    Array<PermissionListElement>
  >([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const debouncedSearchTerm = useDebounce<string>(searchTerm, 500);

  const { mutate: removePermission } = useAdminCustomDelete(
    `roles/remove-permissions/${roleId}/${selectedPermissionId}`,
    ["remove-permissions"],
    [],
    {
      onSuccess: () => {
        notification(
          t("templates-success", "Success"),
          t(
            "templates-permission-has-been-removed",
            "Permission has been removed!"
          ),
          "success"
        );
        triggerRefetch();
      },
    }
  );

  const handleClose = () => {
    setSelectedPermissionId(null);
    setDeletePermission(false);
  };

  const getPermissionTableRow = (permission: TPermission) => {
    return (
      <Table.Row
        key={`permission-${permission.id}`}
        color="inherit"
        actions={[
          {
            label: t("templates-remove-user", "Remove"),
            variant: "danger",
            onClick: () => {
              setDeletePermission(true);
              setSelectedPermissionId(permission.id);
            },
            icon: <Trash size={20} />,
          },
        ]}
        className="h-12"
      >
        <Table.Cell>{permission.name}</Table.Cell>
        <Table.Cell>{JSON.stringify(permission.metadata)}</Table.Cell>
      </Table.Row>
    );
  };

  useEffect(() => {
    setElements([
      ...permissions.map((permission) => ({
        entity: permission,
        entityType: "permission",
        tableElement: getPermissionTableRow(permission),
      })),
    ]);
  }, [permissions]);

  useEffect(() => {
    setShownElements(elements);
  }, [elements]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      const searchTermRegex = new RegExp(debouncedSearchTerm, "i");

      setShownElements(
        elements.filter((element) => searchTermRegex.test(element.entity?.name))
      );
    } else setShownElements(elements);
  }, [permissions, debouncedSearchTerm]);

  const handlePermissionSearch = (term: string) => {
    setSearchTerm(term);
  };

  const actionables = [
    {
      label: t("roles-associate-permission", "Assign Permissions"),
      onClick: () => {
        setShowAssignPermissionsModal(true);
      },
      icon: (
        <span className="text-grey-90">
          <PlusMini />
        </span>
      ),
    },
  ];

  return (
    <div className="h-full w-full overflow-y-auto">
      <Table
        enableSearch
        handleSearch={handlePermissionSearch}
        tableActions={
          <Actionables actions={actionables} forceDropdown={false} />
        }
      >
        <Table.Head>
          <Table.HeadRow>
            <Table.HeadCell className="w-72">
              {t("templates-name", "Name")}
            </Table.HeadCell>
            <Table.HeadCell className="w-80">
              {t("templates-route", "Route")}
            </Table.HeadCell>
          </Table.HeadRow>
        </Table.Head>
        <Table.Body>
          {shownElements.map((element) => element.tableElement)}
        </Table.Body>
      </Table>
      {showAssignPermissionsModal && (
        <AssignPermissionsModal
          handleClose={() => {
            triggerRefetch();
            setShowAssignPermissionsModal(false);
          }}
          roleId={roleId}
          selectedPermissionsIds={permissions.map(
            (permission) => permission.id
          )}
        />
      )}
      {selectedPermissionId && deletePermission && (
        <DeletePrompt
          text={t(
            "templates-confirm-remove-permission",
            "Are you sure you want to remove this permission?"
          )}
          heading={t(
            "templates-remove-permission-heading",
            "Remove permission"
          )}
          onDelete={async () => {
            await removePermission();
          }}
          handleClose={handleClose}
        />
      )}
    </div>
  );
};

export default PermissionTable;
