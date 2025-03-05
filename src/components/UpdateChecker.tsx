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

  // Add this effect to test toast functionality
  useEffect(() => {
    toast.info("Update checker initialised");
  }, []);

  useEffect(() => {
    const checkForUpdates = async () => {
      console.log("UpdateChecker: Starting version check...");
      try {
        // Don't check if we checked in the last minute (prevents double checks)
        if (Date.now() - lastChecked < 60000) {
          console.log(
            "UpdateChecker: Skipping check - too soon since last check"
          );
          return;
        }

        setLastChecked(Date.now());

        // Find all script tags and log them
        const allScripts = Array.from(document.getElementsByTagName("script"));
        console.log(
          "UpdateChecker: Found script tags:",
          allScripts.map((s) => s.src)
        );

        const currentScript = allScripts.find((script) =>
          script.src.includes("assets/index.")
        );

        if (!currentScript) {
          console.warn("UpdateChecker: Could not find main script tag");
          return;
        }

        console.log("UpdateChecker: Found current script:", currentScript.src);

        const currentHash = currentScript.src.match(/index\.(.+?)\.js/)?.[1];
        console.log("UpdateChecker: Current hash:", currentHash);

        console.log("UpdateChecker: Fetching index.html...");
        const response = await fetch(`/index.html?t=${Date.now()}`, {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache"
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch index.html: ${response.status}`);
        }

        const html = await response.text();
        console.log(
          "UpdateChecker: Received HTML content length:",
          html.length
        );

        // Log a snippet of the HTML around where we expect the script tag
        const scriptIndex = html.indexOf("assets/index");
        if (scriptIndex !== -1) {
          console.log(
            "UpdateChecker: HTML snippet around script tag:",
            html.substring(
              Math.max(0, scriptIndex - 50),
              Math.min(html.length, scriptIndex + 100)
            )
          );
        }

        const newHash = html.match(/assets\/index\.(.+?)\.js/)?.[1];
        console.log("UpdateChecker: New hash:", newHash);

        if (!newHash) {
          console.warn("UpdateChecker: Could not find new hash in index.html");
        }

        if (currentHash && newHash && currentHash !== newHash) {
          console.log("UpdateChecker: Update available", {
            currentHash,
            newHash,
            currentScriptSrc: currentScript.src,
            timestamp: new Date().toISOString()
          });

          // Try both toast.info and toast directly
          const toastId = toast.info(
            <div style={{ display: "flex", alignItems: "center" }}>
              <span>A new version is available!</span>
              <button
                onClick={() => {
                  console.log(
                    "UpdateChecker: Update button clicked, reloading..."
                  );
                  toast.dismiss(toastId);
                  window.location.reload();
                }}
                style={{
                  marginLeft: "10px",
                  padding: "4px 8px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Update Now
              </button>
            </div>,
            {
              toastId: "update-notification" // Prevent duplicate toasts
            }
          );

          // Backup notification in case toast.info fails
          if (!toastId) {
            toast("A new version is available! Please refresh the page.", {
              toastId: "update-notification-backup"
            });
          }
        } else {
          console.log("UpdateChecker: No update needed", {
            currentHash,
            newHash,
            hashesMatch: currentHash === newHash
          });
        }
      } catch (error) {
        console.error("UpdateChecker: Version check failed:", error);
        // Show error toast
        toast.error("Failed to check for updates");
      }
    };

    console.log("UpdateChecker: Setting up check interval");
    // Check for updates immediately and set up interval
    checkForUpdates();
    const intervalId = setInterval(checkForUpdates, CHECK_INTERVAL);

    // Identify user in PostHog if authenticated
    if (auth?.token) {
      console.log("UpdateChecker: User authenticated, identifying in PostHog");
      posthog.identify(auth.email, {
        email: auth.email
      });
    }

    return () => {
      console.log("UpdateChecker: Cleaning up interval");
      clearInterval(intervalId);
    };
  }, [auth?.token, lastChecked]);

  return null;
};
