import { Request, Response } from "express";

import PermissionService, {
  CreatePayload,
} from "../../../../services/permission";

export default async (req: Request, res: Response) => {
  const data = req.body as CreatePayload;

  const permissionService = req.scope.resolve(
    "permissionService"
  ) as PermissionService;

  const role = await permissionService.create(data);

  res.json(role);
};
