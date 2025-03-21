export interface Flight {
  _id: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  status: string;
  seats: Seat[];
  route: flightRoute;
  aircraft_id: string;
  totalSeats: number;
  seatMap: string[];
}

export type NewFlight = Omit<Flight, "_id">;

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
  _id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  dateOfBirth: string;
  isAdmin: boolean;
};


export interface AbooutCompany {
  _id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
}
