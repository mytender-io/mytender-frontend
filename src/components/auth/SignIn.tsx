import React, { useState, useEffect, useCallback } from "react";
import "./Signin.css";
import {
  Alert,
  Button,
  Snackbar,
  TextField,
  Modal,
  Tooltip,
  IconButton
} from "@mui/material";
import useAuthSignIn from "./UseAuthsignIn";
import AuthState from "./AuthState";
import axios, { AxiosResponse } from "axios";
import InfoIcon from "@mui/icons-material/Info";
import { API_URL, HTTP_PREFIX } from "../../helper/Constants";

const Signin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { submitSignIn, isLoading } = useAuthSignIn();
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "warning" | "info"
  >("success");
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState<boolean>(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState<string>("");
  const [isMounted, setIsMounted] = useState(true);

  // Set up cleanup when component unmounts
  useEffect(() => {
    return () => {
      setIsMounted(false);
    };
  }, []);

  // Safe setState wrapper
  const safeSetState = useCallback(
    <T extends unknown>(
      setter: React.Dispatch<React.SetStateAction<T>>,
      value: T
    ) => {
      if (isMounted) {
        setter(value);
      }
    },
    [isMounted]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      safeSetState(setSnackbarMessage, "Username and Password are required");
      safeSetState(setSnackbarSeverity, "error");
      safeSetState(setSnackbarOpen, true);
      return;
    }

    try {
      const { success, message } = await submitSignIn(formData);
      if (isMounted) {
        safeSetState(
          setSnackbarMessage,
          success ? message : "Incorrect Username or Password"
        );
        safeSetState(setSnackbarSeverity, success ? "success" : "error");
        safeSetState(setSnackbarOpen, true);
      }
    } catch (error) {
      if (isMounted) {
        safeSetState(setSnackbarMessage, "Incorrect Username or Password");
        safeSetState(setSnackbarSeverity, "error");
        safeSetState(setSnackbarOpen, true);
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
      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/forgot_password`,
        { email: forgotPasswordEmail },
        { signal: controller.signal }
      );

      if (isMounted) {
        safeSetState(
          setSnackbarMessage,
          "Password reset email sent successfully"
        );
        safeSetState(setSnackbarSeverity, "success");
        safeSetState(setSnackbarOpen, true);
        safeSetState(setForgotPasswordOpen, false);
      }
    } catch (err) {
      if (axios.isCancel(err)) {
        return; // Request was cancelled, do nothing
      }

      if (isMounted) {
        safeSetState(
          setSnackbarMessage,
          "Failed to send password reset email. Please try again."
        );
        safeSetState(setSnackbarSeverity, "error");
        safeSetState(setSnackbarOpen, true);
      }
    }

    return () => {
      controller.abort(); // Cleanup: cancel any in-flight request
    };
  };

  const inputProps = {
    style: {
      "&:WebkitAutofill": {
        WebkitBoxShadow: "0 0 0 1000px white inset",
        WebkitTextFillColor: "#000"
      }
    }
  };

  const labelProps = {
    shrink: true
  };

  return (
    <div className="cards-container">
      <div className="cardmini">
        <div className="cardmini-text">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "20px"
            }}
          >
            <h2 style={{ fontWeight: "800", margin: "0" }}>Login</h2>
            <Tooltip
              title="Disclaimer: Answers generated with AI should always be checked for accuracy, we view our platform as a tool to create amazing proposals, but with the guidance of a human!"
              arrow
              componentsProps={{
                tooltip: {
                  sx: {
                    fontSize: "1rem",
                    padding: "10px"
                  }
                }
              }}
            >
              <IconButton size="medium" style={{ padding: 0 }}>
                <InfoIcon fontSize="medium" color="action" />
              </IconButton>
            </Tooltip>
          </div>

          <form onSubmit={onSubmit}>
            <div className="input-field">
              <TextField
                id="email-input"
                fullWidth
                label="Enter your username"
                variant="outlined"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                onKeyPress={handleKeyPress}
                InputProps={inputProps}
                InputLabelProps={labelProps}
                autoComplete="username"
              />
            </div>
            <div className="input-field">
              <TextField
                id="password-input"
                fullWidth
                label="Password"
                variant="outlined"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                onKeyPress={handleKeyPress}
                InputProps={inputProps}
                InputLabelProps={labelProps}
                autoComplete="current-password"
              />
            </div>
            <Button
              className="login-button"
              variant="contained"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Login"}
            </Button>
          </form>

          <p
            style={{ cursor: "pointer" }}
            onClick={() => setForgotPasswordOpen(true)}
          >
            Forgot your password?
          </p>
        </div>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => safeSetState(setSnackbarOpen, false)}
          style={{
            position: "fixed",
            bottom: "-25%",
            marginBottom: "15px"
          }}
        >
          <Alert
            onClose={() => safeSetState(setSnackbarOpen, false)}
            severity={snackbarSeverity}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
        <Modal
          open={forgotPasswordOpen}
          onClose={() => safeSetState(setForgotPasswordOpen, false)}
        >
          <div className="modal-container">
            <h2>Forgot Password</h2>
            <p>
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
            <TextField
              autoFocus
              label="Email Address"
              type="email"
              fullWidth
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
            />
            <div className="modal-actions">
              <Button
                onClick={() => {
                  safeSetState(setForgotPasswordOpen, false);
                  safeSetState(setForgotPasswordEmail, ""); // Clear the email input
                }}
                color="primary"
              >
                Cancel
              </Button>
              <Button onClick={handleForgotPassword} color="primary">
                Send Email
              </Button>
            </div>
          </div>
        </Modal>

        <AuthState />
      </div>
    </div>
  );
};

export default Signin;
