import { ref } from "vue";
import type { flightRoute, NewFlightRoute } from "../interfaces/interfaces";
import { jwtDecode } from "jwt-decode"; // ✅ Correct import

export const useFlightRoutes = () => {
  const error = ref<string | null>(null);
  const loading = ref<boolean>(false);
  const routes = ref<flightRoute[]>([]);

  const fetchRoutes = async (): Promise<void> => {
    loading.value = true;
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      console.log("📌 ApiBaseUrl:", apiBaseUrl);
      const apiUrl = `${apiBaseUrl}/routes`;

      console.log("📌 Fetching from:", apiUrl);

      const response = await fetch(apiUrl);

      console.log("📌 Full Response Object:", response);

      if (!response.ok) {
        const errorText = await response.text(); // Read the full response text
        console.error("❌ Error Response Text:", errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📌 Raw API Data:", data);

      // ✅ Explicitly define the type for 'route'
      routes.value = data.map(
        (route: {
          _id: string;
          departureAirport_id: string;
          arrivalAirport_id: string;
          duration: string;
        }) => ({
          route_id: route._id, // Ensure compatibility with Vue template
          departureAirport_id: route.departureAirport_id,
          arrivalAirport_id: route.arrivalAirport_id,
          duration: route.duration,
        })
      );

      console.log("✅ Mapped Routes:", routes.value);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      error.value = (err as Error).message;
    } finally {
      loading.value = false;
    }
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

  const addRoute = async (route: NewFlightRoute): Promise<void> => {
    try {
      const { token, isAdmin } = getTokenAndUserId();

      if (!isAdmin) throw new Error("Access Denied: Admins only");

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/routes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify(route),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Server response error:", errorResponse);
        throw new Error(errorResponse.error || "No data available");
      }

      const newRoute: flightRoute = await response.json();
      routes.value.push(newRoute);
      console.log(" New route added", newRoute);

      await fetchRoutes();
    } catch (err) {
      console.error("Error in addRoute:", (err as Error).message);
    }
  };

  const deleteRoute = async (route_id: string): Promise<void> => {
    try {
      if (!route_id) {
        console.error("❌ ERROR: Missing route ID! Cannot delete.");
        return;
      }

      const { token, isAdmin } = getTokenAndUserId();
      if (!isAdmin) throw new Error("Access Denied: Admins only");

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/routes/${route_id}`, {
        method: "DELETE",
        headers: { "auth-token": token },
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || "Failed to delete route");
      }

      // Update frontend state after deletion
      routes.value = routes.value.filter(
        (route) => route.route_id !== route_id
      );
      console.log("✅ Route deleted:", route_id);
    } catch (err) {
      console.error("❌ Error in deleteRoute:", err);
      error.value = (err as Error).message;
    }
  };

  const updateRoute = async (
    id: string,
    updatedRoute: Partial<flightRoute>
  ): Promise<void> => {
    try {
      const { token, isAdmin } = getTokenAndUserId();

      if (!isAdmin) throw new Error("Access Denied: Admins only");
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/routes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "auth-token": token },
        body: JSON.stringify(updatedRoute),
      });

      if (!response.ok) throw new Error("Failed to update route");

      const updatedData: flightRoute = await response.json();
      const index = routes.value.findIndex((route) => route.route_id === id);
      if (index !== -1) routes.value[index] = updatedData;

      console.log("Route updated", updatedData);
    } catch (err) {
      error.value = (err as Error).message;
    }
  };

  return {
    error,
    loading,
    routes,
    fetchRoutes,
    addRoute,
    deleteRoute,
    updateRoute,
  };
};
