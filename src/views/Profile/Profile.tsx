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
import UserProfileIcon from "@/components/icons/UserProfileIcon.tsx";
import JobResponseIcon from "@/components/icons/JobResponseIcon.tsx";
import CompanyIcon from "@/components/icons/CompanyIcon.tsx";
import LocationIcon from "@/components/icons/LocationIcon.tsx";
import EmailIcon from "@/components/icons/EmailIcon.tsx";
import DownloadIcon from "@/components/icons/DownloadIcon.tsx";
import SubscriptionIcon from "@/components/icons/SubscriptionIcon.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";
import MeshGradient from "@/components/mesh-gradient/MeshGradient";
import { cn } from "@/utils";
import { toast } from "react-toastify";

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

  const [editableFields, setEditableFields] = useState({
    productName: false,
    username: false,
    email: false,
    region: false,
    company: false,
    jobRole: false
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  const toggleEditable = (field: keyof typeof editableFields) => {
    setEditableFields((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

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

        const profilePicture = await axios.get(
          `http${HTTP_PREFIX}://${API_URL}/get_company_logo`,
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
          profilePicture: profilePicture.data.image || ""
        });
        setLoading(false);
      } catch (err) {
        console.log(err);
        toast.error("Failed to load profile data");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [tokenRef]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    formType: string
  ) => {
    e.preventDefault();

    let setSaveState;
    if (formType === "companyObjectives") {
      setSaveState = setCompanyObjectivesSaveState;
    } else if (formType === "toneOfVoice") {
      setSaveState = setToneOfVoiceSaveState;
    } else {
      setSaveState = setProfileSaveState;
    }

    setSaveState("loading");

    try {
      const dataToSend = {
        username: formData.username,
        email: formData.email,
        region: formData.region,
        company: formData.company,
        jobRole: formData.jobRole,
        userType: formData.userType,
        licences: formData.licences,
        productName: formData.productName,
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
      setSaveState("success");
      setTimeout(() => setSaveState("normal"), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error(`Error updating ${formType}:`, err);
      setSaveState("normal");
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

    setUploadingImage(true);

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
      setUploadingImage(false);
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
          uploadingImage={uploadingImage}
        />
      </div>

      <div className="flex-1 flex flex-col py-4 space-y-8 overflow-y-auto">
        <div className="space-y-2 px-6">
          <h1 className="text-2xl font-semibold">Profile Section</h1>
          <p className="text-base text-muted-foreground">
            To manage all of your company information
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <MeshGradient>
            <Card className="max-w-5xl w-full bg-transparent mx-auto mt-10">
              <CardContent className="px-0 rounded-lg overflow-hidden">
                <div>
                  <div className="relative w-full h-32 bg-orange-gradient/50">
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
                          {uploadingImage ? (
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
                          disabled={uploadingImage}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 w-full px-4 bg-white pt-12">
                    <Card
                      className={cn(
                        "w-[30%] h-fit",
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
                              <div className="flex items-center gap-4">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="bg-transparent [&_svg]:size-6 hover:bg-transparent p-0 w-6 h-6"
                                      >
                                        <UserProfileIcon className="text-gray-hint_text" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Select this field to add your name
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <Input
                                  id="username"
                                  name="username"
                                  value={formData.username}
                                  placeholder="Username"
                                  readOnly
                                  className="border-none outline-none shadow-none text-gray-hint_text focus:border-none focus:outline-none focus-visible:ring-0"
                                />
                              </div>
                              <div className="flex items-center gap-4">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="bg-transparent [&_svg]:size-6 hover:bg-transparent p-0 w-6 h-6"
                                      >
                                        <JobResponseIcon className="text-gray-hint_text" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Select this feild to add your job title
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <Input
                                  id="jobRole"
                                  name="jobRole"
                                  value={formData.jobRole}
                                  placeholder="Job Role"
                                  readOnly={!editableFields.jobRole}
                                  onClick={() => toggleEditable("jobRole")}
                                  onBlur={() => toggleEditable("jobRole")}
                                  onChange={handleInputChange}
                                  className={
                                    editableFields.jobRole
                                      ? ""
                                      : "border-none outline-none shadow-none text-gray-hint_text"
                                  }
                                />
                              </div>
                              <div className="flex items-center gap-4">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="bg-transparent [&_svg]:size-6 hover:bg-transparent p-0 w-6 h-6"
                                      >
                                        <CompanyIcon className="text-gray-hint_text" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Select this feild to add your company
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <Input
                                  id="company"
                                  name="company"
                                  value={formData.company}
                                  placeholder="Company Name"
                                  readOnly={!editableFields.company}
                                  onClick={() => toggleEditable("company")}
                                  onBlur={() => toggleEditable("company")}
                                  onChange={handleInputChange}
                                  className={
                                    editableFields.company
                                      ? ""
                                      : "border-none outline-none shadow-none text-gray-hint_text"
                                  }
                                />
                              </div>
                              <div className="flex items-center gap-4">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="bg-transparent [&_svg]:size-6 hover:bg-transparent p-0 w-6 h-6"
                                      >
                                        <LocationIcon className="text-gray-hint_text" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Select this field to add your country
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <Input
                                  id="region"
                                  name="region"
                                  value={formData.region}
                                  placeholder="Location"
                                  readOnly={!editableFields.region}
                                  onClick={() => toggleEditable("region")}
                                  onBlur={() => toggleEditable("region")}
                                  onChange={handleInputChange}
                                  className={
                                    editableFields.region
                                      ? ""
                                      : "border-none outline-none shadow-none text-gray-hint_text"
                                  }
                                />
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <h3 className="text-base font-bold">Contact</h3>
                            <div className="space-y-4">
                              <div className="flex items-center gap-4">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="bg-transparent [&_svg]:size-6 hover:bg-transparent p-0 w-6 h-6"
                                      >
                                        <EmailIcon className="text-gray-hint_text" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Select this field to add your email
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <Input
                                  id="email"
                                  name="email"
                                  value={formData.email}
                                  placeholder="Enter your email here"
                                  readOnly={!editableFields.email}
                                  onClick={() => toggleEditable("email")}
                                  onBlur={() => toggleEditable("email")}
                                  onChange={handleInputChange}
                                  className={
                                    editableFields.email
                                      ? ""
                                      : "border-none outline-none shadow-none text-gray-hint_text"
                                  }
                                />
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <h3 className="text-base font-bold">
                              Subscription Type
                            </h3>
                            <div className="space-y-2">
                              <div className="flex items-center gap-4">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="bg-transparent [&_svg]:size-6 hover:bg-transparent p-0 w-6 h-6"
                                      >
                                        <SubscriptionIcon className="text-gray-hint_text" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Here is your current subscription
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <Input
                                  id="productName"
                                  value={formData.productName}
                                  placeholder="Enter Product Name"
                                  readOnly={!editableFields.productName}
                                  onClick={() => toggleEditable("productName")}
                                  onChange={handleInputChange}
                                  onBlur={() => toggleEditable("productName")}
                                  name="productName"
                                  className={
                                    editableFields.productName
                                      ? ""
                                      : "border-none outline-none shadow-none text-gray-hint_text"
                                  }
                                />
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div
                                className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 py-2 -2rounded-md transition-colors"
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
                                        <span className="text-sm select-none px-3 text-gray-hint_text">
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
                          <div className="text-right">
                            <Button
                              type="submit"
                              disabled={profileSaveState === "loading"}
                            >
                              {profileSaveState === "loading" && (
                                <Spinner className="text-white" />
                              )}
                              {profileSaveState === "success" ? (
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
                    <div className="w-[70%] space-y-6">
                      {formData.userType === "owner" && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-end space-x-2">
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
                                        <TableCell>{user.role}</TableCell>
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
                          <Button
                            type="submit"
                            disabled={companyObjectivesSaveState === "loading"}
                            form="companyObjectivesForm"
                          >
                            {companyObjectivesSaveState === "loading" && (
                              <Spinner className="text-white" />
                            )}
                            {companyObjectivesSaveState === "success" ? (
                              <>
                                Saved <CheckCircle className="ml-2 h-4 w-4" />
                              </>
                            ) : (
                              "Save Changes"
                            )}
                          </Button>
                        </div>
                        <Textarea
                          id="companyObjectives"
                          name="companyObjectives"
                          value={formData.companyObjectives}
                          onChange={(e: React.ChangeEvent<HTMLElement>) =>
                            handleInputChange(e)
                          }
                          placeholder="Outline your company's overall mission..."
                          className="min-h-[150px]"
                        />
                      </form>
                      <form
                        id="toneOfVoiceForm"
                        onSubmit={(e) => handleSubmit(e, "toneOfVoice")}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold">
                            Tone of Voice Library
                          </h3>
                          <Button
                            type="submit"
                            disabled={toneOfVoiceSaveState === "loading"}
                            form="toneOfVoiceForm"
                          >
                            {toneOfVoiceSaveState === "loading" && (
                              <Spinner className="text-white" />
                            )}
                            {toneOfVoiceSaveState === "success" ? (
                              <>
                                Saved <CheckCircle className="ml-2 h-4 w-4" />
                              </>
                            ) : (
                              "Save Changes"
                            )}
                          </Button>
                        </div>
                        <Textarea
                          id="toneOfVoice"
                          name="toneOfVoice"
                          value={formData.toneOfVoice}
                          onChange={(e: React.ChangeEvent<HTMLElement>) =>
                            handleInputChange(e)
                          }
                          placeholder="Define the preferred tone..."
                          className="min-h-[100px]"
                        />
                      </form>
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
          </MeshGradient>
        </div>
      </div>
    </div>
  );
};

export default withAuth(ProfilePage);
