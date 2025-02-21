import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "react-auth-kit";
import "./App.css";
import "./resources/manrope.css";
import Routing from "./routes/Routing";
import ReactGA4 from "react-ga4";
import "./Widget.css";
import { ToastContainer } from "react-toastify";

ReactGA4.initialize("G-X8S1ZMRM3C");

const App = () => {
  return (
    <AuthProvider authType={"localstorage"} authName={"sparkaichatbot"}>
      <BrowserRouter>
        <Routing />
        <ToastContainer />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
