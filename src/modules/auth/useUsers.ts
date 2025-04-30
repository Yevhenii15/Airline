import { ref } from "vue";
import type { User } from "@/interfaces/interfaces";
import { state } from "../globalStates/state";
import { jwtDecode } from "jwt-decode";
import { makeRequest } from "../functions/makeRequest"; // ✅ Import reusable request function

export const useUsers = () => {
  const token = ref<string | null>(null);
  const error = ref<string | null>(null);
  const loading = ref<boolean>(false);
  const user = ref<User | null>(null);

  const name = ref<string>("");
  const email = ref<string>("");
  const phone = ref<string>("");
  const password = ref<string>("");
  const dateOfBirth = ref<Date>(new Date());

  // 🌟 Fetch current user profile
  const fetchUserProfile = async (): Promise<void> => {
    try {
      loading.value = true;
      const { userId, token } = getTokenAndUserId();
      const resp = await makeRequest(`/user/${userId}`, "GET", undefined, true);
      user.value = resp.data as User;
    } catch (err) {
      error.value = (err as Error).message;
    } finally {
      loading.value = false;
    }
  };

  // 🌟 Fetch Token (Login)
  const fetchToken = async (email: string, password: string): Promise<void> => {
    try {
      const authResponse = await makeRequest("/user/login", "POST", {
        email,
        password,
      });

      token.value = authResponse.data.token;
      user.value = authResponse.data.user;

      updateAuthState(authResponse.data.token, authResponse.data.user);
      console.log("User logged in successfully:", authResponse);
    } catch (err) {
      error.value = (err as Error).message;
      resetAuthState();
    }
  };

  // 🌟 Register User
  const registerUser = async (
    name: string,
    email: string,
    phone: string,
    password: string,
    dateOfBirth: Date
  ): Promise<void> => {
    try {
      const authResponse = await makeRequest("/user/register", "POST", {
        name,
        email,
        phone,
        password,
        dateOfBirth,
      });

      token.value = authResponse.data.token;
      user.value = authResponse.data.user;

      updateAuthState(authResponse.data.token, authResponse.data.user);
      console.log("User registered successfully:", authResponse);
    } catch (err) {
      error.value = (err as Error).message;
    }
  };
  // 🌟 Update User Profile
  const updateUserProfile = async (data: {
    name: string;
    phone: string;
    email: string;
  }): Promise<void> => {
    try {
      const { userId } = getTokenAndUserId();
      await makeRequest(`/user/${userId}`, "PUT", data, true);
    } catch (err) {
      error.value = (err as Error).message;
      throw err;
    }
  };

  // 🌟 Change User Password
  const changeUserPassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    try {
      const { userId } = getTokenAndUserId();
      const resp = await makeRequest(
        `/user/${userId}/password`,
        "PATCH",
        {
          currentPassword,
          newPassword,
        },
        true
      );
      console.log("Password changed successfully:", resp.data);
    } catch (err) {
      error.value = (err as Error).message;
      throw err;
    }
  };

  // 🌟 Logout
  const logout = (): void => {
    resetAuthState();
    console.log("User logged out");
  };

  // 🌟 Get Token and User ID
  const getTokenAndUserId = (): {
    token: string;
    userId: string;
    email: string; // Include email in the return type
    isAdmin: boolean;
  } => {
    const token = localStorage.getItem("lsToken") || "";
    const userId = localStorage.getItem("userIDToken") || "";
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!token || !userId) throw new Error("Authentication required");

    // Decode and check token expiration
    try {
      const decodedToken: any = jwtDecode(token);
      if (decodedToken.exp < Math.floor(Date.now() / 1000)) {
        throw new Error("Session expired, please log in again");
      }

      // Return the email along with userId and other data
      return {
        token,
        userId,
        email: decodedToken.email, // Assuming email is stored in the token
        isAdmin,
      };
    } catch (err) {
      console.error("Invalid token:", err);
      throw new Error("Invalid token, please log in again");
    }
  };
  // 🌟 Helper: Update Authentication State
  const updateAuthState = (newToken: string, userData: User) => {
    token.value = newToken;
    user.value = userData;
    state.isLoggedIn = true;
    state.isAdmin = userData.isAdmin;

    localStorage.setItem("lsToken", newToken);
    localStorage.setItem("userIDToken", userData.userId); // ✅
    localStorage.setItem("isAdmin", String(userData.isAdmin));
  };

  // 🌟 Helper: Reset Authentication State
  const resetAuthState = () => {
    token.value = null;
    user.value = null;
    state.isLoggedIn = false;
    state.isAdmin = false;
    localStorage.removeItem("lsToken");
    localStorage.removeItem("userIDToken");
    localStorage.removeItem("isAdmin");
  };

  return {
    token,
    isLoggedIn: state.isLoggedIn,
    isAdmin: state.isAdmin,
    error,
    loading,
    user,
    name,
    email,
    phone,
    password,
    dateOfBirth,
    fetchUserProfile,
    fetchToken,
    registerUser,
    updateUserProfile,
    changeUserPassword,
    logout,
    getTokenAndUserId,
  };
};
