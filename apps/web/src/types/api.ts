export interface PaginationMeta { page: number; limit: number; total: number; totalPages: number; hasPreviousPage: boolean; hasNextPage: boolean; }
export interface PaginatedResponse<T> { data: T[]; pagination: PaginationMeta; }
export interface ApiErrorResponse { statusCode?: number; message?: string | string[]; error?: string; }
