import { PlusMini, Trash } from "@medusajs/icons";
import { User } from "@medusajs/medusa";

import { useAdminCustomDelete } from "medusa-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import useDebounce from "../hooks/use-debounce";
import useNotification from "../hooks/use-notification";
import SidebarTeamMember from "../molecules/sidebar-team-member";
import Table from "../molecules/table";
import DeletePrompt from "../organisms/delete-prompt";
import Actionables from "../molecules/actionables";
import AssociateUsersModal from "../organisms/associate-users-modal";

type UserListElement = {
  entity: any;
  entityType: string;
  tableElement: React.JSX.Element;
};

type UserTableProps = {
  roleId: string;
  users: Array<User>;
  triggerRefetch: () => void;
};

const UserTable: React.FC<UserTableProps> = ({
  roleId,
  users,
  triggerRefetch,
}) => {
  const notification = useNotification();
  const { t } = useTranslation();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [deleteUser, setDeleteUser] = useState(false);
  const [showAssociateUsersModal, setShowAssociateUsersModal] = useState(false);
  const [elements, setElements] = useState<Array<UserListElement>>([]);
  const [shownElements, setShownElements] = useState<Array<UserListElement>>(
    []
  );
  const [searchTerm, setSearchTerm] = useState<string>("");

  const debouncedSearchTerm = useDebounce<string>(searchTerm, 500);

  const { mutate: removeUser } = useAdminCustomDelete(
    `roles/${roleId}/remove-user/${selectedUserId}`,
    ["remove-user "],
    [],
    {
      onSuccess: () => {
        notification(
          t("templates-success", "Success"),
          t("templates-user-has-been-removed", "User has been removed!"),
          "success"
        );
        triggerRefetch();
      },
    }
  );

  const handleClose = () => {
    setDeleteUser(false);
    setSelectedUserId(null);
  };

  const getUserTableRow = (user: User, index: number) => {
    return (
      <Table.Row
        key={`user-${index}`}
        color="inherit"
        actions={[
          {
            label: t("templates-remove-user", "Remove"),
            variant: "danger",
            onClick: () => {
              setDeleteUser(true);
              setSelectedUserId(user.id);
            },
            icon: <Trash size={20} />,
          },
        ]}
        className="h-12"
      >
        <Table.Cell>
          <SidebarTeamMember user={user} />
        </Table.Cell>
        <Table.Cell className="w-80">{user.email}</Table.Cell>
        <Table.Cell className="inter-small-semibold text-violet-60">
          {user.role.charAt(0).toUpperCase()}
          {user.role.slice(1)}
        </Table.Cell>
      </Table.Row>
    );
  };

  useEffect(() => {
    setElements([
      ...users.map((user, i) => ({
        entity: user,
        entityType: "user",
        tableElement: getUserTableRow(user, i),
      })),
    ]);
  }, [users]);

  useEffect(() => {
    setShownElements(elements);
  }, [elements]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      const searchTermRegex = new RegExp(debouncedSearchTerm, "i");

      setShownElements(
        elements.filter(
          (element) =>
            searchTermRegex.test(element.entity?.first_name) ||
            searchTermRegex.test(element.entity?.last_name) ||
            searchTermRegex.test(element.entity?.email) ||
            searchTermRegex.test(element.entity?.user_email)
        )
      );
    } else setShownElements(elements);
  }, [users, debouncedSearchTerm]);

  const handleUserSearch = (term: string) => {
    setSearchTerm(term);
  };

  const filteringOptions = [
    {
      title: "Team permissions",
      options: [
        {
          title: t("templates-all", "All"),
          count: elements.length,
          onClick: () => setShownElements(elements),
        },
        {
          title: t("templates-member", "Member"),
          count: elements.filter(
            (e) => e.entityType === "user" && e.entity.role === "member"
          ).length,
          onClick: () =>
            setShownElements(
              elements.filter(
                (e) => e.entityType === "user" && e.entity.role === "member"
              )
            ),
        },
        {
          title: t("templates-admin", "Admin"),
          count: elements.filter(
            (e) => e.entityType === "user" && e.entity.role === "admin"
          ).length,
          onClick: () =>
            setShownElements(
              elements.filter(
                (e) => e.entityType === "user" && e.entity.role === "admin"
              )
            ),
        },
        {
          title: t("templates-no-team-permissions", "No team permissions"),
          count: elements.filter((e) => e.entityType === "invite").length,
          onClick: () =>
            setShownElements(elements.filter((e) => e.entityType === "invite")),
        },
      ],
    },
    {
      title: t("templates-status", "Status"),
      options: [
        {
          title: t("templates-all", "All"),
          count: elements.length,
          onClick: () => setShownElements(elements),
        },
        {
          title: t("templates-active", "Active"),
          count: elements.filter((e) => e.entityType === "user").length,
          onClick: () =>
            setShownElements(elements.filter((e) => e.entityType === "user")),
        },
      ],
    },
  ];

  const actionables = [
    {
      label: t("roles-associate-user", "Associate User"),
      onClick: () => {
        setShowAssociateUsersModal(true);
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
        filteringOptions={filteringOptions}
        enableSearch
        handleSearch={handleUserSearch}
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
              {t("templates-email", "Email")}
            </Table.HeadCell>
            <Table.HeadCell className="w-72">
              {t("templates-team-permissions", "Team permissions")}
            </Table.HeadCell>
          </Table.HeadRow>
        </Table.Head>
        <Table.Body>{shownElements.map((e) => e.tableElement)}</Table.Body>
      </Table>
      {showAssociateUsersModal && (
        <AssociateUsersModal
          handleClose={() => {
            triggerRefetch();
            setShowAssociateUsersModal(false);
          }}
          roleId={roleId}
          selectedUsersIds={users.map((user) => user.id)}
        />
      )}
      {selectedUserId && deleteUser && (
        <DeletePrompt
          text={t(
            "templates-confirm-remove-user",
            "Are you sure you want to remove this user?"
          )}
          heading={t("templates-remove-user-heading", "Remove user")}
          onDelete={async () => {
            await removeUser();
          }}
          handleClose={handleClose}
        />
      )}
    </div>
  );
};

export default UserTable;
