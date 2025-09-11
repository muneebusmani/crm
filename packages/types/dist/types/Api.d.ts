export type ApiResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
};
export type LoginResponse<T> = Promise<ApiResponse<{
    data: T;
    accessToken: string;
}>>;
