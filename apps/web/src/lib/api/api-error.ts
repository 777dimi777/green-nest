import axios, { AxiosError } from "axios";

export interface ApiErrorResponse {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

export class ApiError extends Error {
  readonly statusCode?: number;
  readonly error?: string;
  readonly validationMessages: string[];
  readonly originalResponse?: unknown;

  constructor(message: string, options: {
    statusCode?: number; error?: string; validationMessages?: string[]; originalResponse?: unknown;
  } = {}) {
    super(message);
    this.name = "ApiError";
    this.statusCode = options.statusCode;
    this.error = options.error;
    this.validationMessages = options.validationMessages ?? [];
    this.originalResponse = options.originalResponse;
  }
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const payload = axiosError.response?.data;
    const messages = Array.isArray(payload?.message)
      ? payload.message.filter((value): value is string => typeof value === "string")
      : [];
    let message = messages.join(" ");
    if (!message && typeof payload?.message === "string") message = payload.message;
    if (!message && axiosError.code === "ECONNABORTED") message = "Zahtev je istekao. Pokušajte ponovo.";
    if (!message && !axiosError.response) message = "Nije moguće povezati se sa serverom.";
    if (!message) message = "Došlo je do greške pri obradi zahteva.";
    return new ApiError(message, {
      statusCode: axiosError.response?.status ?? payload?.statusCode,
      error: payload?.error,
      validationMessages: messages,
      originalResponse: axiosError.response,
    });
  }
  if (error instanceof Error) return new ApiError(error.message);
  return new ApiError("Došlo je do neočekivane greške.");
}

export function getApiErrorMessage(error: unknown): string {
  return normalizeApiError(error).message;
}
