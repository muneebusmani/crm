import { ApiResponse } from '@crm/types/Api';
import { User } from '@crm/types/User';

export type LoginResponse = Promise<
  ApiResponse<{ user: User; accessToken: string }>
>;
