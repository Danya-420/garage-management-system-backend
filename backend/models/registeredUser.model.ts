export interface RegisteredUser {
  userId: number;
  membershipId: string | null;
  paymentBalance: number | null;
  notificationSettings: string | null;
}