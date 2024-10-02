import { Request, Response } from "express";

import RoleService from "../../../../services/role";

export default async (req: Request, res: Response): Promise<void> => {
  // omitting validation for simplicity purposes
  const { id } = req.params;
  const usersIds = req.body;
  const roleService = req.scope.resolve("roleService") as RoleService;

  if (!Array.isArray(usersIds)) {
    res.status(400).json({ message: "userIds must be an array" });

    return;
  }

  try {
    // Use Promise.allSettled to associate each userId with the role
    const results = await Promise.allSettled(
      usersIds.map((userId: string) => roleService.associateUser(id, userId))
    );

    const fulfilled = results
      .filter(
        (result): result is PromiseFulfilledResult<any> =>
          result.status === "fulfilled"
      )
      .map((result) => result.value);

    const rejected = results
      .filter(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected"
      )
      .map((result) => result.reason);

    res.json({
      message: "Association results",
      successfulAssociations: fulfilled,
      failedAssociations: rejected,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};
