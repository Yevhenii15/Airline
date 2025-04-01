import { ref } from "vue";
import type { AboutCompany } from "../interfaces/interfaces";
import { useUsers } from "./auth/useUsers";
import { makeRequest } from "./functions/makeRequest";

const { getTokenAndUserId } = useUsers();

export const useCompany = () => {
  const aboutCompany = ref<AboutCompany | null>(null);
  const error = ref<string | null>(null);
  const loading = ref<boolean>(false);

  const fetchAboutInfo = async (): Promise<void> => {
    loading.value = true;
    try {
      const data = await makeRequest("/about/company", "GET");
      aboutCompany.value = data;
      console.log("Fetched info:", aboutCompany.value);
    } catch (err) {
      error.value = (err as Error).message;
    } finally {
      loading.value = false;
    }
  };

  const updateAboutInfo = async (
    updatedData: Partial<AboutCompany>
  ): Promise<void> => {
    loading.value = true;
    try {
      const { isAdmin } = getTokenAndUserId();
      if (!isAdmin) throw new Error("Access Denied: Admins only");

      const data = await makeRequest(
        "/about/company",
        "PUT",
        updatedData,
        true
      );
      aboutCompany.value = data.company;
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
