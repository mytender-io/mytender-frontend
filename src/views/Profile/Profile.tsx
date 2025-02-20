import React, { useState, useEffect, useRef } from "react";
import withAuth from "../../routes/withAuth.tsx";
import { useAuthUser } from "react-auth-kit";
import axios from "axios";
import { API_URL, HTTP_PREFIX } from "../../helper/Constants.tsx";
import { CheckCircle } from "lucide-react";
import BreadcrumbNavigation from "@/layout/BreadCrumbNavigation.tsx";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const ProfilePage = () => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    region: "",
    company: "",
    jobRole: "",
    userType: "",
    licences: 0,
    productName: "",
    companyObjectives: "",
    toneOfVoice: ""
  });

  const [inviteEmail, setInviteEmail] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteError, setInviteError] = useState(null);
  const [inviteSuccess, setInviteSuccess] = useState(null);
  const [organizationUsers, setOrganizationUsers] = useState([]);

  const [saveButtonState, setSaveButtonState] = useState("normal"); // 'normal', 'loading', 'success'

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `http${HTTP_PREFIX}://${API_URL}/profile`,
          {
            headers: {
              Authorization: `Bearer ${tokenRef.current}`
            }
          }
        );
        setFormData({
          username: response.data.login || "",
          email: response.data.email || "",
          region: response.data.region || "",
          company: response.data.company || "",
          jobRole: response.data.jobRole || "",
          userType: response.data.userType || "",
          licences: response.data.licenses || 0,
          productName: response.data.product_name || "",
          companyObjectives: response.data.company_objectives || "",
          toneOfVoice: response.data.tone_of_voice || ""
        });
        setLoading(false);
      } catch (err) {
        setError("Failed to load profile data");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [tokenRef]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveButtonState("loading");
    try {
      const dataToSend = {
        company_objectives: formData.companyObjectives,
        tone_of_voice: formData.toneOfVoice
      };

      await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/update_company_info`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );
      setSaveButtonState("success");
      setTimeout(() => setSaveButtonState("normal"), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Error updating profile:", err);
      setSaveButtonState("normal");
      // Handle error (e.g., show an error message)
    }
  };

  useEffect(() => {
    const fetchOrganizationUsers = async () => {
      try {
        const response = await axios.get(
          `http${HTTP_PREFIX}://${API_URL}/organization_users`,
          {
            headers: {
              Authorization: `Bearer ${tokenRef.current}`
            }
          }
        );
        setOrganizationUsers(response.data);
      } catch (err) {
        console.error("Error fetching organization users:", err);
      }
    };

    if (formData.userType === "owner") {
      fetchOrganizationUsers();
    }
  }, [formData.userType]);

  if (error) return <p>{error}</p>;

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setInviteError(null);
    setInviteSuccess(null);

    try {
      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/invite_user`,
        { email: inviteEmail },
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );
      setInviteSuccess("Invitation sent successfully!");
      setFormData((prevData) => ({
        ...prevData,
        licences: prevData.licences - 1 // Deduct the license count
      }));
    } catch (err) {
      console.error("Error inviting user:", err);

      if (err.response) {
        // Handle specific error status codes
        switch (err.response.status) {
          case 400:
            setInviteError("User with this email already exists.");
            break;
          case 403:
            setInviteError(
              "Permission denied: You do not have the rights to invite users."
            );
            break;
          case 404:
            setInviteError(
              "Your account was not found. Please contact support."
            );
            break;
          case 500:
            setInviteError("Internal server error. Please try again later.");
            break;
          default:
            setInviteError("Failed to send invitation. Please try again.");
        }
      } else {
        setInviteError(
          "Failed to send invitation. Please check your connection and try again."
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const parentPages = [] as Array<{ name: string; path: string }>;

  return (
    <div>
      <div className="flex items-center justify-between w-full border-b border-typo-200 px-6 py-2 min-h-[55px]">
        <BreadcrumbNavigation
          currentPage="Profile"
          parentPages={parentPages}
          showHome={true}
        />
      </div>

      <div className="py-4 px-6 space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Profile Section</h1>
          <p className="text-base text-muted-foreground">
            To manage all of your company information
          </p>
        </div>
        <div className="h-[calc(100vh-202px)] overflow-y-auto space-y-4">
          <div className="flex gap-4 h-full">
            <Card className="w-full">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={formData.email}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobRole">Job Role</Label>
                    <Input
                      id="jobRole"
                      value={formData.jobRole}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      value={formData.region}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productName">Subscription Type</Label>
                    <Input
                      id="productName"
                      value={formData.productName}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="w-full">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyObjectives">
                      Company Objectives
                    </Label>
                    <Textarea
                      id="companyObjectives"
                      name="companyObjectives"
                      value={formData.companyObjectives}
                      onChange={handleInputChange}
                      placeholder="Outline your company's overall mission..."
                      className="min-h-[150px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="toneOfVoice">Tone of Voice</Label>
                    <Textarea
                      id="toneOfVoice"
                      name="toneOfVoice"
                      value={formData.toneOfVoice}
                      onChange={handleInputChange}
                      placeholder="Define the preferred tone..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="text-right">
                    <Button
                      type="submit"
                      disabled={saveButtonState === "loading"}
                    >
                      {saveButtonState === "loading" && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {saveButtonState === "success" ? (
                        <>
                          Saved <CheckCircle className="ml-2 h-4 w-4" />
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
          {formData.userType === "owner" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-lg font-semibold">Admin Panel</h3>
                <div className="space-x-2">
                  <Button onClick={() => setShowModal(true)}>
                    Add New User
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      window.open(
                        "https://billing.stripe.com/p/login/00g6p52WPfRG22I8ww",
                        "_blank"
                      )
                    }
                  >
                    Stripe Invoices
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Licenses available: {formData.licences}</p>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizationUsers.map((user, index) => (
                      <TableRow key={index}>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.username || "Request Pending"}
                        </TableCell>
                        <TableCell>{user.role}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
            </DialogHeader>
            <div className="p-4 space-y-4">
              {inviteError && <p className="text-destructive">{inviteError}</p>}
              {inviteSuccess && (
                <p className="text-green-600">{inviteSuccess}</p>
              )}
              <p>
                This will consume a license. Licenses left: {formData.licences}
              </p>
              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Email address</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    placeholder="Enter email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit">Send Invite</Button>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default withAuth(ProfilePage);
