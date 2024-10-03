import { Request, Response } from "express";

import UserService from "../../../../services/user";

export default async (req: Request, res: Response) => {
  const { id, userId } = req.params;
  const userService = req.scope.resolve("userService") as UserService;
  const role = await userService.removeUsersFromRole(userId, id);

  res.json({ role });
};
