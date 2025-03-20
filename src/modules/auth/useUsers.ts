import { ref } from "vue";
import type { User } from "@/interfaces/interfaces";
import { state } from "../globalStates/state";
import { jwtDecode } from "jwt-decode";

export const useUsers = () => {
  const token = ref<string | null>(null);
  const error = ref<string | null>(null);
  const user = ref<User | null>(null);

  const name = ref<string>("");
  const email = ref<string>("");
  const phone = ref<string>("");
  const password = ref<string>("");
  const dateOfBirth = ref<Date>(new Date());
  const isAdmin = ref<boolean>(false); // Local isAdmin

  const fetchToken = async (email: string, password: string): Promise<void> => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      console.log("ApiBaseUrl:", apiBaseUrl);

      const requestBody = JSON.stringify({ email, password });
      console.log("Request Body:", requestBody);

      const response = await fetch(`${apiBaseUrl}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("lsToken") || "",
        },
        body: requestBody,
      });

      console.log("Response Status:", response.status);
      console.log("Response Headers:", response.headers);

      const responseText = await response.text(); // Read response as text for debugging
      console.log("Response Text:", responseText);

      if (!response.ok) {
        console.error("Error Response:", responseText);
        throw new Error("An error occurred during login");
      }

      const authResponse = JSON.parse(responseText);
      token.value = authResponse.data.token;
      user.value = authResponse.data.user;
      state.isLoggedIn = true;
      state.isAdmin = authResponse.data.user.isAdmin;

      localStorage.setItem("lsToken", authResponse.data.token);
      localStorage.setItem("userIDToken", authResponse.data.user.user_id);
      localStorage.setItem("isAdmin", String(authResponse.data.user.isAdmin));

      console.log("User logged in successfully:", authResponse);
      console.log("Token:", token.value);
    } catch (err) {
      console.error("Login error:", err);
      error.value = (err as Error).message || "An error occurred";
      state.isLoggedIn = false;
      state.isAdmin = false;
    }
  };

  // register user

  const registerUser = async (
    name: string,
    email: string,
    phone: string,
    password: string,
    dateOfBirth: Date,
    isAdmin: boolean
  ): Promise<void> => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      console.log("ApiBaseUrl:", apiBaseUrl);
      const response = await fetch(`${apiBaseUrl}/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          dateOfBirth,
          isAdmin,
        }),
      });

      if (!response.ok) {
        throw new Error("An error occurred");
      }

      const authResponse = await response.json();
      token.value = authResponse.data.token;
      user.value = authResponse.data.user;

      localStorage.setItem("lsToken", authResponse.data.token);
      console.log("user is registered in", authResponse);
    } catch (err) {
      error.value = (err as Error).message || "An error occurred";
    }
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    state.isLoggedIn = false;
    state.isAdmin = false;
    localStorage.removeItem("lsToken");
    console.log("user is logged out");
  };

  const getTokenAndUserId = (): {
    token: string;
    userId: string;
    isAdmin: boolean;
  } => {
    const token = localStorage.getItem("lsToken") ?? "";
    const userId = localStorage.getItem("userIDToken") ?? "";
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!token || !userId) throw new Error("Authentication required");

    // Decode the token for debugging
    try {
      const decodedToken: any = jwtDecode(token);

      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken.exp < currentTime) {
        throw new Error("Session expired, please log in again");
      }
    } catch (err) {
      console.error("Invalid token:", err);
      throw new Error("Invalid token, please log in again");
    }

    return { token, userId, isAdmin };
  };

  return {
    token,
    isLoggedIn: state.isLoggedIn,
    isAdmin: state.isAdmin, // Expose the global isAdmin
    error,
    user,
    name,
    email,
    phone,
    password,
    dateOfBirth,
    fetchToken,
    registerUser,
    logout,
    getTokenAndUserId,
  };
};
