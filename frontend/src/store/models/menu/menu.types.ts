import { MenuItem } from './menu-item.types';

export interface Menu {
  description: any;
  _id: string;
  name: string;
  items: MenuItem[];
  createdAt: string;
  updatedAt: string;
}

export interface MenuFormData {
  name: string;
  items: MenuItem[];
}

export interface MenuResponse {
  menus: any[];
  roles: any[];
  message?: string;
} 