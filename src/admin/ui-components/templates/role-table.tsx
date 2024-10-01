import { PencilSquare, Trash } from "@medusajs/icons";
import { useAdminCustomDelete } from "medusa-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import type { TRole } from "src/models/role";

import useNotification from "../hooks/use-notification";
import Table from "../molecules/table";
import DeletePrompt from "../organisms/delete-prompt";

type RoleListElement = {
  entity: TRole;
  entityType: string;
  tableElement: React.JSX.Element;
};

type RoleTableProps = {
  roles: Array<TRole>;
  triggerRefetch: () => void;
};

const RoleTable: React.FC<RoleTableProps> = ({ roles, triggerRefetch }) => {
  const navigate = useNavigate();
  const notification = useNotification();
  const { t } = useTranslation();

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [deleteRole, setDeleteRole] = useState(false);
  const [elements, setElements] = useState<Array<RoleListElement>>([]);
  const [shownElements, setShownElements] = useState<Array<RoleListElement>>(
    []
  );

  const { mutate: removeRole } = useAdminCustomDelete(
    `/roles/delete-role/${selectedRoleId}`,
    ["delete-role"],
    [],
    {
      onSuccess: () => {
        notification(
          t("templates-success", "Success"),
          t("templates-role-has-been-removed", "Role has been removed!"),
          "success"
        );
        triggerRefetch();
      },
    }
  );

  const handleClose = () => {
    setSelectedRoleId(null);
    setDeleteRole(false);
  };

  const getRoleTableRow = (role: TRole) => {
    return (
      <Table.Row
        key={`role-${role.id}`}
        color="inherit"
        actions={[
          {
            label: t("templates-edit-role", "Edit Role"),
            onClick: () => navigate(`/a/role/${role.id}`),
            icon: <PencilSquare size={20} />,
          },
          {
            label: t("templates-remove-role", "Remove Role"),
            variant: "danger",
            onClick: () => {
              setDeleteRole(true);
              setSelectedRoleId(role.id);
            },
            icon: <Trash size={20} />,
          },
        ]}
      >
        <Table.Cell>{role.name}</Table.Cell>
        <Table.Cell>
          {/* TODO 
          <ul className="flex flex-col">
            {role.permissions.map((permission) => (
              <li>{permission.name}</li>
            ))}
          </ul> */}
        </Table.Cell>
        <Table.Cell>
          {/* TODO
          {role.users.length}
           */}
        </Table.Cell>
        <Table.Cell></Table.Cell>
      </Table.Row>
    );
  };

  useEffect(() => {
    setElements([
      ...roles.map((role) => ({
        entity: role,
        entityType: "user",
        tableElement: getRoleTableRow(role),
      })),
    ]);
  }, [roles]);

  useEffect(() => {
    setShownElements(elements);
  }, [elements]);

  const handleUserSearch = (term: string) => {
    setShownElements((prevElements) =>
      prevElements.filter((element) => element.entity?.name?.includes(term))
    );
  };

  return (
    <div className="h-full w-full overflow-y-auto">
      <Table enableSearch handleSearch={handleUserSearch}>
        <Table.Head>
          <Table.HeadRow>
            <Table.HeadCell className="w-72">
              {t("templates-name", "Name")}
            </Table.HeadCell>
            <Table.HeadCell className="w-72">
              {t("templates-permissions", "Permissions")}
            </Table.HeadCell>
            <Table.HeadCell className="w-72">
              {t("templates-user-number", "No. Users")}
            </Table.HeadCell>
          </Table.HeadRow>
        </Table.Head>
        <Table.Body>
          {shownElements.map((element) => element.tableElement)}
        </Table.Body>
      </Table>
      {selectedRoleId && deleteRole && (
        <DeletePrompt
          text={t(
            "templates-confirm-remove",
            "Are you sure you want to remove this role?"
          )}
          heading={t("templates-remove-role-heading", "Remove role")}
          onDelete={async () => {
            await removeRole();
          }}
          handleClose={handleClose}
        />
      )}
    </div>
  );
};

export default RoleTable;
