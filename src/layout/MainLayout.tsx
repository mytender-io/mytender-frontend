import React, { useEffect } from "react";
import SideBar from "./SideBar";
import { Toaster } from "@/components/ui/toaster";
import { useAuthUser } from "react-auth-kit";
import SupportChat from "@/components/SupportChat";
import AutoLogout from "@/components/auth/AutoLogout";
import posthog from "posthog-js";
import { cn } from "@/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

// Initialize PostHog at the app level
posthog.init("phc_bdUxtNoJmZWNnu1Ar29zUtusFQ4bvU91fZpLw5v4Y3e", {
  api_host: "https://eu.i.posthog.com",
  person_profiles: "identified_only"
});

const CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(
    JSON.parse(localStorage.getItem("sidebarCollapsed") || "false")
  );

  const getAuth = useAuthUser();
  const auth = getAuth();
  const isAuthenticated = auth?.token !== undefined;

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const timestamp = Date.now(); // Add cache-busting parameter
        // Fetch the manifest with cache-busting query parameter
        const response = await fetch(`/manifest.json?t=${timestamp}`, {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache"
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch manifest");
        }

        const manifest = await response.json();
        const currentBuildHash = manifest.hash;
        const storedHash = localStorage.getItem("buildHash");

        if (storedHash && storedHash !== currentBuildHash) {
          if (
            window.confirm(
              "A new version of the application is available. Would you like to reload to get the latest updates?"
            )
          ) {
            localStorage.setItem("buildHash", currentBuildHash);
            window.location.reload();
          }
        } else if (!storedHash) {
          localStorage.setItem("buildHash", currentBuildHash);
        }
      } catch (error) {
        console.error("Failed to check for updates:", error);
      }
    };

    // Check for updates immediately when component mounts
    checkForUpdates();

    // Set up periodic checks
    const intervalId = setInterval(checkForUpdates, CHECK_INTERVAL);

    if (auth?.token) {
      console.log("User authenticated");
      posthog.identify(auth.email, {
        email: auth.email
      });
    }

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [auth?.token]);

  return (
    <>
      {isAuthenticated && <AutoLogout />}
      <div
        className={cn(
          "flex h-screen bg-typo-100 pr-4 py-4",
          sidebarCollapsed ? "pl-20" : "pl-56"
        )}
      >
        <SideBar onCollapseChange={setSidebarCollapsed} />
        <main
          className="flex-1 transition-all duration-300 ease-in-out bg-white border border-typo-200
            overflow-hidden rounded-2xl"
        >
          {children}
          <Toaster />
        </main>
      </div>
      {isAuthenticated && <SupportChat auth={auth} />}
    </>
  );
};

export default MainLayout;
