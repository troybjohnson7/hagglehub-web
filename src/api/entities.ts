import { localDB } from "./localAdapter";
export const Vehicle = localDB.Vehicle;
export const Dealer = localDB.Dealer;
export const Deal = localDB.Deal;
export const Message = localDB.Message;
export const MarketData = localDB.MarketData;
export const User = { async me(){return localDB.getUser();}, async login(email: string, code: string){return localDB.login(email, code);}, async logout(){return localDB.logout();} };
