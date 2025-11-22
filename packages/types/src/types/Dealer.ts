import { UserStatus } from './UserStatus';
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
  tierId?: number;
  tier?: Tier;
}
export interface DealerFlatData {
  id?: number;
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
  tierId?: number;
  tierName?: string;
  status: UserStatus;
}

export interface Tier {
  id: number;
  name: string;
}
declare global {
  namespace React {
    type ReactNode = unknown;
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
