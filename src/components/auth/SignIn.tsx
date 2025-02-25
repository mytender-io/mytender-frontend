import React, { useState, useEffect } from "react";
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
import { toast } from "react-toastify";
import useAuthSignIn from "./UseAuthsignIn";
import AuthState from "./AuthState";
import axios from "axios";
import { API_URL, HTTP_PREFIX } from "../../helper/Constants";
import AuthLayout from "@/layout/AuthLayout";

const Signin = () => {
  const { submitSignIn, isLoading } = useAuthSignIn();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState<string>("");
  const [isMounted, setIsMounted] = useState<boolean>(true);

  // Set up cleanup when component unmounts
  useEffect(() => {
    return () => {
      setIsMounted(false);
    };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Username and Password are required");
      return;
    }

    try {
      const { success, message } = await submitSignIn(formData);
      if (isMounted) {
        // if (success) toast.success(message);
        // else toast.error("Incorrect Username or Password");
        if (!success) toast.error("Incorrect Username or Password");
      }
    } catch (error) {
      if (isMounted) {
        toast.error("Incorrect Username or Password");
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
        toast.success("Password reset email sent successfully");
      }
    } catch (err) {
      if (axios.isCancel(err)) {
        return; // Request was cancelled, do nothing
      }

      if (isMounted) {
        toast.error("Failed to send password reset email. Please try again.");
      }
    }

    return () => {
      controller.abort(); // Cleanup: cancel any in-flight request
    };
  };

  return (
    <AuthLayout>
      <div className="relative">
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-2xl font-bold text-center w-full">
            Sign in to your account
          </h2>
        </div>
        <form onSubmit={onSubmit}>
          <div className="space-y-4">
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="email">Username</Label>
              <Input
                type="text"
                id="email"
                placeholder="Username"
                className="w-full"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                onKeyDown={handleKeyPress}
              />
            </div>
            <div className="grid w-full items-center gap-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="email">Password</Label>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-orange bg-transparent hover:text-orange-light"
                    >
                      Forgot Password?
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold mb-3">
                        Forgot Password
                      </DialogTitle>
                      <DialogDescription className="font-medium">
                        Enter your email address and we'll send you a link to
                        reset your password.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid w-full items-center gap-3">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          placeholder="Email"
                          className="w-full"
                          type="email"
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
                          className="text-sm py-4"
                        >
                          Close
                        </Button>
                      </DialogClose>
                      <Button
                        onClick={handleForgotPassword}
                        className="text-sm py-4 text-white bg-orange hover:bg-orange-light"
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
                className="w-full"
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
              className="w-full h-12 text-lg text-white"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Sign in"}
            </Button>
          </div>
        </form>
      </div>
      <AuthState />
    </AuthLayout>
  );
};

export default Signin;
