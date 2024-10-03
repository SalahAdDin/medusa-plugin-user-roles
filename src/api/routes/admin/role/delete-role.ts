import { Request, Response } from "express";

import RoleService from "../../../../services/role";

export default async (req: Request, res: Response) => {
  const { id } = req.params;
  const roleService = req.scope.resolve("roleService") as RoleService;
  const role = await roleService.deleteRole(id);

  res.json({ role });
};
