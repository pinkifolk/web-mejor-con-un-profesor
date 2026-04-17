export type Tour = {
  id: number;
  name_es: string;
  name_pt: string;
  name_en: string;
  name: string;
  date_booking: string;
  hours:string;
  description: string;
  img: string;
  slug: string;
  status: string;
  ticketid:string;
  email:string;
  last_name:string;
} & {
  [key in `name_${string}`]?: string;
};
export type TourDetail = {
  id: number;
  name_es: string;
  name_pt: string;
  name_en: string;
  description_es: string;
  description_pt: string;
  description_en: string;
  img: string;
  img_awarded: string;
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
} & {
  [key in `name_${string}`]?: string;
} & {
  [key in `description_${string}`]?: string;
};

export type InsertNewTour = {
  name: string;
  description: string;
  img: string;
  status: boolean;
};
export type TourAdmin = {
  id: number;
  name_es: string;
  description: string;
  img: string;
  status: boolean;
  total_bookings: number;
  itinerary: [string];
  hours: [string];
};
export type Hours = {
  name: string;
  code: string;
  icon_svg: string;
  type_schedule: string;
  date_start: string | null;
  date_end: string | null;
  configurations: string[];
  day_week: number[];
  hour: string;
  schedules: {
    id: number;
    type_schedule: string;
    date_start: string | null;
    date_end: string | null;
    configurations: string[];
    day_week: number[];
    hour: string;
    is_closed:boolean;
  }[];
};
export type Languages = {
  id: number;
  name: string;
  icon_svg: string;
  code: string;
  hour:string;
};
export type Availability = {
  total: string;
  disponible: string;
};
export type GetTodayTour = {
  id: number;
  name_es: string;
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
export type Schedule = {
  nombre: string;
  idioma: string;
  tipo_configuracion: string;
  meses: string[];
  rango: object;
  fechas_especificas: string[];
  dias_semana: string[];
  horas_salida: string[];
};

export type LanguageAccumulator = {
  es: number;
  pt: number;
  en: number;
  [key: string]: number;
};
export type TourFormData = {
  nombre: string;
  idioma: string;
  tipo_configuracion: string;
  meses: string[];
  rango: { inicio: string; fin: string };
  fechas_especificas: string[];
  dias_semana: string[];
  horas_salida: string[];
};
export type Booking = {
  id: number;
  img: string;
  name_es: string;
  date_booking: string;
  hour: string;
  name: string;
  booking: number;
  persons: number;
  max_people: number;
  identity: string;
  hour_id: string; 
  block:boolean;
};
export type Persons = {
  id: number;
  name: string;
  last_name: string;
  adult: string;
  child: string;
  phone: string;
  status: string;
};
