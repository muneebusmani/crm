import { File } from 'zod/v4/core/schemas.cjs';

export interface Dealer {
  // id: number;
  name: string;
  // email: string;
  // username: string;
  owner: string;
  location: string;
  logo: string;
  logoFile: File | null;
  website: string;
  contactEmail: string;
  tier: Tier;
}
export interface DealerFlatData {
  name: string;
  email: string;
  username: string;
  password: string;
  owner: string;
  location: string;
  logo: string; // preview URL
  logoFile: File | null;
  website: string;
  contactEmail: string;
  tierId: number;
}

export interface Tier {
  id: number;
  name: string;
}
declare global {
  namespace React {
    type ReactNode = any;
  }
}
export interface QuickAction {
  title: string;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  action: () => void;
}

export interface Highlight {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

export interface Notification {
  id: number;
  title: string;
  description: string;
  type: 'warning' | 'info' | 'success';
  time: string;
}

export interface Task {
  id: number;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}
