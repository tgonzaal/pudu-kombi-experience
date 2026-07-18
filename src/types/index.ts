/**
 * Tipos compartidos del proyecto.
 */

export interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
}

export interface Feature {
  title: string;
  description: string;
  icon?: string;
}
