import { ref } from "vue";
import type { flightRoute, NewFlightRoute } from "../interfaces/interfaces";
import { useUsers } from "./auth/useUsers";
const { getTokenAndUserId } = useUsers();

export const useFlightRoutes = () => {
  const error = ref<string | null>(null);
  const loading = ref<boolean>(false);
  const routes = ref<flightRoute[]>([]);

  const fetchRoutes = async (): Promise<void> => {
    loading.value = true;
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/routes`);
      if (!response.ok) throw new Error("No data available");

      const data: flightRoute[] = await response.json();
      routes.value.splice(0, routes.value.length, ...data); // Force reactivity
      console.log("Routes fetched", routes.value);
    } catch (err) {
      error.value = (err as Error).message;
    } finally {
      loading.value = false;
    }
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

  const deleteRoute = async (_id: string): Promise<void> => {
    try {
      if (!_id) {
        console.error("❌ ERROR: Missing route ID! Cannot delete.");
        return;
      }

      const { token, isAdmin } = getTokenAndUserId();
      if (!isAdmin) throw new Error("Access Denied: Admins only");

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/routes/${_id}`, {
        method: "DELETE",
        headers: { "auth-token": token },
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || "Failed to delete route");
      }

      // Update frontend state after deletion
      routes.value = routes.value.filter((route) => route._id !== _id);
      console.log("✅ Route deleted:", _id);
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

      // Find index of the updated route and replace it while preserving `_id`
      const index = routes.value.findIndex((route) => route._id === id);
      if (index !== -1) {
        routes.value[index] = {
          ...updatedData,
          _id: id, // Ensure _id remains unchanged
        };
      }

      console.log("Route updated", routes.value[index]);
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
