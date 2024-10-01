import React from "react";
import { useAdminCustomPost } from "medusa-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import Button from "../fundamentals/button";
import useNotification from "../hooks/use-notification";
import InputField from "../molecules/input";
import Modal from "../molecules/modal";
import { getErrorMessage } from "../utils/error-messages";

import { CreateModalProps } from "./types";

type CreateRoleModalFormData = {
  name: string;
};

const CreateRoleModal: React.FC<CreateModalProps> = ({ handleClose }) => {
  const notification = useNotification();
  const { t } = useTranslation();

  const { mutate: createRole, isLoading } = useAdminCustomPost(
    "/roles/create-role",
    ["create-role"]
  );

  const { register, handleSubmit } = useForm<CreateRoleModalFormData>();

  const onSubmit = (data: CreateRoleModalFormData) => {
    createRole(
      {
        name: data.name,
      },
      {
        onSuccess: () => {
          notification("Success", `Created ${data.name} role.`, "success");
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
                  "create-role-modal-content-manager",
                  "Content Manager"
                )}
                required
                {...register("name", { required: true })}
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

export default CreateRoleModal;
