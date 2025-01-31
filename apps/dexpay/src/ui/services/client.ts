import ky from 'ky';

// Function to read the Bearer token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const saveAuthToken = (token: string) => {
  localStorage.setItem('token', token);
};

export const $api = ky.create({
  prefixUrl: 'https://api-int.dextrade.com/v1', // Consider using environment variables for this
  headers: {
    'Content-Type': 'application/json',
  },
  hooks: {
    beforeRequest: [
      (request) => {
        const token = getAuthToken();
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`); // Set Authorization only if token is present.
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

            // Option 1: Redirect to login
            // window.location.href = '/login';  // Or wherever your login route is.

            // Option 2: Implement token refresh logic here (more complex).  See example below.
            // Option 3: Clear invalid token from storage:
            // document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
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

// Example Token Refresh logic (Option 2 from above)
async function refreshToken() {
  const refreshToken = getRefreshTokenFromStorage(); // Implement your refresh token retrieval.

  if (refreshToken) {
    try {
      const refreshResponse = await ky.post('/auth/refresh', {
        json: { token: refreshToken },
      }); // Adapt to your refresh endpoint.
      const newAccessToken = (await refreshResponse.json()).access_token;

      saveTokenToCookies(newAccessToken); // Save the new access token
      return newAccessToken;
    } catch (refreshError) {
      console.error('Refresh token failed:', refreshError);
      // Handle refresh token failure (e.g., redirect to login)
      return null; // Indicate refresh failure
    }
  } else {
    console.error('No refresh token found.');
    return null; // Indicate no refresh token
  }
}
