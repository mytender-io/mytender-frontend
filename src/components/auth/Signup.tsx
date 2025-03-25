import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { API_URL, HTTP_PREFIX } from "../../helper/Constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import AuthLayout from "@/layout/AuthLayout";

const Signup = () => {
  const [tokenValid, setTokenValid] = useState(true);
  const [formData, setFormData] = useState({
    firstname: "",
    username: "",
    password: "",
    company: "",
    jobRole: "",
    email: "",
    region: "",
    subscriptionType: ""
  });
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await axios.post(
          `http${HTTP_PREFIX}://${API_URL}/validate_signup_token`,
          { token }
        );
        if (response.data.valid) {
          setTokenValid(true);
          setFormData((prevFormData) => ({
            ...prevFormData,
            email: response.data.email || "",
            region: response.data.region || "",
            subscriptionType: response.data.product_name || ""
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!tokenValid) return;

    try {
      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/update_user_details`,
        { ...formData, token }
      );
      console.log("Signup successful:", response.data);
      toast.success("Signup successful!");
      window.location.href = "/login"; // Redirect to the login page
    } catch (error: any) {
      console.error("Error during signup:", error);
      if (error.response && error.response.data) {
        toast.error(error.response.data.detail); // Show the error message returned by the backend
      } else {
        toast.error(
          "An error occurred during signup. Please try again or contact support."
        );
      }
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
        <p>Invalid or expired token. Please contact support or try again.</p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="relative">
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-2xl font-bold text-center w-full">
            Create Account
          </h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="username">First Name</Label>
              <Input
                type="text"
                id="firstname"
                name="firstname"
                placeholder="Enter your first name"
                value={formData.firstname}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="username">Username</Label>
              <Input
                type="text"
                id="username"
                name="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid w-full items-center gap-3">
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid w-full items-center gap-3">
              <Label htmlFor="company">Company</Label>
              <Input
                type="text"
                id="company"
                name="company"
                placeholder="Enter your company"
                value={formData.company}
                onChange={handleChange}
              />
            </div>

            <div className="grid w-full items-center gap-3">
              <Label htmlFor="jobRole">Job Role</Label>
              <Input
                type="text"
                id="jobRole"
                name="jobRole"
                placeholder="Enter your job role"
                value={formData.jobRole}
                onChange={handleChange}
              />
            </div>

            <div className="grid w-full items-center gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                defaultValue={formData.email}
              />
            </div>

            <div className="grid w-full items-center gap-3">
              <Label htmlFor="region">Region</Label>
              <Input
                type="text"
                id="region"
                name="region"
                value={formData.region}
                readOnly
              />
            </div>

            <div className="grid w-full items-center gap-3">
              <Label htmlFor="subscriptionType">Subscription Type</Label>
              <Input
                type="text"
                id="subscriptionType"
                name="subscriptionType"
                value={formData.subscriptionType}
                readOnly
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg text-white"
              size="lg"
            >
              Create Account
            </Button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Signup;
