

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