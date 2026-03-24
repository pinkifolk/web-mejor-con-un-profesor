import { userActions } from "./adminUsers";
import { toursActions } from "./adminTours"; 
import { loginActions } from "./adminLogin";
import { bokingAction } from "./adminBoking";
import { LanguagesAction } from "./adminLanguages";

export const server = {
  login : loginActions,
  tours: toursActions,
  languages: LanguagesAction,
  users: userActions,
  boking: bokingAction

}