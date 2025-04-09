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
import { VITE_APP_OKTA_DOMAIN, VITE_APP_OKTA_CLIENT_ID } from "../../helper/Constants";

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
        <UpdateChecker />
        <Routing />
      </StatusLabelsProvider>
    </BrowserRouter>
  );
};

import { Security } from '@okta/okta-react';
import { OktaAuth } from '@okta/okta-auth-js';
console.log("the main uri",window.location.origin)

const oktaAuth = new OktaAuth({
  issuer: 'https://dev-77225952.okta.com/oauth2/default',
  clientId: '0oao48fi1kmE4qy2O5d7',
  redirectUri: window.location.origin + '/login',
  postLogoutRedirectUri: window.location.origin + '/login',
  scopes: ['openid', 'profile', 'email', 'offline_access'],
  pkce: true,
  tokenManager: {
    storage: 'sessionStorage',
    autoRenew: true
  },
  devMode: true  // Allow HTTP in development
});
const App = () => {
  const restoreOriginalUri = async (_oktaAuth: any, originalUri: string) => {
    window.location.replace(originalUri);
  };
  return (
         
    <AuthProvider authType={"localstorage"} authName={"sparkaichatbot"}>
      <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
      <AppContent />
      </Security>
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
