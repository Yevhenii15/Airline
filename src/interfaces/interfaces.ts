export interface Flight {
  _id: string;
  flightNumber: string;
  departureDay: string; // Added to match the request payload
  departureTime: string;
  arrivalTime: string;
  operatingPeriod: {
    startDate: string;
    endDate: string;
  };
  status: string;
  seats: Seat[];
  route: flightRoute;
  aircraft_id: string;
  totalSeats: number;
  seatMap: string[];
  basePrice: number;
  isReturnFlightRequired: boolean; // Added to match the request payload
}

export type NewFlight = Omit<Flight, "_id" | "arrivalTime">;

export interface Seat {
  _id: string;
  seatNumber: string;
  status: string;
}

export interface flightRoute {
  _id: string;
  departureAirport_id: string;
  arrivalAirport_id: string;
  duration: string;
}

export type NewFlightRoute = Omit<flightRoute, "_id">;

export interface Airport {
  _id: string;
  name: string;
  airportCode: string;
  cityName: string;
  countryCode: string;
}

export type User = {
  userId: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  dateOfBirth: Date;
  isAdmin: boolean;
};

export interface AboutCompany {
  _id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
}
export interface Ticket {
  ticket_id?: string;
  firstName: string;
  lastName: string;
  ticketPrice: number;
  gender: string;
  seatNumber: string;
  flight_id: string;
  departureDate: string;
}

export interface Booking {
  user_id: string;
  totalPrice: number;
  bookingDate: string; // ISO format: "2024-03-09T12:00:00Z"
  numberOfTickets: number;
  bookingStatus: "Pending" | "Confirmed" | "Cancelled";
  tickets: Ticket[];
}
