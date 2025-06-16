export interface User {
    userId: number;
    name: string;
    email: string;
    phone: string;
    passwordHash: string;
    photoUrl?: string; 
}
