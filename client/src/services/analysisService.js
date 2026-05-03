import api from "./api";

export const analysisApi = {
  async analyze(evidenceId) {
    const { data } = await api.post(`/analysis/${evidenceId}`);
    return data.data;
  },
  async getReport(evidenceId) {
    const { data } = await api.get(`/analysis/${evidenceId}`);
    return data.data;
  },
  async getCaseReports(caseId) {
    const { data } = await api.get(`/analysis/case/${caseId}`);
    return data.data;
  },
  async storeBlockchain(evidenceId) {
    const { data } = await api.post(`/blockchain/store/${evidenceId}`);
    return data.data;
  },
  async verifyBlockchain(evidenceId) {
    const { data } = await api.get(`/blockchain/verify/${evidenceId}`);
    return data.data;
  },
};
