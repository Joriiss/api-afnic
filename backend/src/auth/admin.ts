import { config } from '../config.js';

export function isAdminEmail(email: string): boolean {
  return config.adminEmails.has(email.trim().toLowerCase());
}
