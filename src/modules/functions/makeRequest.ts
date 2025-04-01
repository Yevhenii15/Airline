export const makeRequest = async (
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: object,
  authRequired: boolean = false
) => {
  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    const headers: HeadersInit = { "Content-Type": "application/json" };

    if (authRequired) {
      const token = localStorage.getItem("lsToken");
      if (!token) throw new Error("Authentication required");
      headers["auth-token"] = token;
    }

    const response = await fetch(`${apiBaseUrl}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseText = await response.text();
    console.log(`Response (${method} ${endpoint}):`, responseText);

    if (!response.ok) throw new Error(responseText || "API request failed");

    // Check if the response is JSON
    try {
      return JSON.parse(responseText);
    } catch (e) {
      // If it's not JSON (e.g., success message), return the raw text
      return responseText;
    }
  } catch (err) {
    console.error(`Error in ${method} ${endpoint}:`, err);
    throw new Error((err as Error).message || "An unknown error occurred");
  }
};
