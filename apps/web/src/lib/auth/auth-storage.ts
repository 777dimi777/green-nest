const ACCESS_TOKEN_KEY = "green-nest-access-token";

const canUseStorage = () => typeof window !== "undefined";

export const authStorage = {
  getAccessToken: () => canUseStorage() ? window.localStorage.getItem(ACCESS_TOKEN_KEY) : null,
  setAccessToken: (token: string) => {
    if (canUseStorage()) window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  clearAccessToken: () => {
    if (canUseStorage()) window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
};
