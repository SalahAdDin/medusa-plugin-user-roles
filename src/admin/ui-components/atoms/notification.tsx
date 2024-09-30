import React from "react";
import type { Toast } from "react-hot-toast";
import { toast as globalToast } from "react-hot-toast";
import {
  ExclamationCircle,
  CheckCircleSolid,
  XMark,
  InformationCircle,
  XCircle,
} from "@medusajs/icons";

import ToasterContainer from "./toaster-container";

export type NotificationTypes = "success" | "warning" | "error" | "info";

type NotificationProps = {
  toast: Toast;
  type: NotificationTypes;
  title: string;
  message: string;
};

const Notification: React.FC<NotificationProps> = ({
  toast,
  type,
  title,
  message,
}) => {
  const onDismiss = () => {
    globalToast.dismiss(toast.id);
  };

  return (
    <ToasterContainer visible={toast.visible} className="w-[380px]">
      <div>{getIcon(type)}</div>
      <div className="ml-small mr-base gap-y-2xsmall flex flex-grow flex-col text-white">
        <span className="inter-small-semibold">{title}</span>
        <span className="inter-small-regular text-grey-20">{message}</span>
      </div>
      <div>
        <button onClick={onDismiss}>
          <XMark size={ICON_SIZE} className="text-grey-40" />
        </button>
        <span className="sr-only">Close</span>
      </div>
    </ToasterContainer>
  );
};

const ICON_SIZE = 20;

function getIcon(type: NotificationTypes) {
  switch (type) {
    case "success":
      return <CheckCircleSolid size={ICON_SIZE} className="text-emerald-40" />;
    case "warning":
      return <ExclamationCircle size={ICON_SIZE} className="text-orange-40" />;
    case "error":
      return <XCircle size={ICON_SIZE} className="text-rose-40" />;
    default:
      return <InformationCircle size={ICON_SIZE} className="text-grey-40" />;
  }
}

export default Notification;
