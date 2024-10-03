import { wrapHandler } from "@medusajs/utils";
import { Router } from "express";

import create from "./create-role";
import associateUsers from "./associate-user";
import listRoles from "./get-roles";
import listPermissions from "./get-permission";
import reterieve1 from "./getRoleById";
import assignPermissions from "./update-role-permissions";
import createPermission from "./createPermission";
import listUsers from "./getAllUsers";
import deleteRole from "./delete-role";
import removePermission from "./remove-permission";
import removeUser from "./remove-user";

const router = Router();

export default (adminRouter: Router) => {
  adminRouter.use("/roles", router);

  router.get("/get-roles", wrapHandler(listRoles));
  router.post("/create-role", wrapHandler(create));
  router.delete("/delete-role/:id", wrapHandler(deleteRole));

  router.get("/get-all-permissions", wrapHandler(listPermissions));
  router.post("/create-permission", wrapHandler(createPermission));
  router.post("/update-permissions/:id", wrapHandler(assignPermissions));
  router.get("/get-rolepermissions/:id", wrapHandler(reterieve1));
  router.delete(
    "/remove-permissions/:id/:permissionId",
    wrapHandler(removePermission)
  );

  router.get("/get-all-users", wrapHandler(listUsers));
  router.post("/:id/update-users", wrapHandler(associateUsers));
  router.delete("/:id/remove-user/:userId", wrapHandler(removeUser));
};
