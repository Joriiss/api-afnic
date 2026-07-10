import type { AfnicEnvironment } from '../config/environments.js';

export interface SessionUser {
  userId: string;
  email: string;
  afnicClientId: string;
  contactName: string;
  firstName?: string;
  isAdmin: boolean;
  afnicEnvironment: AfnicEnvironment;
}
