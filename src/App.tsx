import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "react-auth-kit";
import "./App.css";
import "./resources/manrope.css";
import Routing from "./routes/Routing";
import ReactGA4 from "react-ga4";
import "./Widget.css";
import { ToastContainer } from "react-toastify";
import posthog from "posthog-js";
import { UpdateChecker } from "./components/UpdateChecker";
import "react-toastify/dist/ReactToastify.css";
import { StatusLabelsProvider } from "./views/Bids/components/BidStatusMenu";
import { Auth0Provider } from "@auth0/auth0-react";
import TabNotificationContainer from "./layout/TabNotificationContainer";
import { NotificationProvider } from "./context/NotificationContext";

const auth0Config = {
  domain: import.meta.env.VITE_REACT_APP_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_REACT_APP_AUTH0_CLIENT_ID,
  redirectUri: import.meta.env.VITE_REACT_APP_AUTH0_REDIRECT_URI
};
ReactGA4.initialize("G-X8S1ZMRM3C");

// Initialize PostHog
posthog.init("phc_bdUxtNoJmZWNnu1Ar29zUtusFQ4bvU91fZpLw5v4Y3e", {
  api_host: "https://eu.i.posthog.com",
  person_profiles: "identified_only"
});

// Create a separate component for the authenticated content
const AppContent = () => {
  return (
    <BrowserRouter>
      <StatusLabelsProvider>
        <NotificationProvider>
          <TabNotificationContainer />
          <UpdateChecker />
          <Routing />
        </NotificationProvider>
      </StatusLabelsProvider>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <AuthProvider authType={"localstorage"} authName={"sparkaichatbot"}>
      {/* <Auth0ProviderWithConfig> */}
      <Auth0Provider
        domain={auth0Config.domain}
        clientId={auth0Config.clientId}
        responseType="code" // Enforce Authorization Code flow
        useRefreshTokens={true} // Optional, for SPA security
        scope="openid profile email offline_access" // Ensure offline_access is included
        redirectUri={auth0Config.redirectUri}
      >
        <AppContent />
      </Auth0Provider>
      {/* </Auth0ProviderWithConfig> */}
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        hideProgressBar={true}
      />
    </AuthProvider>
  );
};

export default App;
