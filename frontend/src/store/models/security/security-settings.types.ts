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
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  minLength: number;
  maxLength: number;
  minPasswordLength: number;
  maxPasswordLength: number;
  require2FA: boolean;
  enableSessionLock: boolean;
  sessionLockTimeout: number;
  sessionLockAttempts: number;
  sessionLockDuration: number;
  sessionLockMessage: string;
  sessionLockEnabled: boolean;  
} 
