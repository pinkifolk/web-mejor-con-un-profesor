import { userActions } from "./adminUsers";
import { hourActions } from "./adminHours"; 
import { toursActions } from "./adminTours"; 
import { loginActions } from "./adminLogin";
import { bokingAction } from "./adminBoking";

export const server = {
  login : loginActions,
  tours: toursActions,
  hours: hourActions,
  users: userActions,
  boking: bokingAction

}