import React, { useState, useEffect, useRef } from "react";
import withAuth from "../../routes/withAuth";
import { useAuthUser } from "react-auth-kit";
import axios from "axios";
import { API_URL, HTTP_PREFIX } from "../../helper/Constants";
import { CheckCircle } from "lucide-react";
import BreadcrumbNavigation from "@/layout/BreadCrumbNavigation";
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
import UserProfileIcon from "@/components/icons/UserProfileIcon";
import JobResponseIcon from "@/components/icons/JobResponseIcon";
import CompanyIcon from "@/components/icons/CompanyIcon";
import LocationIcon from "@/components/icons/LocationIcon";
import EmailIcon from "@/components/icons/EmailIcon";
import DownloadIcon from "@/components/icons/DownloadIcon";
import SubscriptionIcon from "@/components/icons/SubscriptionIcon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/utils";
import { toast } from "react-toastify";
import ToneOfVoiceLibrary from "../BidInputs/ToneOfVoiceLibrary";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Info } from "lucide-react";

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
    toneOfVoice: "",
    profilePicture: ""
  });

  const [inviteEmail, setInviteEmail] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [organizationUsers, setOrganizationUsers] = useState([]);

  const [companyObjectivesSaveState, setCompanyObjectivesSaveState] =
    useState("normal");
  const [toneOfVoiceSaveState, setToneOfVoiceSaveState] = useState("normal");
  const [profileSaveState, setProfileSaveState] = useState("normal");

  const [companyObjectives, setCompanyObjectives] = useState("");
  const [isEditingObjectives, setIsEditingObjectives] = useState(false);

  // For permission management
  const [permissionChangeLoading, setPermissionChangeLoading] = useState({});

  const [refreshImage, setRefreshImage] = useState(false);

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
          toneOfVoice: response.data.tone_of_voice || "",
          profilePicture: response.data.company_logo || ""
        });

        // Fetch company objectives using the new endpoint
        fetchCompanyObjectives();

        setLoading(false);
      } catch (err) {
        console.log(err);
        toast.error("Failed to load profile data");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [tokenRef]);

  // New function to fetch company objectives using the dedicated endpoint
  const fetchCompanyObjectives = async () => {
    try {
      const response = await axios.get(
        `http${HTTP_PREFIX}://${API_URL}/get_company_objectives`,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );

      setCompanyObjectives(response.data.company_objectives || "");
      // Also update the form data to keep everything in sync
      setFormData((prev) => ({
        ...prev,
        companyObjectives: response.data.company_objectives || ""
      }));
    } catch (err) {
      console.error("Failed to fetch company objectives:", err);
      toast.error("Failed to load company objectives");
    }
  };

  // New function to handle saving company objectives using the dedicated endpoint
  const handleSaveCompanyObjectives = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setCompanyObjectivesSaveState("loading");

    try {
      // Create FormData and append the objectives
      const formData = new FormData();
      formData.append("objectives", companyObjectives);

      await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/set_company_objectives`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setCompanyObjectivesSaveState("success");
      toast.success("Company objectives updated successfully");
      setIsEditingObjectives(false);

      // Reset the state after showing success
      setTimeout(() => setCompanyObjectivesSaveState("normal"), 2000);
    } catch (err) {
      console.error("Failed to save company objectives:", err);
      toast.error("Failed to update company objectives");
      setCompanyObjectivesSaveState("normal");
    }
  };

  // Function to handle permission changes
  const handleChangePermission = async (username, newRole) => {
    // Show loading for this specific user
    setPermissionChangeLoading((prev) => ({ ...prev, [username]: true }));

    try {
      const formData = new FormData();
      formData.append("target_user", username);
      formData.append("new_user_type", newRole);

      await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/change_user_permissions`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      toast.success(`User role updated to ${newRole}`);

      // Refresh the user list
      const refreshFormData = new FormData();
      refreshFormData.append("include_pending", "true");

      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/get_organization_users`,
        refreshFormData,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setOrganizationUsers(response.data);
    } catch (err) {
      console.error("Error changing user permissions:", err);
      if (err.response && err.response.data && err.response.data.detail) {
        toast.error(
          `Failed to change permissions: ${err.response.data.detail}`
        );
      } else {
        toast.error("Failed to change user permissions");
      }
    } finally {
      setPermissionChangeLoading((prev) => ({ ...prev, [username]: false }));
    }
  };

  // Modified to show success without making API call
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    formType: string
  ) => {
    e.preventDefault();

    if (formType === "companyObjectives") {
      await handleSaveCompanyObjectives(e);
      return;
    }

    let setSaveState;
    if (formType === "toneOfVoice") {
      setSaveState = setToneOfVoiceSaveState;
    } else {
      setSaveState = setProfileSaveState;
    }

    setSaveState("loading");

    // Simulate success after delay without making API call
    setTimeout(() => {
      setSaveState("success");
      setTimeout(() => setSaveState("normal"), 2000); // Reset after 2 seconds
    }, 1000);
  };

  useEffect(() => {
    const fetchOrganizationUsers = async () => {
      try {
        const formData = new FormData();
        formData.append("include_pending", "true");

        const response = await axios.post(
          `http${HTTP_PREFIX}://${API_URL}/get_organization_users`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${tokenRef.current}`,
              "Content-Type": "multipart/form-data"
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

  const handleInviteSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInviteError("");
    setInviteSuccess("");

    try {
      await axios.post(
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
    } catch (err: any) {
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

  const handleProfilePictureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e?.target?.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("File size exceeds 5MB limit");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG, and GIF files are allowed");
      return;
    }

    setRefreshImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Convert file to base64 for preview
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Extract the base64 data part (remove the data:image/xxx;base64, prefix)
        const base64Data = base64String.split(",")[1];

        setFormData((prev) => ({
          ...prev,
          profilePicture: base64Data
        }));
      };
      reader.readAsDataURL(file);

      await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/set_company_logo`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      toast.success("Profile picture updated successfully");
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      toast.error("Failed to upload profile picture. Please try again.");
    } finally {
      setRefreshImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  const parentPages = [] as Array<{ name: string; path: string }>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between w-full border-b border-typo-200 px-6 py-2 min-h-[3.4375rem]">
        <BreadcrumbNavigation
          currentPage="Profile"
          parentPages={parentPages}
          refreshImage={refreshImage}
        />
      </div>

      <div className="flex-1 flex flex-col py-4 space-y-8 overflow-y-auto">
        <div className="space-y-2 px-6">
          <h1 className="text-2xl font-semibold">Profile Section</h1>
          <p className="text-base text-muted-foreground">
            To manage all of your company information
          </p>
        </div>
        <div className="flex-1">
          <Card className="max-w-5xl w-full bg-transparent mx-auto mt-10">
            <CardContent className="px-0 rounded-lg overflow-hidden">
              <div>
                <div className="relative w-full h-32 bg-orange-gradient">
                  <div className="absolute left-8 top-8 flex items-center justify-center bg-orange-lighter rounded-full w-32 h-32 border border-white overflow-hidden group">
                    {formData.profilePicture ? (
                      <img
                        src={`data:image/jpeg;base64,${formData.profilePicture}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <h1 className="text-3xl font-semibold uppercase">
                        {formData.username.slice(0, 1)}
                      </h1>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <label
                        htmlFor="profile-picture-upload"
                        className="cursor-pointer text-white text-xs font-medium"
                      >
                        {refreshImage ? (
                          <Spinner className="text-white" />
                        ) : (
                          "Change Photo"
                        )}
                      </label>
                      <input
                        id="profile-picture-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        className="hidden"
                        onChange={handleProfilePictureUpload}
                        disabled={refreshImage}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 w-full px-4 bg-white pt-12 items-stretch">
                  <Card
                    className={cn(
                      "w-[30%]",
                      formData.userType === "owner" ? "mt-11" : ""
                    )}
                  >
                    <CardContent>
                      <form
                        onSubmit={(e) => handleSubmit(e, "profile")}
                        className="pt-6 space-y-10"
                      >
                        <div className="space-y-3">
                          <h3 className="text-base font-bold">About</h3>
                          <div className="space-y-2">
                            <div className="flex items-center gap-4 py-2 cursor-default">
                              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                                <UserProfileIcon className="text-gray-hint_text" />
                              </div>
                              <span className="text-gray-hint_text">
                                {formData.username || "Username not available"}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 py-2 cursor-default">
                              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                                <JobResponseIcon className="text-gray-hint_text" />
                              </div>
                              <span className="text-gray-hint_text">
                                {formData.jobRole || "Job Role not available"}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 py-2 cursor-default">
                              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                                <CompanyIcon className="text-gray-hint_text" />
                              </div>
                              <span className="text-gray-hint_text">
                                {formData.company || "Company not available"}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 py-2 cursor-default">
                              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                                <LocationIcon className="text-gray-hint_text" />
                              </div>
                              <span className="text-gray-hint_text">
                                {formData.region || "Location not available"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-base font-bold">Contact</h3>
                          <div className="space-y-4">
                            <div className="flex items-center gap-4 py-2 cursor-default">
                              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                                <EmailIcon className="text-gray-hint_text" />
                              </div>
                              <span
                                className="text-gray-hint_text truncate max-w-[180px]"
                                title={formData.email || "Email not available"}
                              >
                                {formData.email || "Email not available"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-base font-bold">
                            Subscription Type
                          </h3>
                          <div className="space-y-2">
                            <div className="flex items-center gap-4 py-2 cursor-default">
                              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                                <SubscriptionIcon className="text-gray-hint_text" />
                              </div>
                              <span className="text-gray-hint_text">
                                {formData.productName ||
                                  "Subscription not available"}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div
                              className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 py-2 rounded-md transition-colors"
                              onClick={() =>
                                window.open(
                                  "https://billing.stripe.com/p/login/00g6p52WPfRG22I8ww",
                                  "_blank"
                                )
                              }
                            >
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-4 w-full">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="bg-transparent [&_svg]:size-6 hover:bg-transparent p-0 w-6 h-6"
                                        onClick={(e) => e.stopPropagation()} // Prevent double triggering
                                      >
                                        <DownloadIcon className="text-gray-hint_text" />
                                      </Button>
                                      <span className="select-none text-gray-hint_text">
                                        Download Invoices
                                      </span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Download your invoices here
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                  <div className="w-[70%] space-y-6">
                    {formData.userType === "owner" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-end space-x-2">
                          <Button onClick={() => setShowModal(true)}>
                            Add New User
                          </Button>
                          <Button
                            variant="outline"
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
                        <Card>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <h3 className="text-base font-bold">
                                Admin Panel
                              </h3>
                              <span>
                                Licenses available: {formData.licences}
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Email</TableHead>
                                  <TableHead>Username</TableHead>
                                  <TableHead>Role</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {organizationUsers.map(
                                  (user: any, index: number) => (
                                    <TableRow key={index}>
                                      <TableCell>{user.email}</TableCell>
                                      <TableCell>
                                        {user.username || "Request Pending"}
                                      </TableCell>
                                      <TableCell>
                                        {user.role === "Pending" ? (
                                          "Pending"
                                        ) : formData.username ===
                                          user.username ? (
                                          <TooltipProvider delayDuration={0}>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <div className="flex items-center gap-2 w-full capitalize">
                                                  {user.role}
                                                  <Info className="size-4" />
                                                </div>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                {user.role === "owner"
                                                  ? "Full platform control"
                                                  : user.role === "member"
                                                    ? "Can create new tenders and bid manage in the tender dahsboard."
                                                    : " Can create and write bids."}
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        ) : (
                                          <div className="flex items-center gap-2">
                                            {permissionChangeLoading[
                                              user.username
                                            ] ? (
                                              <Spinner className="h-4 w-4" />
                                            ) : null}
                                            <Select
                                              defaultValue={user.role}
                                              onValueChange={(value) =>
                                                handleChangePermission(
                                                  user.username,
                                                  value
                                                )
                                              }
                                              disabled={
                                                permissionChangeLoading[
                                                  user.username
                                                ]
                                              }
                                            >
                                              <SelectTrigger className="h-8 w-32">
                                                <SelectValue
                                                  placeholder={user.role}
                                                />
                                                <TooltipProvider
                                                  delayDuration={0}
                                                >
                                                  <Tooltip>
                                                    <TooltipTrigger asChild>
                                                      <Info className="size-4" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                      {user.role === "owner"
                                                        ? "Full platform control"
                                                        : user.role === "member"
                                                          ? "Can create new tenders and bid manage in the tender dahsboard."
                                                          : " Can create and write bids."}
                                                    </TooltipContent>
                                                  </Tooltip>
                                                </TooltipProvider>
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="member">
                                                  Manager
                                                </SelectItem>
                                                <SelectItem value="reviewer">
                                                  Writer
                                                </SelectItem>
                                                <SelectItem value="owner">
                                                  Owner
                                                </SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  )
                                )}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                    <form
                      id="companyObjectivesForm"
                      onSubmit={(e) => handleSubmit(e, "companyObjectives")}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold">
                          Company Objectives
                        </h3>
                        <div className="flex gap-2">
                          {isEditingObjectives ? (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setIsEditingObjectives(false);
                                  // Reset to the last saved value
                                  setCompanyObjectives(
                                    formData.companyObjectives
                                  );
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                disabled={
                                  companyObjectivesSaveState === "loading"
                                }
                                form="companyObjectivesForm"
                              >
                                {companyObjectivesSaveState === "loading" && (
                                  <Spinner className="text-white mr-2" />
                                )}
                                {companyObjectivesSaveState === "success" ? (
                                  <>
                                    Saved{" "}
                                    <CheckCircle className="ml-2 h-4 w-4" />
                                  </>
                                ) : (
                                  "Save Changes"
                                )}
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              type="button"
                              onClick={() => setIsEditingObjectives(true)}
                            >
                              Edit Objectives
                            </Button>
                          )}
                        </div>
                      </div>
                      {isEditingObjectives ? (
                        <Textarea
                          name="companyObjectives"
                          value={companyObjectives}
                          onChange={(e) => setCompanyObjectives(e.target.value)}
                          className="min-h-[150px]"
                          placeholder="Enter your company objectives here..."
                        />
                      ) : (
                        <div
                          className={cn(
                            "min-h-[150px] h-[150px] p-8 bg-gray-50 text-gray-500 border border-gray-200 rounded-md",
                            companyObjectives
                              ? "overflow-y-auto"
                              : "flex items-center justify-center"
                          )}
                          style={{ wordBreak: "break-word" }}
                        >
                          {companyObjectives
                            ? companyObjectives
                            : "No company objectives available."}
                        </div>
                      )}
                    </form>
                    <ToneOfVoiceLibrary selectable={false} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
              </DialogHeader>
              <div className="p-4 space-y-4">
                {inviteError && (
                  <p className="text-destructive">{inviteError}</p>
                )}
                {inviteSuccess && (
                  <p className="text-green-600">{inviteSuccess}</p>
                )}
                <p>
                  This will consume a license. Licenses left:{" "}
                  {formData.licences}
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
    </div>
  );
};

export default withAuth(ProfilePage);
