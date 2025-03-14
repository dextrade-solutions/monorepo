import ky from 'ky';

import AuthService from './service.auth';

const BASE_API_CONFIG = {
  prefixUrl: 'https://api-int.dextrade.com/v1', // Consider using environment variables for this
  headers: {
    'Content-Type': 'application/json',
  },
};
const getAuthDataFrom = () => {
  const data = localStorage.getItem('user-data');
  return data && JSON.parse(data);
};
// Function to read the Bearer token from localStorage
const getAuth = () => {
  const userData = getAuthDataFrom();
  return {
    accessToken: userData?.auth?.accessToken,
    refreshToken: userData?.auth?.refreshToken,
  };
};

export const saveAuthData = (accessToken: string, refreshToken: string) => {
  const userData = getAuthDataFrom();
  localStorage.setItem(
    'user-data',
    JSON.stringify({
      ...(userData || {}),
      auth: { accessToken, refreshToken },
    }),
  );
};

export const $invoiceApi = ky.create({
  prefixUrl: 'https://dexpay-api.dextrade.com',
});

export const $api = ky.create({
  ...BASE_API_CONFIG,
  timeout: false,
  retry: 0,
  hooks: {
    beforeRequest: [
      (request) => {
        const { accessToken } = getAuth();
        if (accessToken) {
          request.headers.set('Authorization', `Bearer ${accessToken}`); // Set Authorization only if token is present.
        } else {
          // Consider what to do if token is NOT present. Perhaps redirect to login.
          console.warn('No token found.  API requests may fail.');
        }
      },
    ],
    afterResponse: [
      async (_request, _opts, response) => {
        if (!response.ok) {
          if (response.status === 401) {
            console.error('Unauthorized. Token may have expired.');

            handleRefreshToken();
          }
          const errorData = await response.json(); // Attempt to parse JSON error data
          const errorMessage =
            errorData?.message ||
            errorData?.error ||
            'An unknown error occurred.'; // Extract the message
          throw new Error(errorMessage); // Throw a new error with the message
        }
        return response;
      },
    ],
  },
});

const hardLogout = () => {
  localStorage.removeItem('user-data');
  window.location.reload();
};

let isRefreshing = false;

async function handleRefreshToken() {
  if (isRefreshing) {
    // Check if a refresh is already in progress
    return; // If so, exit immediately to avoid multiple refresh requests
  }

  isRefreshing = true; // Set the flag to indicate refresh is in progress

  const { refreshToken } = getAuth();

  if (refreshToken) {
    try {
      const refreshResponse = await AuthService.refresh({
        token: refreshToken,
      });

      saveAuthData(refreshResponse.access_token, refreshResponse.refresh_token);
      // Optionally, retry the original request that triggered the refresh
    } catch (refreshError) {
      console.error('Refresh token failed:', refreshError);
      // Handle refresh token failure (e.g., redirect to login, clear tokens)
      hardLogout();
    } finally {
      isRefreshing = false; // Reset the flag regardless of success or failure
    }
  } else {
    console.error('No refresh token found.');
    isRefreshing = false; // Reset the flag in this case as well
    // Redirect to login as there's no refresh token
  }
}
