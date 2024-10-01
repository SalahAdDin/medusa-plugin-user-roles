import React, { useCallback, useEffect, useState } from "react";
import { useAdminCustomPost, useAdminCustomQuery } from "medusa-react";
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import useNotification from "../hooks/use-notification";

import { CreateModalProps } from "./types";
import Modal from "../molecules/modal";
import Button from "../fundamentals/button";
import Table from "../molecules/table";
import { TPermission } from "src/models/permission";
import InputField from "../molecules/input";
import { getErrorMessage } from "../utils/error-messages";
import Spinner from "../atoms/spinner";

type PermissionListElement = {
  entity: TPermission;
  entityType: string;
  tableElement: React.JSX.Element;
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
  const [shownElements, setShownElements] = useState<
    Array<PermissionListElement>
  >([]);

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

  const onSubmit = ({ permissions }: AssignPermissionModalFormData) => {
    const selectedPermissions = permissions
      .filter((perm) => perm.selected) // Only keep selected ones
      .map((perm) => data.permission.find((p) => p.id === perm.id));

    console.log("Selected: ", selectedPermissions);

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

  const renderPermissionTableRows = useCallback(() => {
    return fields.map((field, index) => (
      <Table.Row key={`assign-permission-${field.id}`} color="inherit">
        <Table.Cell className="w-8 text-center">
          <input
            type="checkbox"
            className="text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            {...control.register(`permissions.${index}.selected`)}
          />
        </Table.Cell>
        <Table.Cell>{data.permission[index].name}</Table.Cell>
        <Table.Cell>
          {JSON.stringify(data.permission[index].metadata)}
        </Table.Cell>
      </Table.Row>
    ));
  }, [fields]);

  const handleUserSearch = (term: string) => {
    setShownElements((prevState) =>
      prevState.filter(
        (element) =>
          element.entity?.name.includes(term) ||
          JSON.stringify(element.entity?.metadata || "").includes(term)
      )
    );
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
            <Table enableSearch handleSearch={handleUserSearch}>
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
