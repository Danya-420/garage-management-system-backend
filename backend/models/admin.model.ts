export interface Administrator {
  userId: number;
  adminLevel: number;
  accessRights: string | null;
  systemPermissions: string | null;
}