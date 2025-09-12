export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type LoginResponse<T> = Promise<
  ApiResponse<{ data: T; accessToken: string }>
>;


export function successResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

export function errorResponse(error: unknown): ApiResponse<null> {
  const message = error instanceof Error ? error.message : 'Unknown error';
  return { success: false, error: message };
}