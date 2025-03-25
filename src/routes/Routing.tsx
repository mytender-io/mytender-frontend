import { useEffect } from "react";
import { Route, Routes, Outlet, useLocation } from "react-router-dom";
import SignInComponent from "../components/auth/SignIn";
import SignOut from "../components/auth/SignOutButton";
import Log from "../components/Log";
import FLog from "../components/FLog";
import UploadTemplateText from "../components/UploadTemplateText.tsx";
import Pannels from "../views/Pannels";
import Bids from "@/views/Bids/Bids";
import Library from "@/views/Library/Library";
import ChatbotResponse from "../views/Chat/ChatbotResponse";
import BidManagement from "../views/BidWritingStateManagerView.tsx";
import ProfilePage from "../views/Profile/Profile";
import Signup from "../components/auth/Signup";
import ForgotPassword from "../components/auth/ForgotPassword";
import QAGenerator from "../views/QAGenerator/Q&AGenerator";
import MainLayout from "@/layout/MainLayout";
import posthog from "posthog-js";
import Bid from "@/views/Bid/Bid";
import Home from "@/views/Home/Home.tsx";

function Routing() {
  const location = useLocation();

  // Track page views
  useEffect(() => {
    posthog.capture("$pageview", {
      path: location.pathname,
      search: location.search,
      email: posthog.get_distinct_id()
    });
  }, [location]);

  return (
    <div>
      <Routes>
        <Route path="/login" element={<SignInComponent />} />
        <Route path="/logout" element={<SignOut />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset_password" element={<ForgotPassword />} />
        <Route
          element={
            <MainLayout>
              <Outlet />
            </MainLayout>
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Bids />} />
          <Route path="/chat" element={<ChatbotResponse />} />
          <Route path="/admin-pannel" element={<Pannels />} />
          <Route path="/upload-templatetext" element={<UploadTemplateText />} />
          <Route path="/qlog" element={<Log />} />
          <Route path="/flog" element={<FLog />} />
          <Route path="/library" element={<Library />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/question-answer" element={<QAGenerator />} />

          <Route element={<BidManagement />}>
            {/* context manager which give the component access to the shared state (the bid they are working on) */}
            <Route path="/bid" element={<Bid />} />
            <Route path="/bids" element={<Bids />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default Routing;
