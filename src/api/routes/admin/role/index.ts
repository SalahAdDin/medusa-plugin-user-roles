import { wrapHandler } from "@medusajs/utils";
import { Router } from "express";
import create from "./create-role";
import associateUser from "./associate-user";
import listRoles from "./get-roles";
import listPermissions from "./get-permission";
import reterieve1 from "./getRoleById";
import updateRolePermissions from "./updateRolePermissions";
import createPermission from "./createPermission";
import list from "./getAllUsers";
import deleteRole from "./delete-role";
import removePermission from "./removepermission";
import removeUsersfromRole from "./remove-user";

const router = Router();

export default (adminRouter: Router) => {
  adminRouter.use("/roles", router);

  router.get("/get-roles", wrapHandler(listRoles));
  router.post("/create-role", wrapHandler(create));
  router.delete("/delete-role/:id", wrapHandler(deleteRole));

  router.get("/get-all-permissions", wrapHandler(listPermissions));
  router.post("/create-permission", wrapHandler(createPermission));
  router.post("/update-permissions/:id", wrapHandler(updateRolePermissions));
  router.get("/get-rolepermissions/:id", wrapHandler(reterieve1));
  router.post("/remove-permissions", wrapHandler(removePermission));

  router.post("/:id/user", wrapHandler(associateUser));
  router.get("/getAllUsers", wrapHandler(list));
  router.post("/remove-users", wrapHandler(removeUsersfromRole));
};
