import { runLoginTest } from './utils/authTests';

// This is a temporary test entry point. 
// In a real browser environment, you would call this from the console or a test page.
// Usage: runLoginTest('test@example.com', 'password123');

if (import.meta.env.DEV) {
  (window as any).runAuthTest = runLoginTest;
  console.log("🛠️ Auth test utility loaded. Call window.runAuthTest(email, password) in console.");
}
