import api from "./api";

export const alertApi = {
  async getAlerts() {
    const { data } = await api.get("/darkweb/alerts");
    return data.data;
  },
  async analyzeDarkweb() {
    const { data } = await api.get("/darkweb/analyze");
    return data.data;
  },
};
