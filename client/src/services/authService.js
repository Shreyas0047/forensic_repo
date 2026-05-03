import api from "./api";

export const authApi = {
  async login(payload) {
    const { data } = await api.post("/auth/login", payload);
    return data.data;
  },
  async register(payload) {
    const { data } = await api.post("/auth/register", payload);
    return data.data;
  },
};
