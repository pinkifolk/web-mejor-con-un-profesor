import { userActions } from "@/actions/adminUsers";
import { toursActions } from "@/actions/adminTours";
import { loginActions } from "@/actions/adminLogin";
import { bookingAction } from "@/actions/adminBooking";
import { LanguagesAction } from "@/actions/adminLanguages";
import { bookingActions } from "@/actions/Boking";

export const server = {
  login: loginActions,
  tours: toursActions,
  languages: LanguagesAction,
  users: userActions,
  booking: bookingAction,
  bookingClient: bookingActions,
};
