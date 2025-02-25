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
      <UpdateChecker />
      <Routing />
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
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <AuthProvider authType={"localstorage"} authName={"sparkaichatbot"}>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
