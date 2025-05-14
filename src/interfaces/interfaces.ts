export interface Airport {
  _id: string;
  name: string;
  airportCode: string;
  cityName: string;
  countryCode: string;
}
export interface flightRoute {
  _id: string;
  departureAirport_id: string;
  arrivalAirport_id: string;
  duration: string;
}

export type NewFlightRoute = Omit<flightRoute, "_id">;

export interface Flight {
  _id: string;
  flightNumber: string;
  departureDay: string;
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
  isReturnFlightRequired: boolean;
}

export type NewFlight = Omit<Flight, "_id" | "arrivalTime">;

export interface Seat {
  _id: string;
  seatNumber: string;
  status: string;
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
export interface Booking {
  _id?: string;
  user_id: string;
  user_email: string;
  totalPrice: number;
  bookingDate: string;
  numberOfTickets: number;
  bookingStatus: "Pending" | "Confirmed" | "Cancelled" | "Scheduled";
  tickets: Ticket[];
}
export interface Ticket {
  _id?: string;
  ticket_id?: string;
  firstName: string;
  lastName: string;
  ticketPrice: number;
  gender: string;
  seatNumber: string;
  flight_id: string;
  departureDate: string;
  isCheckedIn?: boolean;
  flightStatus?: string;
}

export interface AboutCompany {
  _id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
}
