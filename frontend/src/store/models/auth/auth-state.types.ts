import { User } from '../user/user.types';

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    permissions: string[];
    roles: string[];
} 