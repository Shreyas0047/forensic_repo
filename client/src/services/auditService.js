import api from "./api";

export const auditApi = {
  async getEvidenceAudit(evidenceId) {
    const { data } = await api.get(`/audit/evidence/${evidenceId}`);
    return data.data;
  },
  async getCaseAudit(caseId) {
    const { data } = await api.get(`/audit/case/${caseId}`);
    return data.data;
  },
  async exportCase(caseId, format = "json") {
    const { data } = await api.get(`/audit/export/${caseId}?format=${format}`);
    return data.data;
  },
};
