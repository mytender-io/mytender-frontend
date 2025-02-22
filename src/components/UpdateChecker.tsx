import { useEffect } from "react";
import { useAuthUser } from "react-auth-kit";
import posthog from "posthog-js";

// Check interval for updates (5 minutes)
const CHECK_INTERVAL = 5 * 60 * 1000;

export const UpdateChecker = () => {
  const getAuth = useAuthUser();
  const auth = getAuth();

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const timestamp = Date.now();
        const currentScript = Array.from(document.getElementsByTagName('script'))
          .find(script => script.src.includes('assets/index.'));
        
        if (!currentScript) {
          console.warn('Version check: Could not find main script tag');
          return;
        }

        const currentHash = currentScript.src.match(/index\.(.+?)\.js/)?.[1];
        
        const response = await fetch(`/index.html?t=${timestamp}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch index.html: ${response.status}`);
        }

        const html = await response.text();
        const newHash = html.match(/assets\/index\.(.+?)\.js/)?.[1];

        if (currentHash && newHash && currentHash !== newHash) {
          console.log('Version check: Update available');
          if (window.confirm('A new version of the application is available. Would you like to reload to get the latest updates?')) {
            window.location.reload();
          }
        }
      } catch (error) {
        console.error('Version check failed:', error);
      }
    };

    // Check for updates immediately and set up interval
    checkForUpdates();
    const intervalId = setInterval(checkForUpdates, CHECK_INTERVAL);

    // Identify user in PostHog if authenticated
    if (auth?.token) {
      console.log("User authenticated");
      posthog.identify(auth.email, {
        email: auth.email
      });
    }

    return () => clearInterval(intervalId);
  }, [auth?.token]);

  return null;
}; 