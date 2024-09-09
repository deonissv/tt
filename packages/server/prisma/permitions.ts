// const _permissions: Pick<Permission, 'roleId' | 'action' | 'subject' | 'conditions'> = [
const _permissions = [
  // Admin.
  {
    roleId: 1,
    action: 'manage',
    subject: 'all',
  },
  // Games
  // Games - User
  {
    roleId: 2,
    action: 'create',
    subject: 'Game',
  },
  {
    roleId: 2,
    action: 'read',
    subject: 'Game',
  },
  {
    roleId: 2,
    action: 'update',
    subject: 'Game',
    conditions: { authorId: '${ userId }' },
  },
  {
    roleId: 2,
    action: 'delete',
    subject: 'Game',
    conditions: { authorId: '${ userId }' },
  },
  // Games - Guest
  {
    roleId: 3,
    action: 'read',
    subject: 'Game',
  },
  // Users
  // Users - User
  {
    roleId: 2,
    action: 'create',
    subject: 'User',
  },
  {
    roleId: 2,
    action: 'read',
    subject: 'User',
  },
  {
    roleId: 2,
    action: 'update',
    subject: 'User',
    conditions: { userId: '${ userId }' },
  },
  {
    roleId: 2,
    action: 'delete',
    subject: 'User',
    conditions: { userId: '${ userId }' },
  },
  // Users - Guest
  {
    roleId: 3,
    action: 'read',
    subject: 'User',
  },
  // Rooms
  // Rooms - User
  {
    roleId: 2,
    action: 'create',
    subject: 'Room',
  },
  {
    roleId: 2,
    action: 'read',
    subject: 'Room',
  },
  {
    roleId: 2,
    action: 'delete',
    subject: 'Room',
    conditions: { creatorId: '${ userId }' },
  },
  // Rooms - Guest
  {
    roleId: 3,
    action: 'read',
    subject: 'Room',
  },
];

export const roles = [
  {
    roleId: 1,
    name: 'Admin',
  },
  {
    roleId: 2,
    name: 'User',
  },
  {
    roleId: 3,
    name: 'Guest',
  },
];

export const permissions = _permissions.map((permission, idx) => ({
  permissionId: idx,
  roleId: permission.roleId,
  action: permission.action,
  subject: permission.subject,
  conditions: permission.conditions,
}));
