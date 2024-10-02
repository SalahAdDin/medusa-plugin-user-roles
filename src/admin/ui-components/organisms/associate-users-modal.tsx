import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminCustomPost, useAdminCustomQuery } from "medusa-react";
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import Spinner from "../atoms/spinner";
import useDebounce from "../hooks/use-debounce";
import useNotification from "../hooks/use-notification";
import Modal from "../molecules/modal";
import SidebarTeamMember from "../molecules/sidebar-team-member";
import Table from "../molecules/table";
import { getErrorMessage } from "../utils/error-messages";

import {
  BooleanIdFieldArray,
  CreateModalProps,
  FieldListElement,
} from "./types";
import Button from "../fundamentals/button";

type AssociateUsersModalProps = CreateModalProps & {
  roleId: string;
  selectedUsersIds: string;
};

type AssociateUsersModalFormData = {
  users: BooleanIdFieldArray;
};

const AssociateUsersModal: React.FC<AssociateUsersModalProps> = ({
  handleClose,
  roleId,
  selectedUsersIds,
}) => {
  const notification = useNotification();
  const { t } = useTranslation();
  const [shownElements, setShownElements] = useState<Array<FieldListElement>>(
    []
  );
  const [searchTerm, setSearchTerm] = useState<string>("");

  const debouncedSearchTerm = useDebounce<string>(searchTerm, 1000);

  const {
    data,
    isLoading: isFetchingUsers,
    error: errorFetchingUsers,
  } = useAdminCustomQuery("/roles/get-all-users", ["all-users"]);

  const { mutate: associateUser, isLoading } = useAdminCustomPost(
    `/roles/${roleId}/update-users`,
    ["associate-users-to-roles", roleId]
  );

  const { control, reset, handleSubmit } = useForm<AssociateUsersModalFormData>(
    {
      defaultValue: {
        users: [],
      },
    }
  );

  const { fields } = useFieldArray({
    control,
    name: "users",
  });

  const userByIndex = useCallback(
    (index: number) => data?.users[index],
    [data]
  );

  const findUserById = useCallback(
    (id: string) => data?.users.find((p) => p.id === id),
    [data]
  );

  const parsedFields = useMemo(
    () =>
      fields.map((field, index) => ({
        ...field,
        index,
      })),
    [fields]
  );

  useEffect(() => {
    if (data?.users) {
      reset({
        users: data.users.map((user) => ({
          id: user.id,
          selected: selectedUsersIds.includes(user.id),
        })),
      });
    }
  }, [data, reset]);

  useEffect(() => {
    setShownElements(parsedFields);
  }, [fields]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      const searchTermRegex = new RegExp(debouncedSearchTerm, "i");

      const filteredElements = parsedFields.filter((_, index) => {
        const user = userByIndex(index);

        return (
          searchTermRegex.test(user?.first_name) ||
          searchTermRegex.test(user?.last_name) ||
          searchTermRegex.test(user?.email) ||
          searchTermRegex.test(user?.user_email)
        );
      });

      setShownElements(filteredElements);
    } else setShownElements(parsedFields ?? []);
  }, [data, debouncedSearchTerm]);

  const renderUserTableRows = useCallback(
    () =>
      shownElements.map((field) => {
        const user = userByIndex(field.index);

        return (
          <Table.Row key={`associate-user-${field.id}`} color="inherit">
            <Table.Cell className="w-8 text-center">
              <input
                type="checkbox"
                className="text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                {...control.register(`users.${field.index}.selected`)}
              />
            </Table.Cell>
            <Table.Cell>
              <SidebarTeamMember user={user} />
            </Table.Cell>
            <Table.Cell className="w-80">{user?.email}</Table.Cell>
            <Table.Cell className="inter-small-semibold text-violet-60">
              {user?.role.charAt(0).toUpperCase()}
              {user?.role.slice(1)}
            </Table.Cell>
          </Table.Row>
        );
      }),
    [shownElements]
  );
  const onSubmit = ({ users }: AssociateUsersModalFormData) => {
    const selectedUsersIds = users
      .filter((user) => user.selected)
      .map((user) => user.id);

    associateUser(selectedUsersIds, {
      onSuccess: () => {
        notification(
          "Success",
          `Associated ${data.users.length} users.`,
          "success"
        );
        handleClose();
      },
      onError: (error) => {
        notification("Error", getErrorMessage(error), "error");
      },
    });
  };

  const handleUserSearch = (term: string) => {
    setSearchTerm(term);
  };

  if (isFetchingUsers) {
    return <Spinner size="large" />;
  }

  if (errorFetchingUsers) {
    return <div>Error: {errorFetchingUsers.message}</div>;
  }

  return (
    <Modal handleClose={handleClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Modal.Header handleClose={handleClose}>
            <span className="inter-xlarge-semibold">
              {t("associate-users-modal-title", "Associate Users")}
            </span>
          </Modal.Header>
          <Modal.Content>
            <Table enableSearch handleSearch={handleUserSearch}>
              <Table.Head>
                <Table.HeadRow>
                  <Table.HeadCell />
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
              <Table.Body>{renderUserTableRows()}</Table.Body>
            </Table>
          </Modal.Content>
          <Modal.Footer>
            <div className="flex h-8 w-full justify-end">
              <Button
                variant="ghost"
                className="text-small mr-2 w-32 justify-center"
                size="large"
                type="button"
                onClick={handleClose}
              >
                {t("create-modal-cancel", "Cancel")}
              </Button>
              <Button
                loading={isLoading}
                disabled={isLoading}
                size="large"
                className="text-small w-32 justify-center"
                variant="primary"
              >
                {t("create-modal-assign", "Assign")}
              </Button>
            </div>
          </Modal.Footer>
        </Modal.Body>
      </form>
    </Modal>
  );
};

export default AssociateUsersModal;
