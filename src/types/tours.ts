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
  name: string;
  img: string;
  personas: number;
  ninos: number;
  hours: string;

};
export type GetToursNext ={
    fecha_formateada: string;
    personas: string;
    ninos: string;
    hours: string;
}
