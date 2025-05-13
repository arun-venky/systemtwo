export interface MenuItem {
  _id?: string;
  label: string;
  url: string;
  roles: string[];
  order: number;
  isActive?: boolean;
  icon?: string;
} 