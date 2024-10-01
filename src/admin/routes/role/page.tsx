import { PlusMini } from "@medusajs/icons";
import {
  Button,
  Container,
  Text,
  Drawer,
  Label,
  Input,
  Table,
} from "@medusajs/ui";
import { useAdminCustomQuery, useAdminCustomPost } from "medusa-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import BackButton from "../../ui-components/atoms/back-button";
import Spinner from "../../ui-components/atoms/spinner";
import BodyCard from "../../ui-components/organisms/body-card";
import UserTable from "../../ui-components/templates/user-table";
import PermissionTable from "../../ui-components/templates/permission-table";
import CreatePermissionModal from "../../ui-components/organisms/create-permission-modal";

const SetPermission = () => {
  const { t } = useTranslation();
  const { "*": id } = useParams();

  const [refetchFlag, setRefetchFlag] = useState(false);
  const [showCreatePermissionModal, setShowCreatePermissionModal] =
    useState(false);

  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);
  const [newPermission, setNewPermission] = useState({
    name: "",
    metadata: "",
  });
  const [nameError, setNameError] = useState("");
  const [metadataError, setMetadataError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerOpen1, setDrawerOpen1] = useState(false);
  const [drawerOpen2, setDrawerOpen2] = useState(false);

  // Hook#1 for getting all permission from database
  const {
    data: permissionsData,
    isLoading: permissionsLoading,
    error: permissionsError,
  } = useAdminCustomQuery("/roles/get-permission", []);

  // Hook#2 for getting all permission of a single role
  const {
    data: roleData,
    isLoading: roleIsloading,
    error: roleError,
    refetch,
  } = useAdminCustomQuery(`/roles/get-rolepermissions/${id}`, [
    "getRolePermissions",
  ]);

  const triggerRefetch = () => {
    setRefetchFlag((prev) => !prev);
  };

  useEffect(() => {
    if (refetchFlag) {
      refetch();
      setRefetchFlag(false);
    }
  }, [refetchFlag]);

  // Hook#3 for updating the role permissons
  const {
    mutate: updaterole,
    isLoading: isUpdating,
    error: iserror,
  } = useAdminCustomPost(`/roles/update-permissions/${id}`, [
    "updateRolesPermissions",
  ]);

  // Hook#5 list all users
  const {
    data: usersData,
    isLoading: userLoading,
    error: userError,
  } = useAdminCustomQuery("/roles/getAllUsers", []);

  // Hooks# 6 update the role_id inside the user entity

  const {
    mutate: updateRoleInUser,
    isLoading: updateroleLoading,
    error: updateroleError,
  } = useAdminCustomPost(`roles/${id}/user`, ["setRolestouser"]);

  // Hook# 7 for removing the permission from a role

  const {
    mutate: removePermission,
    isLoading: removePermissionloading,
    error: removePermissionerror,
  } = useAdminCustomPost(`roles/remove-permissions`, ["removePermissions"]);

  // Hook# 8 for removing the users from role

  const {
    mutate: removeRoleUsers,
    isLoading: removeRoleUsersloading,
    error: removeRoleUserserror,
  } = useAdminCustomPost(`roles/remove-users`, ["removeUsers"]);

  // Hook 1
  if (permissionsLoading) {
    return <div>Loading...</div>;
  }

  if (permissionsError) {
    return <div>Error: {permissionsError.message}</div>;
  }
  // Hook 2
  if (roleIsloading) {
    return <div>Loading...</div>;
  }

  if (roleerror) {
    return <div>Error: {roleerror.message}</div>;
  }
  //Hook 3
  if (isUpdating) {
    return <div>Loading...</div>;
  }

  if (iserror) {
    return <div>Error: {iserror.message}</div>;
  }
  //Hook 4
  if (userLoading) {
    return <div>Loading...</div>;
  }

  if (userError) {
    return <div>Error: {userError.message}</div>;
  }
  // Hook 5
  if (updateroleLoading) {
    return <div>Loading...</div>;
  }

  if (updateroleError) {
    return <div>Error: {updateroleError.message}</div>;
  }
  // hook 7
  if (removePermissionloading) {
    return <div>Loading...</div>;
  }

  if (removePermissionerror) {
    return <div>Error: {removePermissionerror.message}</div>;
  }
  // hook 8

  if (removeRoleUsersloading) {
    return <div>Loading...</div>;
  }

  if (removeRoleUserserror) {
    return <div>Error: {removeRoleUserserror.message}</div>;
  }

  const permissions = roleData.role.permissions;
  const users = roleData.role.users;

  // hook 3 handle checkbox
  const handlePermissionToggle = (permission) => {
    const selectedPermissionIds = selectedPermissions.map((p) => p.id);

    if (selectedPermissionIds.includes(permission.id)) {
      // Permission is already selected, remove it
      const updatedPermissions = selectedPermissions.filter(
        (p) => p.id !== permission.id
      );
      setSelectedPermissions(updatedPermissions);
    } else {
      // Permission is not selected, add it
      setSelectedPermissions([...selectedPermissions, permission]);
    }
  };
  const handleUpdatePermissions = () => {
    updaterole(selectedPermissions);
    setSelectedPermissions([]);
    setDrawerOpen1(false);
  };

  // Here we handle the Selected Users
  const handleUsersToggle = (user) => {
    const selectedUserIds = selectedUser.map((p) => p.id);

    if (selectedUserIds.includes(user.id)) {
      // Permission is already selected, remove it
      const updatedUsers = selectedUser.filter((p) => p.id !== user.id);
      setSelectedUser(updatedUsers);
    } else {
      // Permission is not selected, add it
      setSelectedUser([...selectedUser, user]);
    }
  };
  // zzz
  const handleSelectedUser = () => {
    const newIds = selectedUser.map((user) => user.id);

    for (const singleId of newIds) {
      const abc = [singleId];
      console.log(abc);
      updateRoleInUser(abc);
    }

    // Clear selectedUser and close the drawer
    setSelectedUser([]);
    setDrawerOpen2(false);
  };

  const handlecancel = () => {
    setNewPermission({
      name: "",
      metadata: "",
    });

    setMetadataError("");

    setNameError("");
    setDrawerOpen(false);
  };

  // Handle remove permission from a role

  const handleRemovePermission = (permission_id) => {
    const ids = {
      role_id: id,
      permission_id,
    };
    removePermission(ids);
  };

  // Handle remove users from a role

  const handleRemoveUsers = (user_id) => {
    const ids = {
      user_id,
      id,
    };
    removeRoleUsers(ids);
  };

  const handleNameChange = (e) => {
    const { value } = e.target;
    setNewPermission({
      ...newPermission,
      name: value,
    });
    if (nameError) {
      setNameError("");
    }
  };

  const handleMetadataChange = (e) => {
    const { value } = e.target;
    setNewPermission({
      ...newPermission,
      metadata: value,
    });
    if (metadataError) {
      setMetadataError("");
    }
  };

  const actionables = [
    {
      label: t("roles-create-permission", "Create Permission"),
      onClick: () => {
        setShowCreatePermissionModal(true);
        return null;
      },
      icon: (
        <span className="text-grey-90">
          <PlusMini />
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="flex w-full grow flex-col">
          <BackButton
            path="/a/settings/user-roles"
            label={t("roles-back-to-settings", "Back to Roles")}
            className="mb-xsmall"
          />
          <BodyCard
            title={`${t("roles-name-title", "Roles Name")}: ${
              roleData.role.name
            }`}
            actionables={actionables}
          >
            <div className="flex grow flex-col justify-between">
              <h2 className="text-grey-90 inter-large-semibold">
                {t("roles-permissions-title", "Permissions")}
              </h2>
              <PermissionTable
                roleId={roleData.role.id}
                permissions={permissions}
                triggerRefetch={() => {
                  triggerRefetch();
                }}
              />
              <p className="inter-small-regular text-grey-50">
                {t("roles-permissions-count", "{{count}}", {
                  count: permissions.length ?? 0,
                })}
              </p>
            </div>
            {showCreatePermissionModal && (
              <CreatePermissionModal
                handleClose={() => {
                  triggerRefetch();
                  setShowCreatePermissionModal(false);
                }}
              />
            )}
          </BodyCard>
        </div>
      </div>

      <div>
        <Container>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text size="base" weight="plus" family="sans">
              Role Name: {roleData.role.name}
              <br />
            </Text>
          </div>
        </Container>
        <br />
        <Container>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text size="base" weight="plus" family="sans">
              <h1> Permissions : </h1>
              <br />
            </Text>

            <Drawer open={drawerOpen1}>
              <Drawer.Trigger asChild>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setDrawerOpen1(true);
                  }}
                >
                  Add Permissions
                </Button>
              </Drawer.Trigger>
              <Drawer.Content>
                <Drawer.Header>
                  <Drawer.Title>
                    Assign Permissions to selected Role
                  </Drawer.Title>
                </Drawer.Header>
                <Drawer.Body className="p-4">
                  <Text>List of all Permission&apos;s</Text>

                  <br />
                  <br />
                  <Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>Permission</Table.HeaderCell>
                        <Table.HeaderCell>Route</Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {permissionsData.permission.map((permission, index) => (
                        <Table.Row key={index}>
                          <Table.Cell
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <input
                              type="checkbox"
                              id={`permission-checkbox-${permission.id}`}
                              checked={selectedPermissions.some(
                                (p) => p.id === permission.id
                              )}
                              onChange={() =>
                                handlePermissionToggle(permission)
                              }
                              disabled={permissions.some(
                                (p) => p.id === permission.id
                              )}
                              style={{
                                width: "20px",
                                height: "20px",
                                border: "2px solid #FFFFFF",
                                marginRight: "10px",
                              }}
                            />
                            <Label
                              htmlFor={`permission-checkbox-${permission.id}`}
                            ></Label>
                            {permission.name}
                          </Table.Cell>
                          <Table.Cell>
                            {JSON.stringify(permission.metadata)}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </Drawer.Body>
                <Drawer.Footer>
                  <Drawer.Close asChild>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSelectedPermissions([]);
                        setDrawerOpen1(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </Drawer.Close>
                  <Button onClick={handleUpdatePermissions}>Save</Button>
                </Drawer.Footer>
              </Drawer.Content>
            </Drawer>
          </div>
          {/* Table that display All permissions of a selected role */}
          <div>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>#</Table.HeaderCell>
                  <Table.HeaderCell>Name</Table.HeaderCell>
                  <Table.HeaderCell>Route</Table.HeaderCell>
                  <Table.HeaderCell></Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {permissions.map((permission, index) => (
                  <Table.Row key={permission.id}>
                    <Table.Cell>{index + 1}</Table.Cell>

                    <Table.Cell>{permission.name}</Table.Cell>
                    <Table.Cell>
                      {JSON.stringify(permission.metadata)}
                    </Table.Cell>
                    <Table.HeaderCell>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          handleRemovePermission(permission.id);
                        }}
                      >
                        Delete
                      </Button>
                    </Table.HeaderCell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </Container>
        <br />
        <Container>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text size="base" weight="plus" family="sans">
              <h1>Users :</h1>
              <br />
            </Text>
            <div style={{ marginLeft: "75%" }}>
              <Drawer open={drawerOpen2}>
                <Drawer.Trigger asChild>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setDrawerOpen2(true);
                    }}
                  >
                    Add User
                  </Button>
                </Drawer.Trigger>
                <Drawer.Content>
                  <Drawer.Header>
                    <Drawer.Title>Assign Role</Drawer.Title>
                  </Drawer.Header>
                  <Drawer.Body className="p-4">
                    <Text>List of all user&apos;s</Text>
                    <br />

                    <br />
                    <br />
                    <Table>
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell>First Name</Table.HeaderCell>
                          <Table.HeaderCell>Last Name</Table.HeaderCell>
                          <Table.HeaderCell>Email</Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {usersData.users.map((user, index) => (
                          <Table.Row key={index}>
                            <Table.Cell
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <input
                                type="checkbox"
                                id={`permission-checkbox-${user.id}`}
                                checked={selectedUser.some(
                                  (p) => p.id === user.id
                                )}
                                onChange={() => handleUsersToggle(user)}
                                disabled={users.some((p) => p.id === user.id)}
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  border: "2px solid #FFFFFF",
                                  marginRight: "10px",
                                }}
                              />
                              <Label
                                htmlFor={`permission-checkbox-${user.id}`}
                              ></Label>
                              {user.name}
                            </Table.Cell>
                            <Table.Cell>{user.first_name}</Table.Cell>
                            <Table.Cell>{user.last_name}</Table.Cell>
                            <Table.Cell>{user.email}</Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                  </Drawer.Body>
                  <Drawer.Footer>
                    <Drawer.Close asChild>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSelectedUser([]);
                          setDrawerOpen2(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </Drawer.Close>

                    <Button onClick={handleSelectedUser}>Save</Button>
                  </Drawer.Footer>
                </Drawer.Content>
              </Drawer>
            </div>

            <br />
          </div>
          <div>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>#</Table.HeaderCell>
                  <Table.HeaderCell>First Name</Table.HeaderCell>
                  <Table.HeaderCell>Last Name</Table.HeaderCell>
                  <Table.HeaderCell>Email</Table.HeaderCell>
                  <Table.HeaderCell></Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {users.map((user, index) => (
                  <Table.Row key={index}>
                    <Table.Cell>{index + 1}</Table.Cell>
                    <Table.Cell>{user.first_name}</Table.Cell>
                    <Table.Cell>{user.last_name}</Table.Cell>
                    <Table.Cell>{user.email}</Table.Cell>
                    <Table.Cell>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          handleRemoveUsers(user.id);
                        }}
                      >
                        Delete
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </Container>
      </div>
    </>
  );
};

export default SetPermission;
