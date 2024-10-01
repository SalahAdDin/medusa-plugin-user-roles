import { useAdminCustomPost } from "medusa-react";
import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import useNotification from "../hooks/use-notification";

import { CreateModalProps } from "./types";
import { getErrorMessage } from "../utils/error-messages";
import Modal from "../molecules/modal";
import InputField from "../molecules/input";
import Button from "../fundamentals/button";

type CreatePermissionModalFormData = {
  name: string;
  route: string;
};

const CreatePermissionModal: React.FC<CreateModalProps> = ({ handleClose }) => {
  const notification = useNotification();
  const { t } = useTranslation();

  const { mutate: createPermission, isLoading } = useAdminCustomPost(
    "/roles/create-permission",
    ["create-permission"]
  );

  const { register, handleSubmit } = useForm<CreatePermissionModalFormData>();

  const onSubmit = (data: CreatePermissionModalFormData) => {
    createPermission(
      {
        name: data.name,
        metadata: { [data.route]: true },
      },
      {
        onSuccess: () => {
          notification(
            "Success",
            `Created ${data.name} permission.`,
            "success"
          );
          handleClose();
        },
        onError: (error) => {
          notification("Error", getErrorMessage(error), "error");
        },
      }
    );
  };

  return (
    <Modal handleClose={handleClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Modal.Header handleClose={handleClose}>
            <span className="inter-xlarge-semibold">
              {t("create-role-modal-create-role", "Create Role")}
            </span>
          </Modal.Header>
          <Modal.Content>
            <div className="gap-y-base flex flex-col">
              <InputField
                label={t("create-modal-name", "Name")}
                placeholder={t(
                  "create-permission-modal-placeholder-name-products",
                  "products"
                )}
                required
                {...register("name", { required: true })}
              />
              <InputField
                label={t("create-permission-modal-route", "Route")}
                placeholder={t(
                  "create-permission-modal-placeholder-route-products",
                  "/products"
                )}
                required
                {...register("route", { required: true })}
              />
            </div>
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
                {t("create-modal-create", "Create")}
              </Button>
            </div>
          </Modal.Footer>
        </Modal.Body>
      </form>
    </Modal>
  );
};

export default CreatePermissionModal;
