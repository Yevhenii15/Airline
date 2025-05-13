import { ref, onMounted } from "vue";
import { makeRequest } from "./functions/makeRequest";
import { useUsers } from "../modules/auth/useUsers"; // for token
import { useAirports } from "../modules/useAirports";

export const useCheckIn = () => {
  const { airportNameMap, fetchAirports } = useAirports(); // Using airport name map
  onMounted(() => {
    fetchAirports();
  });

  const loading = ref(false);
  const error = ref<string | null>(null);
  const success = ref<boolean>(false);
  const generatedTickets = ref<string[]>([]);

  const { getTokenAndUserId } = useUsers();

  const checkIn = async (
    ticketId: string,
    checkInData: {
      passportNumber: string;
      dateOfBirth: string;
      nationality: string;
      expirationDate: string;
    }
  ) => {
    loading.value = true;
    error.value = null;
    success.value = false;

    try {
      const token = getTokenAndUserId().token;
      if (!token) throw new Error("User not logged in");

      await makeRequest(
        `/checkin/${ticketId}`,
        "POST",
        checkInData,
        true // token will be included
      );

      success.value = true;
    } catch (err: any) {
      error.value = err.message || "Check-in failed";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Function to generate ticket HTML data and return ticket object for backend
  const generateTicketData = (
    ticket: any,
    passengerData: any,
    qrDataUrl: string,
    flight: any
  ) => {
    const airportMap = airportNameMap.value;

    // Ensure the departure and arrival airport IDs are IATA codes.
    const departureIATA =
      flight.route.departureAirportCode ||
      flight.route.departureAirport_id ||
      "???";
    const arrivalIATA =
      flight.route.arrivalAirportCode ||
      flight.route.arrivalAirport_id ||
      "???";

    // Lookup airport names using the airportMap (using IATA codes).
    const departureAirportName = airportMap[departureIATA] || "Unknown";
    const arrivalAirportName = airportMap[arrivalIATA] || "Unknown";

    const departureDate = new Date(ticket.departureDate).toLocaleDateString();

    const ticketData = {
      departureDate,
      departureAirportName,
      arrivalAirportName,
      departureIATA,
      arrivalIATA,
      firstName: ticket.firstName,
      lastName: ticket.lastName,
      seatNumber: ticket.seatNumber || "N/A",
      flightNumber: flight.flightNumber,
      flightStatus: flight.status,
      departureTime: flight.departureTime,
      qrDataUrl,
    };

    return ticketData; // Returns the ticket data object for saving to the backend
  };

  // Save ticket to the backend
  const saveTicket = async (
    ticketData: any,
    expirationDate: string,
    ticketId: string
  ) => {
    const { getTokenAndUserId } = useUsers();
    const userId = getTokenAndUserId().userId;

    const newTicket = {
      ticketId,
      ticketData,
      expirationDate,
      userId, // Add this
    };

    try {
      // Send the ticket to the backend to update the ticket information
      await makeRequest(
        `/tickets/${ticketId}`, // Update ticket route
        "PUT",
        newTicket,
        true // Include token for authentication
      );
      console.log("Ticket updated successfully:", newTicket);
    } catch (error) {
      console.error("Failed to update ticket:", error);
    }
  };

  // Fetch saved tickets from the backend
  const fetchSavedTickets = async (userId: string) => {
    try {
      const data = await makeRequest(
        `/tickets/${userId}`,
        "GET",
        undefined,
        true
      );
      console.log("✅ Tickets fetched correctly:", data); // This should be the array
      return data; // ✅ Return data directly, not data.data
    } catch (err) {
      console.error("❌ Error fetching saved tickets:", err);
      return [];
    }
  };

  // Generate a unique ticket ID
  const generateUniqueTicketId = () => {
    return `ticket-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };

  // Download ticket HTML files
  const downloadTickets = (generatedTickets: string[]) => {
    generatedTickets.forEach((ticketHtml, index) => {
      const blob = new Blob([ticketHtml], { type: "text/html" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `ticket_${index + 1}.html`;
      link.click();
    });
  };

  return {
    checkIn,
    generateTicketData,
    saveTicket,
    downloadTickets,
    fetchSavedTickets,
    generateUniqueTicketId,
    loading,
    error,
    success,
    generatedTickets,
  };
};
