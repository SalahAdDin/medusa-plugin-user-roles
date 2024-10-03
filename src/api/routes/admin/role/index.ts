import { wrapHandler } from "@medusajs/utils";
import { Router } from "express";

import associateUsers from "./associate-user";
import createRole from "./create-role";
import createPermission from "./create-permission";
import deleteRole from "./delete-role";
import listUsers from "./get-all-users";
import listPermissions from "./get-permission";
import listRoles from "./get-roles";
import getRoleById from "./get-role-by-id";
import removePermission from "./remove-permission";
import removeUser from "./remove-user";
import assignPermissions from "./update-role-permissions";

const router = Router();

export default (adminRouter: Router) => {
  adminRouter.use("/roles", router);

  router.get("/get-roles", wrapHandler(listRoles));
  router.post("/create-role", wrapHandler(createRole));
  router.delete("/delete-role/:id", wrapHandler(deleteRole));

  router.get("/get-all-permissions", wrapHandler(listPermissions));
  router.get("/get-role-permissions/:id", wrapHandler(getRoleById));
  router.post("/create-permission", wrapHandler(createPermission));
  router.post("/update-permissions/:id", wrapHandler(assignPermissions));
  router.delete(
    "/remove-permissions/:id/:permissionId",
    wrapHandler(removePermission)
  );

  router.get("/get-all-users", wrapHandler(listUsers));
  router.post("/:id/update-users", wrapHandler(associateUsers));
  router.delete("/:id/remove-user/:userId", wrapHandler(removeUser));
};
