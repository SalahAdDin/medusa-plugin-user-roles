import type { MiddlewaresConfig, UserService } from "@medusajs/medusa";
import type {
  MedusaRequest,
  MedusaResponse,
  MedusaNextFunction,
} from "@medusajs/medusa";

export const permissions = async (
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  if (!req.user || !req.user.userId) {
    next();
    return;
  }
  // retrieve currently logged-in user
  const userService = req.scope.resolve("userService") as UserService;
  const loggedInUser = await userService.retrieve(req.user.userId, {
    select: ["id"],
    relations: ["teamRole", "teamRole.permissions"],
  });

  if (!loggedInUser.teamRole) {
    // considered as super user
    next();
    return;
  }

  const isAllowed = loggedInUser.teamRole?.permissions.some((permission) => {
    const metadataKey = Object.keys(permission.metadata).find(
      (key) => key === req.path
    );
    if (!metadataKey) {
      return false;
    }

    // boolean value
    return permission.metadata[metadataKey];
  });

  if (isAllowed) {
    next();
    return;
  }

  // deny access
  res.sendStatus(401);
};

export const config: MiddlewaresConfig = {
  routes: [
    {
      matcher: "/admin/*",
      middlewares: [permissions],
    },
  ],
};
