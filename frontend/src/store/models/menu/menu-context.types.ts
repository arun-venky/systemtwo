import { Menu } from './menu.types';
import { MenuItem } from './menu-item.types';
import { Role } from '../role/role.types';

export interface MenuContext {
  menus: Menu[];
  roles: Role[];
  selectedMenu: Menu | null;
  errorMessage: string | null;
  isLoading: boolean;
  menuItems: MenuItem[];
  formData: {
    name: string;
    items: MenuItem[];
  };
} 