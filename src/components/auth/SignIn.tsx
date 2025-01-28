import React, { useState, useEffect } from "react";
import "./Signin.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger
// } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import useAuthSignIn from "./UseAuthsignIn";
import AuthState from "./AuthState";
import axios from "axios";
// import InfoIcon from "@mui/icons-material/Info";
import { API_URL, HTTP_PREFIX } from "../../helper/Constants";

const Signin = () => {
  const { toast } = useToast();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const { submitSignIn, isLoading } = useAuthSignIn();
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState<string>("");
  const [isMounted, setIsMounted] = useState(true);

  // Set up cleanup when component unmounts
  useEffect(() => {
    return () => {
      setIsMounted(false);
    };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast({
        variant: "destructive",
        description: "Username and Password are required"
      });
      return;
    }

    try {
      const { success, message } = await submitSignIn(formData);
      if (isMounted) {
        toast({
          variant: success ? "default" : "destructive",
          description: success ? message : "Incorrect Username or Password"
        });
      }
    } catch (error) {
      if (isMounted) {
        toast({
          variant: "destructive",
          description: "Incorrect Username or Password"
        });
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSubmit(e);
    }
  };

  const handleForgotPassword = async () => {
    const controller = new AbortController();

    try {
      await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/forgot_password`,
        { email: forgotPasswordEmail },
        { signal: controller.signal }
      );

      if (isMounted) {
        toast({
          variant: "default",
          description: "Password reset email sent successfully"
        });
      }
    } catch (err) {
      if (axios.isCancel(err)) {
        return; // Request was cancelled, do nothing
      }

      if (isMounted) {
        toast({
          variant: "destructive",
          description: "Failed to send password reset email. Please try again."
        });
      }
    }

    return () => {
      controller.abort(); // Cleanup: cancel any in-flight request
    };
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center m-0">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-12 rounded-lg bg-white shadow-card max-w-lg min-w-[512px] w-full">
        <div className="relative">
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-4xl font-bold text-center w-full">
              Sign in to your account
            </h2>
            {/* <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon fontSize="medium" color="action" />
                </TooltipTrigger>
                <TooltipContent className="max-w-md bg-white shadow-card">
                  <p>
                    Disclaimer: Answers generated with AI should always be
                    checked for accuracy, we view our platform as a tool to
                    create amazing proposals, but with the guidance of a human!
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider> */}
          </div>
          <form onSubmit={onSubmit}>
            <div className="space-y-6">
              <div className="grid w-full items-center gap-3">
                <Label htmlFor="email" className="text-xl">
                  Email
                </Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="Email"
                  className="w-full md:text-xl h-12"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  onKeyDown={handleKeyPress}
                />
              </div>
              <div className="grid w-full items-center gap-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email" className="text-xl">
                    Password
                  </Label>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className="text-xl text-orange bg-transparent hover:text-orange_light"
                      >
                        Forgot Password?
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-white">
                      <DialogHeader>
                        <DialogTitle className="text-4xl font-bold mb-3">
                          Forgot Password
                        </DialogTitle>
                        <DialogDescription className="text-xl font-medium">
                          Make changes to your profile here. Click save when
                          you're done.Enter your email address and we'll send
                          you a link to reset your password.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid w-full items-center gap-3">
                          <Label htmlFor="email" className="text-xl">
                            Email
                          </Label>
                          <Input
                            id="email"
                            placeholder="Email"
                            className="w-full md:text-xl h-12"
                            type="password"
                            value={forgotPasswordEmail}
                            onChange={(e) =>
                              setForgotPasswordEmail(e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button
                            type="button"
                            variant="secondary"
                            className="text-lg py-4 text-white"
                          >
                            Close
                          </Button>
                        </DialogClose>
                        <Button
                          onClick={handleForgotPassword}
                          className="text-lg py-4 text-white"
                        >
                          Send Email
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <Input
                  type="password"
                  id="password"
                  placeholder="Password"
                  className="w-full md:text-xl h-12"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value
                    })
                  }
                  onKeyDown={handleKeyPress}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-orange h-14 text-xl text-white hover:bg-orange_light"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Login"}
              </Button>
            </div>
          </form>
        </div>
        <AuthState />
      </div>
    </div>
  );
};

export default Signin;
