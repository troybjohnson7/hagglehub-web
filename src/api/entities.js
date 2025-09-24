import { Local } from './local';
export const Vehicle = Local.table('vehicles');
export const Dealer = Local.table('dealers');
export const Deal = Local.table('deals');
export const Message = Local.table('messages');
export const MarketData = Local.table('market');
export const User = {
  async me(){ return Local.user || { id: null }; },
  async login(email, code){
    const gate = import.meta.env.VITE_DEV_ADMIN_CODE || "";
    if (gate && code !== gate) throw new Error("Invalid admin code");
    return Local.setUser({ id: "local-admin", email, name: "Haggle Admin", isAdmin: true });
  },
  async logout(){ return Local.logout(); }
};
