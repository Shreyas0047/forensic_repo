import api from "./api";

export const dashboardApi = {
  async getOverview() {
    const { data } = await api.get("/cases");
    return data.data;
  },
  async getAuditTrail(caseId) {
    const { data } = await api.get(`/audit/case/${caseId}`);
    return data.data;
  },
};
