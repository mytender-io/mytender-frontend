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
import { useOktaAuth } from '@okta/okta-react';
import posthog from "posthog-js";
import { useSignIn } from "react-auth-kit";
import { useNavigate } from "react-router-dom";


const Signin = () => {
  const navigate = useNavigate();
  const signIn = useSignIn();


  const { submitSignIn, isLoading } = useAuthSignIn();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState<string>("");
  const [isMounted, setIsMounted] = useState<boolean>(true);



  const { authState, oktaAuth } = useOktaAuth();

  const sendOktaDataToBackend = async (userData: any, tokens: any) => {
    try {
      console.log('Sending Okta data to backend:', {
        user: {
          name: userData.name,
          email: userData.email,
          sub: userData.sub,
          locale: userData.locale,
          preferred_username: userData.preferred_username
        },
        tokens: {
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          id_token: tokens.idToken
        }
      });

      const new_data = {
        user: {
          name: userData.name,
          email: userData.email,
          sub: userData.sub,
          locale: userData.locale,
          preferred_username: userData.preferred_username
        },
        tokens: {
          access_token: tokens.accessToken.accessToken,
          access_token_exp: tokens.accessToken.expiresAt,
          refresh_token: tokens.refreshToken.refreshToken,
          refresh_token_exp: tokens.refreshToken.expiresAt,
          id_token: tokens.idToken.idToken
        }
      }

      console.log('new data', new_data)
      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/okta_login`,
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

  useEffect(() => {
    (async () => {
      if (window.location.search.includes('code=')) {
        const { tokens } = await oktaAuth.token.parseFromUrl();
        await oktaAuth.tokenManager.setTokens(tokens);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      await oktaAuth.authStateManager.updateAuthState();
    })();
  }, [oktaAuth]);

  useEffect(async () => {
    if (authState?.isAuthenticated) {
      // const accessToken = await oktaAuth.getAccessToken();
      // const refreshToken = (await oktaAuth.tokenManager.get('refreshToken'))?.value;
      // setTokens({ accessToken, refreshToken });

      const tokens = await oktaAuth.tokenManager.getTokens();
      console.log('All available tokens:', tokens);

      const accessToken = tokens.accessToken;

      const userInfo = await oktaAuth.getUser();

      const refreshToken = tokens.refreshToken;
      const idToken = tokens.idToken

      if (!userInfo?.email) {
        throw new Error("No email found in user info");
      }

      const backendResponse = await sendOktaDataToBackend(userInfo, {
        accessToken,
        refreshToken,
        idToken
      });

      const authSuccess = signIn({
        token: accessToken,
        expiresIn: 3600,
        tokenType: "Bearer",
        authState: {
          email: userInfo.email,
          token: accessToken,
          refreshToken: refreshToken,
          ...userInfo
        }
      });
      console.log('here is authsuccess', authSuccess)

      if (authSuccess) {
        // Clear local storage
        ['bidInfo', 'backgroundInfo', 'response', 'inputText',
          'editorState', 'messages', 'chatResponseMessages',
          'tenderLibChatMessages', 'previewSidepaneMessages',
          'bidState', 'lastActiveTab'].forEach(key => {
            localStorage.removeItem(key);
          });

        navigate("/");

        posthog.identify(userInfo.email);
        posthog.capture("user_active", {
          distinct_id: userInfo.email,
          timestamp: new Date().toISOString()
        });

      }
    }

  }, [authState]);

  const sendTokensToAPI = async () => {
    const res = await fetch('http://localhost:8000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokens)
    });
    console.log(await res.json());
  };

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
        {/* <button onClick={()=>oktaAuth.signOut()}>logout</button> */}
        {/* <div style={{ padding: 20 }}>
          {!authState?.isAuthenticated ? (
            <button onClick={() => oktaAuth.signInWithRedirect()}>Login with Okta</button>
          ) : (
            <>
              <h2>Authenticated</h2>
              <button onClick={sendTokensToAPI}>Send Tokens</button>
            </>
          )}
        </div> */}

        <button onClick={() => oktaAuth.signInWithRedirect()}>Login with Okta</button>
      </div>
      <AuthState />
    </AuthLayout>
  );
};

export default Signin;
