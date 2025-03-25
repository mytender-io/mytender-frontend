import React from "react";
import MeshGradient from "@/components/mesh-gradient/MeshGradient";
import Logo from "@/resources/images/logo.png";

interface AuthLayoutProps {
  children: React.ReactNode;
  showDisclaimer?: boolean;
}

const AuthLayout = ({ children, showDisclaimer = true }: AuthLayoutProps) => {
  return (
    <div className="w-screen h-screen flex justify-center items-center m-0 overflow-y-auto">
      <MeshGradient>
        <div className="flex items-center gap-2 max-w-[1080px] px-5 py-4 w-full">
          <img src={Logo} className="h-14" alt="logo" />
        </div>
        <div className="space-y-6 max-w-lg w-full">
          <div className="p-12 rounded-lg bg-white shadow-card">{children}</div>
          {showDisclaimer && (
            <div className="px-2">
              <span className="block text-sm font-medium text-muted-foreground">
                Disclaimer: Answers generated with AI should always be checked
                for accuracy, we view our platform as a tool to create amazing
                proposals, but with the guidance of a human!
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 max-w-[1080px] px-5 py-4 text-left justify-start w-full">
          <a
            href="https://mytender.io/data_protection_overview"
            className="text-sm font-semibold text-black"
            target="_blank"
          >
            Privacy & Policy
          </a>
          <a
            href="https://mytender.io/terms_and_conditions"
            className="text-sm font-semibold text-black"
            target="_blank"
          >
            Terms & Conditions
          </a>
        </div>
      </MeshGradient>
    </div>
  );
};

export default AuthLayout;
