export interface Manager {
  userId: number;
  managementPermissions: string | null;
  reportingAccess: string | null;
}