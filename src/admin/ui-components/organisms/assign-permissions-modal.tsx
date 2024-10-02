import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminCustomPost, useAdminCustomQuery } from "medusa-react";
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import useNotification from "../hooks/use-notification";

import { CreateModalProps } from "./types";
import Modal from "../molecules/modal";
import Button from "../fundamentals/button";
import Table from "../molecules/table";
import { getErrorMessage } from "../utils/error-messages";
import Spinner from "../atoms/spinner";
import useDebounce from "../hooks/use-debounce";

type FieldListElement = {
  id: string;
  selected: boolean;
  index: number;
};

type AssignPermissionsModalProps = CreateModalProps & {
  roleId: string;
  selectedPermissionsId: Array<string>;
};

type AssignPermissionModalFormData = {
  permissions: Array<{
    id: string;
    selected: boolean;
  }>;
};

const AssignPermissionsModal: React.FC<AssignPermissionsModalProps> = ({
  handleClose,
  roleId,
  selectedPermissionsId,
}) => {
  const notification = useNotification();
  const { t } = useTranslation();
  const [shownElements, setShownElements] = useState<FieldListElement>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const debouncedSearchTerm = useDebounce<string>(searchTerm, 1000);

  const {
    data,
    isLoading: isFetchingPermissions,
    error: errorFetchingPermissions,
  } = useAdminCustomQuery("/roles/get-all-permissions", ["all-permissions"]);

  const { mutate: assignPermissions, isLoading } = useAdminCustomPost(
    `/roles/update-permissions/${roleId}`,
    ["assign-permissions-to-roles", roleId]
  );

  const { control, reset, handleSubmit } =
    useForm<AssignPermissionModalFormData>({
      defaultValue: {
        permissions: [],
      },
    });

  const { fields } = useFieldArray({
    control,
    name: "permissions",
  });

  const permissionByIndex = useCallback(
    (index: number) => data?.permission[index],
    [data]
  );

  const findPermissionById = useCallback(
    (id: string) => data?.permission.find((p) => p.id === id),
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
    if (data?.permission) {
      reset({
        permissions: data.permission.map((permission) => ({
          id: permission.id,
          selected: selectedPermissionsId.includes(permission.id),
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

      const filteredElements = parsedFields.filter((_, index) =>
        searchTermRegex.test(permissionByIndex(index)?.name)
      );

      setShownElements(filteredElements);
    } else setShownElements(parsedFields ?? []);
  }, [data, debouncedSearchTerm]);

  const renderPermissionTableRows = useCallback(
    () =>
      shownElements.map((field) => (
        <Table.Row key={`assign-permission-${field.id}`} color="inherit">
          <Table.Cell className="w-8 text-center">
            <input
              type="checkbox"
              className="text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              {...control.register(`permissions.${field.index}.selected`)}
            />
          </Table.Cell>
          <Table.Cell>{permissionByIndex(field.index)?.name}</Table.Cell>
          <Table.Cell>
            {JSON.stringify(permissionByIndex(field.index)?.metadata)}
          </Table.Cell>
        </Table.Row>
      )),
    [shownElements]
  );

  const onSubmit = ({ permissions }: AssignPermissionModalFormData) => {
    const selectedPermissions = permissions
      .filter((perm) => perm.selected)
      .map(({ id }) => findPermissionById(id));

    assignPermissions(selectedPermissions, {
      onSuccess: () => {
        notification(
          "Success",
          `Assigned ${data.permission.length} permissions.`,
          "success"
        );
        handleClose();
      },
      onError: (error) => {
        notification("Error", getErrorMessage(error), "error");
      },
    });
  };

  const handlePermissionSearch = (term: string) => {
    setSearchTerm(term);
  };

  if (isFetchingPermissions) {
    return <Spinner size="large" />;
  }

  if (errorFetchingPermissions) {
    return <div>Error: {errorFetchingPermissions.message}</div>;
  }

  return (
    <Modal handleClose={handleClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Modal.Header handleClose={handleClose}>
            <span className="inter-xlarge-semibold">
              {t("assign-permissions-modal-title", "Assign Permissions")}
            </span>
          </Modal.Header>
          <Modal.Content>
            <Table enableSearch handleSearch={handlePermissionSearch}>
              <Table.Head>
                <Table.HeadRow>
                  <Table.HeadCell />
                  <Table.HeadCell className="w-72">
                    {t("templates-name", "Name")}
                  </Table.HeadCell>
                  <Table.HeadCell className="w-80">
                    {t("templates-route", "Route")}
                  </Table.HeadCell>
                </Table.HeadRow>
              </Table.Head>
              <Table.Body>{renderPermissionTableRows()}</Table.Body>
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

export default AssignPermissionsModal;
