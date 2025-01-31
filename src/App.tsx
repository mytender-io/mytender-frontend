import React, { useEffect } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { AuthProvider, useAuthUser } from "react-auth-kit";
import "./App.css";
import "./resources/manrope.css";
import NavBar from "./routes/NavBar";
import Routing from "./routes/Routing";
import ReactGA4 from "react-ga4";
import "./Widget.css";
import SupportChat from "./components/SupportChat.tsx";
import AutoLogout from "./components/auth/AutoLogout.tsx";
import posthog from "posthog-js";
import { Toaster } from "@/components/ui/toaster";

ReactGA4.initialize("G-X8S1ZMRM3C");

// Initialize PostHog at the app level
posthog.init("phc_bdUxtNoJmZWNnu1Ar29zUtusFQ4bvU91fZpLw5v4Y3e", {
  api_host: "https://eu.i.posthog.com",
  person_profiles: "identified_only"
});

// Change from 24 hours to 1 hour
const CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

const Layout = () => {
  const location = useLocation();
  const getAuth = useAuthUser();
  const auth = getAuth();

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const timestamp = Date.now(); // Add cache-busting parameter
        // Fetch the manifest with cache-busting query parameter
        const response = await fetch(`/manifest.json?t=${timestamp}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch manifest');
        }

        const manifest = await response.json();
        const currentBuildHash = manifest.hash;
        const storedHash = localStorage.getItem('buildHash');
        
        if (storedHash && storedHash !== currentBuildHash) {
          if (window.confirm('A new version of the application is available. Would you like to reload to get the latest updates?')) {
            localStorage.setItem('buildHash', currentBuildHash);
            window.location.reload();
          }
        } else if (!storedHash) {
          localStorage.setItem('buildHash', currentBuildHash);
        }
      } catch (error) {
        console.error('Failed to check for updates:', error);
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

  const isAuthenticated = auth?.token !== undefined;
  return (
    <>
      {isAuthenticated && <AutoLogout />}
      <div className="main-content">
        <Routing />
        <Toaster />
      </div>
      {isAuthenticated && <SupportChat auth={auth} />}
      {/* Use the ChatBot component */}
    </>
  );
};

const App = () => {
  return (
    <AuthProvider authType={"localstorage"} authName={"sparkaichatbot"}>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
