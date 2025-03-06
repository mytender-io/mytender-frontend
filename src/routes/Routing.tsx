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
import Proposal from "../views/Proposal";
import Dashboard from "../views/Dashboard";
import ChatbotResponse from "../views/Chat/ChatbotResponse";
// import BidExtractor from "../views/BidExtractor.tsx";
import QuestionCrafter from "../views/QuestionCrafter";
import Calculator from "../views/Calculator.tsx";
import BidManagement from "../views/BidWritingStateManagerView.tsx";
import HowTo from "../views/HowTo.tsx";
import ProfilePage from "../views/Profile/Profile";
import Signup from "../components/auth/Signup";
import ForgotPassword from "../components/auth/ForgotPassword";
import QAGenerator from "../views/QAGenerator/Q&AGenerator";
import ComplianceMatrix from "../views/ComplianceMatrix.tsx";
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Bids />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/chat" element={<ChatbotResponse />} />
          <Route path="/admin-pannel" element={<Pannels />} />
          <Route path="/upload-templatetext" element={<UploadTemplateText />} />
          <Route path="/qlog" element={<Log />} />
          <Route path="/flog" element={<FLog />} />
          <Route path="/library" element={<Library />} />
          <Route path="/howto" element={<HowTo />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/question-answer" element={<QAGenerator />} />
          <Route element={<BidManagement />}>
            <Route path="/bid" element={<Bid />} />
            <Route path="/question-crafter" element={<QuestionCrafter />} />
            <Route path="/compliance-matrix" element={<ComplianceMatrix />} />
            <Route path="/proposal" element={<Proposal />} />
            <Route path="/bids" element={<Bids />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default Routing;
