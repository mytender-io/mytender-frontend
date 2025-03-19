import axios from "axios";
// import "bootstrap/dist/css/bootstrap.css";
import { useEffect, useRef, useState } from "react";
import { useAuthHeader, useAuthUser } from "react-auth-kit";
import { API_URL, HTTP_PREFIX } from "../helper/Constants";
import withAuthAdmin from "../routes/withAuthAdmin";
import "./AdminPannel.css";

interface IAttributesConfig {
  active: string;
  login: string;
  password: string;

  email: string;
  company: string;
  jobRole: string;
  stripe_customer_id: string;
  organisation_id: string;
  region: string;
  product_name: string;
  userType: string;
  licenses: number;
  question_extractor: string;

  forbidden: string;
  numbers_allowed_prefixes: string;
  selectedModelType: string;
}

const defaultAttributesConfig: IAttributesConfig = {
  active: "On",
  login: "",
  password: "",
  email: "",
  company: "",
  jobRole: "",
  stripe_customer_id: "",
  organisation_id: "",
  region: "",
  product_name: "",
  userType: "member",
  licenses: 0,
  question_extractor: "",
  forbidden: "",
  numbers_allowed_prefixes: "",
  selectedModelType: "gpt-3.5-turbo"
};

const AdminPannel = () => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");
  const email = auth?.email || "default";

  const getAuthHeader = useAuthHeader();
  const authHeader = getAuthHeader();
  // console.log(authHeader);  // Outputs: 'Bearer your_token_here'

  const [availableUsers, setAvailableUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [data, setData] = useState<IAttributesConfig>(defaultAttributesConfig);

  // Function to display Bootstrap alerts
  const displayAlert = (message, type) => {
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type} fixed-bottom text-center mb-0 rounded-0`;
    alertDiv.innerHTML = message;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
  };

  const saveUser = () => {
    console.log(data);
    axios
      .post(
        `http${HTTP_PREFIX}://${API_URL}/save_user`,
        { generic_dict: data },
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      )

      .then((response) => {
        // console.log("Response from server:", response.data);
        load_available_users();
        loadUser(data.login);
        displayAlert("User successfully saved", "success");
      })
      .catch((error) => {
        console.error("Error saving user:", error);
        displayAlert("Failed to save user", "danger");
      });
  };

  const load_available_users = () => {
    axios
      .post(
        `http${HTTP_PREFIX}://${API_URL}/get_users`,
        {},
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      )
      .then((res) => {
        setAvailableUsers(res.data.users || []);
        // console.log('Available users:', res.data.users);
        setData(defaultAttributesConfig);
      })
      .catch((error) => {
        console.error("Error fetching strategies:", error);
      });
  };

  useEffect(() => {
    load_available_users();
  }, []);

  const loadUser = (strat) => {
    const userToLoad = typeof strat === "string" ? strat : selectedUser;
    setSelectedUser(userToLoad);
    // console.log("Loading Strategy:", strategyToLoad);  // Debug log

    // Initialize data with defaultAttributesConfig
    setData(defaultAttributesConfig);

    axios
      .post(
        `http${HTTP_PREFIX}://${API_URL}/load_user`,
        { username: userToLoad },
        { headers: { Authorization: `Bearer ${tokenRef.current}` } }
      )

      .then((res) => {
        // Merge the default attributes with the loaded strategy data
        const mergedData = { ...defaultAttributesConfig, ...res.data };

        // Update the state to re-render your component
        setData(mergedData);
      })
      .catch((error) => {
        console.error("Error loading user:", error);
        displayAlert("Failed to load user", "danger");
      });
  };

  const deleteUser = () => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setSelectedUser(selectedUser);

      axios
        .post(
          `http://${API_URL}/delete_user`,
          { username: selectedUser },
          {
            headers: {
              Authorization: `Bearer ${tokenRef.current}`
            }
          }
        )
        .then((res) => {
          setAvailableUsers([]);
          load_available_users();
          displayAlert("Strategy successfully deleted", "success");
        })
        .catch((error) => {
          console.error("Error loading strategy:", error);
          displayAlert("Failed to load strategy", "danger");
        });
    } else {
      displayAlert("User deletion cancelled", "warning");
    }
  };

  const handleChange = (attr: keyof IAttributesConfig, value: any) => {
    setData((prevConfig) => ({ ...prevConfig, [attr]: value }));
  };

  // Render
  return (
    <div className="adminContainer">
      <div className="strategy-form">
        <h2>User Configuration</h2>

        {/* Load existing strategy */}
        <div className="selections-box">
          <label>Select User:</label>
          <div className="selections">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="" disabled>
                Select a user
              </option>{" "}
              {/* This option is added */}
              {availableUsers.map((strategy) => (
                <option key={strategy} value={strategy}>
                  {strategy}
                </option>
              ))}
            </select>
            <button onClick={loadUser}>Load</button>
            <button
              style={{ backgroundColor: "red", color: "white" }}
              onClick={deleteUser}
            >
              Del
            </button>
          </div>
        </div>

        {/* username Name
      <div className="strategy-name">
        <label>Update / Create User:</label>
        <input type="text" value={data.login} onChange={(e) => handleChange('login', e.target.value)} />
      </div> */}

        {/* status */}
        <div className="selection-box d-flex">
          <label>User status:</label>
          <div className="selections">
            <select
              value={data.active}
              onChange={(e) => handleChange("active", e.target.value)}
            >
              <option value="off">Active</option>
            </select>
          </div>
        </div>

        {/* Model selection */}
        <label>Select LLM Model</label>
        <div className="sport-type">
          <select
            value={data.selectedModelType}
            onChange={(e) => handleChange("selectedModelType", e.target.value)}
          >
            <option value="gpt-3.5-turbo">
              gpt-3.5-turbo (£0.02 / request)
            </option>
            <option value="gpt-4-turbo-preview">
              gpt-4-1106-preview-128k (£0.50 / request)
            </option>
            {/*<option value="gemini-pro">Google Gemini pro</option>*/}
            {/*<option value="microsoft/Orca-2-13b">Microsoft Orca-2 13b</option>*/}
          </select>
        </div>

        <div className="login">
          <label>login:</label>
          <input
            rows="5"
            disabled
            value={data.login}
            onChange={(e) => handleChange("login", e.target.value)}
          />
        </div>

        <div className="login">
          <label>Password:</label>
          <input
            value={data.password}
            disabled
            type="password"
            onChange={(e) => handleChange("password", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Company:</label>
          <input
            type="text"
            value={data.company}
            onChange={(e) => handleChange("company", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Job Role:</label>
          <input
            type="text"
            value={data.jobRole}
            onChange={(e) => handleChange("jobRole", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Stripe Customer ID:</label>
          <input
            type="text"
            value={data.stripe_customer_id}
            onChange={(e) => handleChange("stripe_customer_id", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Organisation ID:</label>
          <input
            type="text"
            value={data.organisation_id}
            onChange={(e) => handleChange("organisation_id", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Region:</label>
          <input
            type="text"
            value={data.region}
            onChange={(e) => handleChange("region", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Product Name:</label>
          <input
            type="text"
            value={data.product_name}
            onChange={(e) => handleChange("product_name", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>User Type:</label>
          <select
            value={data.userType}
            onChange={(e) => handleChange("userType", e.target.value)}
          >
            <option value="member">Member</option>
            <option value="owner">Owner</option>
          </select>
        </div>
        <div className="form-group">
          <label>Licenses:</label>
          <input
            type="number"
            value={data.licenses}
            onChange={(e) => handleChange("licenses", parseInt(e.target.value))}
          />
        </div>

        <div className="prompt">
          <label>Question extractor from PDF</label>
          <textarea
            value={data.question_extractor}
            onChange={(e) => handleChange("question_extractor", e.target.value)}
          />
        </div>

        <div className="prompt">
          <label>Comma separated words that are replaced with [ ] </label>
          <textarea
            value={data.forbidden}
            onChange={(e) => handleChange("forbidden", e.target.value)}
          />
        </div>

        <div className="prompt">
          <label>
            Replace numbers from the context with [number] except when they have
            the following prefixes (comma separated list)
          </label>
          <textarea
            value={data.numbers_allowed_prefixes}
            onChange={(e) =>
              handleChange("numbers_allowed_prefixes", e.target.value)
            }
          />
        </div>
        {/* Submit button */}
        <div className="submit-btn">
          <button onClick={saveUser}>Save</button>{" "}
          {/* Invoke saveStrategy when clicked */}
        </div>
      </div>
    </div>
  );
};

export default withAuthAdmin(AdminPannel);
