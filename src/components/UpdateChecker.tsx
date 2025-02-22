import { useEffect, useState } from "react";
import { useAuthUser } from "react-auth-kit";
import posthog from "posthog-js";
import { toast } from "react-toastify";

// Check interval for updates (5 minutes)
const CHECK_INTERVAL = 5 * 60 * 1000;

export const UpdateChecker = () => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const [lastChecked, setLastChecked] = useState<number>(Date.now());

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        // Don't check if we checked in the last minute (prevents double checks)
        if (Date.now() - lastChecked < 60000) {
          return;
        }
        
        setLastChecked(Date.now());
        
        const currentScript = Array.from(document.getElementsByTagName('script'))
          .find(script => script.src.includes('assets/index.'));
        
        if (!currentScript) {
          console.warn('Version check: Could not find main script tag');
          return;
        }

        const currentHash = currentScript.src.match(/index\.(.+?)\.js/)?.[1];
        
        const response = await fetch(`/index.html?t=${Date.now()}`, {
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
          console.log('Version check: Update available', { currentHash, newHash });
          
          // Show a toast notification instead of a confirm dialog
          toast.info(
            <div>
              A new version is available!
              <button 
                onClick={() => window.location.reload()}
                style={{ 
                  marginLeft: '10px',
                  padding: '4px 8px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Update Now
              </button>
            </div>,
            {
              autoClose: false,
              closeOnClick: false,
              position: "bottom-right",
              closeButton: true
            }
          );
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
  }, [auth?.token, lastChecked]);

  return null;
}; 