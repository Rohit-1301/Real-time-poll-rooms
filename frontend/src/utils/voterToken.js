import { v4 as uuidv4 } from 'uuid';

const VOTER_TOKEN_KEY = 'poll_voter_token';

/**
 * Get or create voter token
 * Token is stored in localStorage to track votes across sessions
 */
export function getVoterToken() {
  let token = localStorage.getItem(VOTER_TOKEN_KEY);
  
  if (!token) {
    token = uuidv4();
    localStorage.setItem(VOTER_TOKEN_KEY, token);
  }
  
  return token;
}

/**
 * Clear voter token (for testing purposes)
 */
export function clearVoterToken() {
  localStorage.removeItem(VOTER_TOKEN_KEY);
}
