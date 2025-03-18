export interface Flight {
  flight_id: string;
  flightNumber: string;
  departureTime: Date;
  arrivalTime: Date;
  status: string;
  seats: Seat[];
  route: flightRoute;
  aircraft_id: string;
  totalSeats: number;
  seatMap: string[];
}

export interface Seat {
  seat_id: string;
  seatNumber: string;
  status: string;
}

export interface flightRoute {
  route_id: string;
  departureAirport_id: string;
  arrivalAirport_id: string;
  duration: string;
}

export type NewFlightRoute = Omit<flightRoute, "route_id">;

export interface Airport {
  _id: string;
  name: string;
  airportCode: string;
  cityName: string;
  countryCode: string;
}

export type User = {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  dateOfBirth: Date;
  isAdmin: boolean;
};
