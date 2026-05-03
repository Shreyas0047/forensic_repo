import api from "./api";

export const evidenceApi = {
  async listByCase(caseId) {
    const { data } = await api.get(`/evidence/case/${caseId}`);
    return data.data;
  },
  async getById(evidenceId) {
    const { data } = await api.get(`/evidence/${evidenceId}`);
    return data.data;
  },
  async verify(evidenceId) {
    const { data } = await api.post(`/evidence/${evidenceId}/verify`);
    return data.data;
  },
  async upload(formData) {
    const { data } = await api.post("/evidence/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },
};
