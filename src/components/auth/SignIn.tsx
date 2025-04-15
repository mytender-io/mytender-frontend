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
import { useAuth0 } from "@auth0/auth0-react";
import { useSignIn } from "react-auth-kit";
import { useNavigate } from "react-router-dom";
import posthog from "posthog-js";

const Signin = () => {
  const signIn = useSignIn();
  const navigate = useNavigate();

  const { submitSignIn, isLoading } = useAuthSignIn();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState<string>("");
  const [isMounted, setIsMounted] = useState<boolean>(true);

  const {
    isLoading:auth0Loading,
    isAuthenticated,
    user,
    loginWithRedirect,
    getAccessTokenSilently,
    getIdTokenClaims
  } = useAuth0();

  const sendAuth0DataToBackend = async (userData: any, tokens: any) => {
    try {
      const new_data = {
        user: {
          name: userData.name,
          email: userData.email,
          sub: userData.sub,
          locale: userData.locale,
          preferred_username: userData.preferred_username,
          picture: userData.picture
        },
        tokens: {
          id_token: tokens.__raw
        }
      }

      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/auth0_login`,
        new_data,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (err) {
      console.error('Error sending Okta data to backend:', err);
      throw new Error(err.response?.data?.detail || "Failed to send Okta data to backend");
    }
  };



  const fetchToken = () => {
    if (!isAuthenticated) {
      console.log('User not authenticated');
      return;
    }
    getIdTokenClaims().then(idTokenClaims => {

      sendAuth0DataToBackend(user, idTokenClaims)
      const currentTime = Math.floor(Date.now() / 1000); 
      const MAX_ALLOWED_EXPIRATION = 30 * 24 * 60 * 60; // 30 days in seconds

      const authSuccess = signIn({
        token: idTokenClaims.__raw,
        tokenType: "Bearer",
        expiresIn: MAX_ALLOWED_EXPIRATION,
        authState: {
          email: user.email,
          name:user.name,
          auth0Id:user.sub,
          token: idTokenClaims.__raw,
          authType: 'Auth0',
          expiresAt: currentTime + MAX_ALLOWED_EXPIRATION,
          timeRemaining: MAX_ALLOWED_EXPIRATION,

        }
      });


      if (authSuccess) {
        // Clear local storage
        ['bidInfo', 'backgroundInfo', 'response', 'inputText',
          'editorState', 'messages', 'chatResponseMessages',
          'tenderLibChatMessages', 'previewSidepaneMessages',
          'bidState', 'lastActiveTab'].forEach(key => {
            localStorage.removeItem(key);
          });

        navigate("/home");

        posthog.identify(user.email);
        posthog.capture("user_active", {
          distinct_id: user.email,
          timestamp: new Date().toISOString()
        });
      }

    }).catch(error => {
      console.error('Error getting token:', error);
    });

  };

  useEffect(() => {
    fetchToken();

  }, [isAuthenticated, getAccessTokenSilently]);


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
        <br />

        <Button
          disabled={auth0Loading}
          className="w-full h-12 text-lg text-white"
          onClick={() =>
            loginWithRedirect({
              responseType: 'code', // Explicitly set
            }).catch(err => console.error('Login error:', err))
          }
        >
         {auth0Loading ? "Loading..." : "Sign in with Okta"} 
        </Button>

      </div>
      <AuthState />
    </AuthLayout>
  );
};

export default Signin;

