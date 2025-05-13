export interface User {
  twoFactorEnabled: any;
  roles: never[];
  permissions: never[];
  _id: string;
  username: string;
  email: string;
  password?: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
} 