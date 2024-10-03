import { TransactionBaseService } from "@medusajs/medusa";
import { Role } from "../models/role";
import RoleRepository from "../repositories/role";
import PermissionService, {
  CreatePayload as PermissionCreatePayload,
} from "./permission";
import UserService from "./user";
import { Any } from "typeorm";

type CreatePayload = Pick<Role, "name"> & {
  permissions?: PermissionCreatePayload[];
};

type InjectedDependencies = {
  roleRepository: typeof RoleRepository;
  permissionService: PermissionService;
  userService: UserService;
};

class RoleService extends TransactionBaseService {
  protected readonly roleRepository_: typeof RoleRepository;
  protected readonly permissionService_: PermissionService;
  protected readonly userService_: UserService;

  constructor(container: InjectedDependencies) {
    super(container);

    this.roleRepository_ = container.roleRepository;
    this.permissionService_ = container.permissionService;
    this.userService_ = container.userService;
  }

  async listRoles(): Promise<Array<TRoleWithCounts>> {
    const roleRepo = this.manager_.withRepository(this.roleRepository_);
    const roles = await roleRepo.find({
      relations: ["permissions", "users"],
    });

    const rolesWithCounts = roles.map(({ permissions, users, ...rest }) => {
      const permissionsLabels = permissions?.map(
        (permission) => permission.name
      );
      const usersCount = users ? users.length : 0;

      return {
        ...rest,
        permissions: permissionsLabels,
        usersCount,
      };
    });

    return rolesWithCounts;
  }

  async deleteRole(id) {
    const roleRepo = this.manager_.withRepository(this.roleRepository_);
    const role = await roleRepo.findOne({
      where: { id },
    });

    if (role) {
      await roleRepo.remove(role);
    } else {
      // Handle the case where the role with the given ID doesn't exist
      throw new Error("Role not found");
    }
  }

  async retrieve(id: string): Promise<Role> {
    // for simplicity, we retrieve all relations
    // however, it's best to supply the relations
    // as an optional method parameter
    const roleRepo = this.manager_.withRepository(this.roleRepository_);
    return await roleRepo.findOne({
      where: {
        id,
      },
      relations: ["permissions", "users"],
    });
  }

  async create(name: any) {
    // return this.atomicPhase_(async (manager) => {
    // omitting validation for simplicity
    // const { permissions: permissionsData = [] } = data
    // delete data.permissions

    const roleRepo = this.manager_.withRepository(this.roleRpository_);
    const role = roleRepo.create(name);

    // role.permissions = [];

    // for (const permissionData of permissionsData) {
    //   role.permissions.push(
    //     await this.permissionService_.create(permissionData)
    //   );
    // }{"/roles/get-roles": true}
    const result = await roleRepo.save(role);

    return result;
    // });
  }

  async updateRolePermissions(id, updatedData) {
    const roleRepo = this.manager_.withRepository(this.roleRepository_);
    const role = await roleRepo.findOne({
      where: {
        id,
      },
      relations: ["permissions"], // Load the existing permissions
    });

    role.permissions = updatedData;

    // Save the updated role
    const result = await roleRepo.save(role);

    return result;
  }

  async associateUser(role_id: string, user_id: string): Promise<Role> {
    return this.atomicPhase_(async () => {
      // omitting validation for simplicity
      await this.userService_.update(user_id, {
        role_id,
      });

      return await this.retrieve(role_id);
    });
  }

  async removePermission(roleId, permissionId) {
    const roleRepo = this.manager_.withRepository(this.roleRepository_);

    const role = await roleRepo.findOne({
      where: { id: roleId },
      relations: ["permissions"],
    });

    if (role) {
      const permissionIndex = role.permissions.findIndex(
        (permission) => permission.id === permissionId
      );

      if (permissionIndex === -1) {
        throw new Error("Permission not found");
      }

      role.permissions.splice(permissionIndex, 1);

      await roleRepo.save(role);
    } else {
      // Handle the case where the role with the given ID doesn't exist
      throw new Error("Role not found");
    }
  }
}

export default RoleService;
