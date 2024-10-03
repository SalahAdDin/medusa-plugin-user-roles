import { UserService as MedusaUserService, User } from "@medusajs/medusa";
import { UpdateUserInput } from "@medusajs/medusa/dist/types/user";

class UserService extends MedusaUserService {
  async update(
    userId: string,
    update: UpdateUserInput & {
      role_id?: string;
    }
  ): Promise<User> {
    return super.update(userId, update);
  }

  async list(): Promise<User[]> {
    const userRepo = this.activeManager_.getRepository(User);
    return await userRepo.find();
  }

  async removeUsersFromRole(userId, roleId) {
    const userRepo = this.activeManager_.getRepository(User);

    const user = await userRepo.findOne({
      where: {
        id: userId,
      },
    });

    if (user) {
      if (user.role_id === roleId) {
        user.role_id = null;

        await userRepo.save(user);
      } else throw new Error("User has not such role");
    } else throw new Error("User not found");
  }
}

export default UserService;
