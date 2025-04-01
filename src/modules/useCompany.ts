import { ref } from "vue";
import type { AbooutCompany } from "../interfaces/interfaces";
import { useUsers } from "./auth/useUsers";
const { getTokenAndUserId } = useUsers();

export const useCompany = () => {
  const aboutCompany = ref<AbooutCompany | null>(null);
  const error = ref<string | null>(null);
  const loading = ref<boolean>(false);

  const fetchAboutInfo = async (): Promise<void> => {
    loading.value = true;
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/about/company`);

      if (!response.ok) {
        throw new Error("Failed to fetch about company info");
      }

      aboutCompany.value = await response.json();
      console.log("Fetched info:", aboutCompany.value);
    } catch (err) {
      error.value = (err as Error).message;
    } finally {
      loading.value = false;
    }
  };

  const updateAboutInfo = async (
    updatedData: Partial<AbooutCompany>
  ): Promise<void> => {
    loading.value = true;
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

      const { token, isAdmin } = getTokenAndUserId();

      if (!isAdmin) throw new Error("Access Denied: Admins only");

      const response = await fetch(`${apiBaseUrl}/about/company`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error("Failed to update company info");
      }

      const result = await response.json();
      aboutCompany.value = result.company;
      console.log("Updated company info:", aboutCompany.value);
    } catch (err) {
      error.value = (err as Error).message;
    } finally {
      loading.value = false;
    }
  };

  return {
    aboutCompany,
    error,
    loading,
    fetchAboutInfo,
    updateAboutInfo,
  };
};
