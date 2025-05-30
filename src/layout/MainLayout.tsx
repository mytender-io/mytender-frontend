import React, { useEffect } from "react";
import SideBar from "./SideBar";
import { useAuthUser } from "react-auth-kit";
import AutoLogout from "@/components/auth/AutoLogout";
import posthog from "posthog-js";
import { cn } from "@/utils";
import { LoadingProvider } from "@/context/LoadingContext";
import { USERS_TO_EXCLUDE_IN_POSTHOG } from "@/constants/posthogUsers";
import { GeneratingTenderInsightProvider } from "@/context/GeneratingTenderInsightContext";
import { UserDataProvider } from "@/context/UserDataContext";

interface MainLayoutProps {
  children: React.ReactNode;
}

// Initialize PostHog at the app level
posthog.init("phc_bdUxtNoJmZWNnu1Ar29zUtusFQ4bvU91fZpLw5v4Y3e", {
  api_host: "https://eu.i.posthog.com",
  person_profiles: "identified_only"
});

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(
    JSON.parse(localStorage.getItem("sidebarCollapsed") || "false")
  );

  const getAuth = useAuthUser();
  const auth = getAuth();
  const isAuthenticated = auth?.token !== undefined;

  useEffect(() => {
    if (auth?.token) {
      console.log("User authenticated");

      if (!USERS_TO_EXCLUDE_IN_POSTHOG.includes(auth.email)) {
        posthog.identify(auth.email, {
          email: auth.email
        });
      } else {
        posthog.opt_out_capturing();
      }
    }
  }, [auth?.token]);

  return (
    <>
      {isAuthenticated && <AutoLogout />}
      <UserDataProvider>
        <div
          className={cn(
            "flex h-screen bg-typo-100 pr-2 py-2 pl-24"
          )}
        >
          <SideBar onCollapseChange={setSidebarCollapsed} />
          <main className="flex-1 transition-all duration-300 ease-in-out bg-white border border-typo-200 rounded-2xl overflow-x-auto">
            <LoadingProvider>
              <GeneratingTenderInsightProvider>
                {children}
              </GeneratingTenderInsightProvider>
            </LoadingProvider>
          </main>
        </div>
      </UserDataProvider>
    </>
  );
};

export default MainLayout;
