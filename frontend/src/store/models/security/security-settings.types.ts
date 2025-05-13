export interface SecuritySettings {
  jwtExpiration: string;
  refreshTokenExpiration: string;
  passwordStrengthRegex: string;
  passwordPolicy: boolean;
  twoFactorAuth: boolean;
  sessionTimeout: number;
  failedLoginAttempts: number;
  activeSessions: number;
  lastSecurityScan: string;
} 