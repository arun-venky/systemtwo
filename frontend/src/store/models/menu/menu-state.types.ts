import { MenuItem } from './menu-item.types';

export interface MenuState {
  isAuthenticated: false;
  user: null;
  token: null;
  refreshToken: null;
  permissions: [];
  roles: [];
  menuItemsCache: Record<string, MenuItem[]>;
} 