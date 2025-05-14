import { ref, onMounted } from "vue";
import { makeRequest } from "./functions/makeRequest";
import { useUsers } from "../modules/auth/useUsers";
import { useAirports } from "../modules/useAirports";

export const useCheckIn = () => {
  const { airportNameMap, fetchAirports } = useAirports();
  const { getTokenAndUserId } = useUsers();

  onMounted(() => {
    fetchAirports();
  });

  const loading = ref(false);
  const error = ref<string | null>(null);
  const success = ref<boolean>(false);
  const generatedTickets = ref<string[]>([]);

  // Function to check in a passengers
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

      await makeRequest(`/checkin/${ticketId}`, "POST", checkInData, true);

      success.value = true;
    } catch (err: any) {
      error.value = err.message || "Check-in failed";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Function to generate ticket data
  const generateTicketData = (
    ticket: any,
    passengerData: any,
    qrDataUrl: string,
    flight: any
  ) => {
    const airportMap = airportNameMap.value;

    const departureIATA =
      flight.route.departureAirportCode ||
      flight.route.departureAirport_id ||
      "???";
    const arrivalIATA =
      flight.route.arrivalAirportCode ||
      flight.route.arrivalAirport_id ||
      "???";

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

    return ticketData;
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
      userId,
    };

    try {
      await makeRequest(`/tickets/${ticketId}`, "PUT", newTicket, true);
      // console.log("Ticket updated successfully:", newTicket);
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
      // console.log("Tickets fetched correctly:", data);
      return data;
    } catch (err) {
      // console.error("Error fetching saved tickets:", err);
      return [];
    }
  };

  // Generate a unique ticket ID
  const generateUniqueTicketId = () => {
    return `ticket-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };

  const getTicketId = (ticket: any) => {
    return ticket._id || `temp-${ticket.firstName}-${ticket.lastName}`;
  };

  const minExpirationDate = (ticket: any) => {
    const departureDate = new Date(ticket.departureDate);
    departureDate.setMonth(departureDate.getMonth() + 3);
    return departureDate.toISOString().split("T")[0];
  };
  const validateExpirationDate = (
    ticket: any,
    checkInData: Record<string, any>,
    errors: Record<string, any>,
    getTicketId: (ticket: any) => string
  ) => {
    const expirationDate = new Date(
      checkInData[getTicketId(ticket)].expirationDate
    );
    const departureDate = new Date(ticket.departureDate);
    if (expirationDate < departureDate) {
      errors[getTicketId(ticket)] = {
        ...errors[getTicketId(ticket)],
        expirationDate:
          "Expiration date must be at least 3 months after departure",
      };
    } else {
      errors[getTicketId(ticket)] = {
        ...errors[getTicketId(ticket)],
        expirationDate: undefined,
      };
    }
  };

  const validateBirthdate = (
    ticket: any,
    checkInData: Record<string, any>,
    errors: Record<string, any>,
    getTicketId: (ticket: any) => string
  ) => {
    const birthDate = new Date(checkInData[getTicketId(ticket)].dateOfBirth);
    if (birthDate > new Date()) {
      errors[getTicketId(ticket)] = {
        ...errors[getTicketId(ticket)],
        dateOfBirth: "Birthdate cannot be a future date",
      };
    } else {
      errors[getTicketId(ticket)] = {
        ...errors[getTicketId(ticket)],
        dateOfBirth: undefined,
      };
    }
  };

  const minBirthdate = "1900-01-01";

  return {
    checkIn,
    generateTicketData,
    saveTicket,
    fetchSavedTickets,
    generateUniqueTicketId,
    loading,
    error,
    success,
    generatedTickets,
    getTicketId,
    minBirthdate,
    minExpirationDate,
    validateExpirationDate,
    validateBirthdate,
  };
};
