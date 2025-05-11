// composables/useCheckIn.ts
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

  const generateTicketHTML = (
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

    return `
  <div style="w-[60%] font-family: Arial, sans-serif; color: #e5e7eb; background-color: #27272a; padding: 20px; width: 100%; max-width: 600px; border: 1px solid #ff7f50; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #ff7f50; padding-bottom: 20px; padding-top: 20px;">
      <h1 style="margin: 0; font-size: 26px; color: #ff7f50; font-weight: bold;">FLYEAZY</h1>
      <div style="text-align: right; display: flex;">
        <div style="margin-right: 20px;">
          <div style="font-size: 14px; color: #ff7f50;">DATE</div>
          <div style="font-size: 18px;">${departureDate}</div>
        </div>
        <div>
          <div style="font-size: 14px; color: #ff7f50;">FLY OUT</div>
          <div style="font-size: 18px;">${flight.departureTime}</div>
        </div>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 20px;">
      <div style="text-align: center; width: 35%;">
        <div style="font-size: 18px;">${departureAirportName}</div>
        <div style="font-size: 40px; font-weight: bold; color: #ff7f50;">${departureIATA}</div>
      </div>
      <div style="font-size: 32px;">✈</div>
      <div style="text-align: center; width: 35%;">
        <div style="font-size: 18px;">${arrivalAirportName}</div>
        <div style="font-size: 40px; font-weight: bold; color: #ff7f50;">${arrivalIATA}</div>
      </div>
    </div>

    <div style="margin-top: 20px; padding-bottom: 20px; padding-top: 20px;">
      <div style="font-size: 22px; color: #ff7f50; font-weight: normal;">PASSENGER</div>
      <div style="font-size: 26px; font-weight: bold;">${ticket.firstName} ${
      ticket.lastName
    }</div>
      <div style="display: flex;   justify-content: space-between; gap: 10px; padding-bottom: 20px; padding-top: 20px;">
        <div>
          <div style="font-size: 14px; color: #ff7f50;">FLIGHT #</div>
          <div style="font-size: 18px;">${flight.flightNumber}</div>
        </div>
        <div>
          <div style="font-size: 14px; color: #ff7f50;">SEAT</div>
          <div style="font-size: 18px;">${ticket.seatNumber || "N/A"}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 14px; color: #ff7f50;">STATUS</div>
          <div style="font-size: 18px; font-weight: bold;">${
            flight.status
          }</div>
        </div>
      </div>
    </div>

    <div style="text-align: center; margin-top: 20px; margin-bottom: 20px;">
      <div style="background-color: #fff; display: inline-block; padding: 20px; width: 45%; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
        <img src="${qrDataUrl}" alt="QR Code" style="width: 80%; height: auto; margin: 0 auto; display: block;" />
      </div>
    </div>
  </div>
  `;
  };

  const downloadTickets = (generatedTickets: string[]) => {
    generatedTickets.forEach((ticketHtml, index) => {
      const blob = new Blob([ticketHtml], { type: "text/html" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `ticket_${index + 1}.html`;
      link.click();
    });
  };

  const saveTicket = (
    ticketHtml: string,
    expirationDate: string,
    passengerName: string
  ) => {
    const userId = localStorage.getItem("userId"); // Or from Pinia/auth module
    const existing = JSON.parse(localStorage.getItem("tickets") || "[]");
    const newTicket = {
      ticketId: generateUniqueTicketId(),
      ticketHtml,
      passengerName,
      expirationDate,
      userId, // Add this
    };
    localStorage.setItem("tickets", JSON.stringify([...existing, newTicket]));
  };

  // Function to generate a unique ticket ID (you can adjust this as needed)
  const generateUniqueTicketId = () => {
    return `ticket-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };

  return {
    checkIn,
    loading,
    error,
    success,
    generateTicketHTML,
    downloadTickets,
    saveTicket,
  };
};
