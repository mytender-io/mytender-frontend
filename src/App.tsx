import React, { useEffect } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { AuthProvider, useAuthUser } from "react-auth-kit";
import "./App.css";
import "./resources/manrope.css";
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

// Change to 1 minute for more frequent checks
const CHECK_INTERVAL = 60 * 1000; // 1 minute in milliseconds

const Layout = () => {
  const getAuth = useAuthUser();
  const auth = getAuth();

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        console.log('Checking for updates...');
        const timestamp = Date.now();
        // First try to get the current running app's build hash
        const currentScript = Array.from(document.getElementsByTagName('script'))
          .find(script => script.src.includes('assets/index.'));
        
        if (!currentScript) {
          console.warn('Could not find main script tag with assets/index');
          console.log('Available scripts:', Array.from(document.getElementsByTagName('script')).map(s => s.src));
          return;
        }

        console.log('Current script src:', currentScript.src);

        // Extract hash from current script filename
        const currentHash = currentScript.src.match(/index\.(.+?)\.js/)?.[1];
        console.log('Current hash:', currentHash);
        
        // Fetch the index.html with cache-busting query parameter
        console.log('Fetching fresh index.html...');
        const response = await fetch(`/index.html?t=${timestamp}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch index.html: ${response.status} ${response.statusText}`);
        }

        const html = await response.text();
        // Find the new script hash in the fetched HTML
        const newHash = html.match(/assets\/index\.(.+?)\.js/)?.[1];
        console.log('New hash:', newHash);

        if (currentHash && newHash && currentHash !== newHash) {
          console.log('Update available! Current hash:', currentHash, 'New hash:', newHash);
          if (window.confirm('A new version of the application is available. Would you like to reload to get the latest updates?')) {
            console.log('User confirmed reload, refreshing page...');
            window.location.reload();
          } else {
            console.log('User declined reload');
          }
        } else {
          console.log('No update needed. Current hash matches new hash.');
        }
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    };

    // Check for updates immediately when component mounts
    console.log('Initial update check...');
    checkForUpdates();

    // Set up periodic checks every minute
    const intervalId = setInterval(() => {
      console.log('Periodic update check...');
      checkForUpdates();
    }, CHECK_INTERVAL);

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
