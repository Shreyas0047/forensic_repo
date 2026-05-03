import api from "./api";

export const caseApi = {
  async getDashboard(query = {}) {
    const params = new URLSearchParams(query);
    const endpoint = [...params.keys()].length ? `/cases?${params.toString()}` : "/cases";
    const { data } = await api.get(endpoint);
    return data.data;
  },
  async createCase(payload) {
    const { data } = await api.post("/cases", payload);
    return data.data;
  },
  async getCase(caseId) {
    const { data } = await api.get(`/cases/${caseId}`);
    return data.data;
  },
  async updateStatus(caseId, status) {
    const { data } = await api.patch(`/cases/${caseId}/status`, { status });
    return data.data;
  },
  async assign(caseId, assignedTo) {
    const { data } = await api.patch(`/cases/${caseId}/assign`, { assignedTo });
    return data.data;
  },
  async getTimeline(caseId) {
    const { data } = await api.get(`/intelligence/timeline/${caseId}`);
    return data.data;
  },
  async getSimilarCases(caseId) {
    const { data } = await api.get(`/intelligence/similar-cases/${caseId}`);
    return data.data;
  },
};
