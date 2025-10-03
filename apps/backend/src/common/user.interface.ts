import { Request } from 'express';

export interface RequestUser {
  id: number;
  email: string;
  role: string;
}
export interface AuthenticatedRequest extends Request {
  user: RequestUser;
}
