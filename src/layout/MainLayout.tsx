import React, { useEffect } from "react";
import SideBar from "./SideBar";
import { useAuthUser } from "react-auth-kit";
import AutoLogout from "@/components/auth/AutoLogout";
import posthog from "posthog-js";
import { cn } from "@/utils";
import { LoadingProvider } from "@/context/LoadingContext";

interface MainLayoutProps {
  children: React.ReactNode;
}

// Initialize PostHog at the app level
posthog.init("phc_bdUxtNoJmZWNnu1Ar29zUtusFQ4bvU91fZpLw5v4Y3e", {
  api_host: "https://eu.i.posthog.com",
  person_profiles: "identified_only"
});

const CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(
    JSON.parse(localStorage.getItem("sidebarCollapsed") || "false")
  );

  const getAuth = useAuthUser();
  const auth = getAuth();
  const isAuthenticated = auth?.token !== undefined;

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const timestamp = Date.now();
        // Find current script tag with version hash
        const currentScript = Array.from(
          document.getElementsByTagName("script")
        ).find((script) => script.src.includes("assets/index."));

        if (!currentScript) {
          console.warn("Version check: Could not find main script tag");
          return;
        }

        // Extract hash from current script filename
        const currentHash = currentScript.src.match(/index\.(.+?)\.js/)?.[1];

        // Fetch the index.html with cache-busting
        const response = await fetch(`/index.html?t=${timestamp}`, {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache"
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch index.html: ${response.status}`);
        }

        const html = await response.text();
        // Find the new script hash in the fetched HTML
        const newHash = html.match(/assets\/index\.(.+?)\.js/)?.[1];

        if (currentHash && newHash && currentHash !== newHash) {
          console.log("Version check: Update available");
          if (
            window.confirm(
              "A new version of the application is available. Would you like to reload to get the latest updates?"
            )
          ) {
            window.location.reload();
          }
        }
      } catch (error) {
        console.error("Version check failed:", error);
      }
    };

    // Check for updates immediately and set interval
    checkForUpdates();
    const intervalId = setInterval(checkForUpdates, CHECK_INTERVAL);

    if (auth?.token) {
      console.log("User authenticated");
      posthog.identify(auth.email, {
        email: auth.email
      });
    }

    return () => clearInterval(intervalId);
  }, [auth?.token]);

  return (
    <>
      {isAuthenticated && <AutoLogout />}
      <div
        className={cn(
          "flex h-screen bg-typo-100 pr-2 py-2",
          sidebarCollapsed ? "pl-20" : "pl-56"
        )}
      >
        <SideBar onCollapseChange={setSidebarCollapsed} />
        <main className="flex-1 transition-all duration-300 ease-in-out bg-white border border-typo-200 rounded-2xl overflow-x-auto">
          <LoadingProvider>{children}</LoadingProvider>
        </main>
      </div>
    </>
  );
};

export default MainLayout;
