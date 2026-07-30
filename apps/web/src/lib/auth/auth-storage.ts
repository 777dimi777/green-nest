const ACCESS_TOKEN_KEY = "green-nest-access-token";
const REFRESH_TOKEN_KEY = "green-nest-refresh-token";

const canUseStorage = () => typeof window !== "undefined";

export const authStorage = {
  getAccessToken: () =>
    canUseStorage() ? window.localStorage.getItem(ACCESS_TOKEN_KEY) : null,
  getRefreshToken: () =>
    canUseStorage() ? window.localStorage.getItem(REFRESH_TOKEN_KEY) : null,
  setTokens: (accessToken: string, refreshToken: string) => {
    if (!canUseStorage()) return;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clearTokens: () => {
    if (!canUseStorage()) return;
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
