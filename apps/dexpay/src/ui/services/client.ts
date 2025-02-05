import ky from 'ky';

import AuthService from './service.auth';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const BASE_API_CONFIG = {
  prefixUrl: 'https://api-int.dextrade.com/v1', // Consider using environment variables for this
  headers: {
    'Content-Type': 'application/json',
  },
};

// Function to read the Bearer token from localStorage
const getAuth = () => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  return {
    accessToken,
    refreshToken,
  };
};

export const saveAuthData = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

if (!getAuth().accessToken) {
  saveAuthData(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl9pZCI6OTczOCwidHlwZSI6ImFjY2VzcyIsInRva2VuIjoiZkxQemo2c2ZDNmtSanVxSXVUVkViREFrSFBLS2kydmVpd0ZJd2lnTnNPMl9rT1o5cWNNa0xQNExnYVhST2VidktqcyIsImlhdCI6MTczODcyNTg2NSwiZXhwIjoxNzM4NzMzMDY1fQ.Kq8gVXYenJMIP8TqQiWpTp8La18P_dAkNYdLes5u4z0',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl9pZCI6OTc0OSwidHlwZSI6InJlZnJlc2giLCJ0b2tlbiI6Inozc2lYVlJaMDhjTThiMHRBRGczOWxHcVdENHR1YnRCQ2h1V3NMblQwOHpKMkJlT2NDV0JBRGlxRjVvS2ZuN3Fwb1UiLCJpYXQiOjE3Mzg3NDE4OTgsImV4cCI6MTczODc4NTA5OH0.TMPoqgG9ir9K8IWHkt3zRRrMW3oZrtAK_t1g1krrngM',
  );
}

export const $base = ky.create(BASE_API_CONFIG);
export const $api = ky.create({
  ...BASE_API_CONFIG,
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
          // Important to re-throw the error after your custom handling for other parts of the application to know!
          throw new Error(
            `Network response was not ok. Status: ${response.status}`,
          );
        }
        return response;
      },
    ],
  },
});

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
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } finally {
      isRefreshing = false; // Reset the flag regardless of success or failure
    }
  } else {
    console.error('No refresh token found.');
    isRefreshing = false; // Reset the flag in this case as well
    // Redirect to login as there's no refresh token
  }
}
