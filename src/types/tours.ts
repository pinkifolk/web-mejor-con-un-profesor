import type { a } from "node_modules/tailwindcss/dist/types-B254mqw1.d.mts";

export type Tour = {
  id: number;
  name: string;
  description: string;
  img: string;
  slug: string;
  status: boolean;
};
export type TourDetail = {
  id: number;
  name: string;
  description: string;
  img: string;
  slug: string;
  status: boolean;
  duration: string;
  max_people: number;
  itinerary: [string];
  rating: string;
  total_reviews: number;
  rating_counts: {
    rating: number;
    percentage: number;
  }[];
  comments: {
    name: string;
    comment: string;
    rating: number;
    created_at: string;
  }[];
};

export type InsertNewTour = {
  name: string;
  description: string;
  img: string;
  status: boolean;
};
export type TourAdmin = {
  id: number;
  name: string;
  description: string;
  img: string;
  status: boolean;
  total_bookings: number;
  itinerary: [string];
  hours: [string];
};
export type Hours = {
  id: number;
  hour: string;
};
export type Availability = {
  total: string;
  disponible: string;
};
export type GetTodayTour = {
  id: number;
  name: string;
  img: string;
  personas: number;
  ninos: number;
  hours: string;
  hourid: string;
  status: string;
};
export type GetToursNext = {
  fecha_formateada: string;
  name: string;
  personas: string;
  ninos: string;
  hour: string;
};
export type Users = {
  id: number;
  name: string;
  email: string;
  status: boolean;
};
export type DetailBokings = {
  name: string;
  email: string;
  adult: string;
  child: string;
  phone: string;
  total: number;
  hour: string;
};
