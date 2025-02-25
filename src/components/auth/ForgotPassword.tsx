import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { API_URL, HTTP_PREFIX } from "../../helper/Constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import AuthLayout from "@/layout/AuthLayout";

const ForgotPassword = () => {
  const [tokenValid, setTokenValid] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");
  console.log(token);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await axios.post(
          `http${HTTP_PREFIX}://${API_URL}/validate_reset_token`,
          { token }
        );
        if (response.data.valid) {
          setTokenValid(true);
          setFormData((prevFormData) => ({
            ...prevFormData,
            username: response.data.email || "" // Prefill username/email if available
          }));
        } else {
          setTokenValid(false);
        }
      } catch (error) {
        console.error("Error validating token:", error);
        setTokenValid(false);
      }
    };

    validateToken();
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/forgot_password_update`,
        {
          ...formData,
          token
        }
      );
      toast.success("Password reset successful!");
      window.location.href = "/login";
    } catch (error) {
      console.error("Error during password reset:", error);
      toast.error(
        error.response?.data?.detail ||
          "An error occurred during password reset. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid === null) {
    return (
      <AuthLayout showDisclaimer={false}>
        <p>Validating...</p>
      </AuthLayout>
    );
  }

  if (!tokenValid) {
    return (
      <AuthLayout showDisclaimer={false}>
        <p className="text-center text-lg">
          Invalid or expired token. Please try again or contact support.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout showDisclaimer={false}>
      <div className="relative">
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-2xl font-bold text-center w-full">
            Reset Password
          </h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="username">Email</Label>
              <Input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                readOnly
              />
            </div>
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="password">New Password</Label>
              <Input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your new password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-lg text-white"
              size="lg"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save New Password"}
            </Button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
