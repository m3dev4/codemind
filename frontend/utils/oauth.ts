/**
 * OAuth authentication helpers
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

/**
 * Initiate Google OAuth authentication
 */
export const loginWithGoogle = () => {
  window.location.href = `${BACKEND_URL}/oauth/googleClient/google`;
};

/**
 * Initiate GitHub OAuth authentication
 */
export const loginWithGithub = () => {
  window.location.href = `${BACKEND_URL}/oauth/githubClient/github`;
};
