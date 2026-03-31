import { projectId, publicAnonKey } from './supabase/info';
import { authService } from './auth';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-324f6e20`;

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await authService.getAccessToken();
  
  if (!token) {
    console.log('No authentication token available for:', url);
    const error: any = new Error('No authentication token');
    error.status = 401;
    throw error;
  }
  
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || publicAnonKey}`,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    const err: any = new Error(error.error || `HTTP ${response.status}`);
    err.status = response.status;
    throw err;
  }
  
  return response.json();
}

export const api = {
  // Criteria
  async getCriteria() {
    return fetchWithAuth('/criteria');
  },

  async addCriterion(text: string) {
    return fetchWithAuth('/criteria', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  async updateCriterion(id: string, updates: any) {
    return fetchWithAuth(`/criteria/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async reorderCriteria(criteriaIds: string[]) {
    return fetchWithAuth('/criteria/reorder', {
      method: 'POST',
      body: JSON.stringify({ criteriaIds }),
    });
  },

  async deleteCriterion(id: string) {
    return fetchWithAuth(`/criteria/${id}`, {
      method: 'DELETE',
    });
  },

  // Applications
  async submitApplication(data: any) {
    return fetchWithAuth('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMyApplications() {
    return fetchWithAuth('/applications/my');
  },

  async getAllApplications() {
    return fetchWithAuth('/applications');
  },

  async updateApplication(id: string, updates: any) {
    return fetchWithAuth(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async assignApplication(id: string, analystId: string) {
    return fetchWithAuth(`/applications/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ analystId }),
    });
  },

  // File upload
  async uploadFile(file: File) {
    const token = await authService.getAccessToken();
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token || publicAnonKey}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }
    
    return response.json();
  },

  // Users
  async getUsers() {
    return fetchWithAuth('/users');
  },

  // Evaluations
  async saveEvaluation(applicationId: string, data: any) {
    return fetchWithAuth('/evaluations', {
      method: 'POST',
      body: JSON.stringify({ applicationId, ...data }),
    });
  },

  async getEvaluation(applicationId: string) {
    return fetchWithAuth(`/evaluations/${applicationId}`);
  },

  async getAllEvaluations(applicationId: string) {
    return fetchWithAuth(`/evaluations/${applicationId}/all`);
  },

  async completeEvaluation(applicationId: string, data: any) {
    return fetchWithAuth(`/evaluations/${applicationId}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Clarification Requests
  async requestClarification(applicationId: string, message: string, criteriaNeeded: string[]) {
    return fetchWithAuth(`/applications/${applicationId}/request-clarification`, {
      method: 'POST',
      body: JSON.stringify({ message, criteriaNeeded }),
    });
  },

  async getClarifications(applicationId: string) {
    return fetchWithAuth(`/applications/${applicationId}/clarifications`);
  },

  async respondToClarification(clarificationId: string, response: string, updatedDocuments?: any[]) {
    return fetchWithAuth(`/clarifications/${clarificationId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ response, updatedDocuments }),
    });
  },

  async flagApplication(id: string, flagReason: string) {
    return fetchWithAuth(`/applications/${id}/flag`, {
      method: 'POST',
      body: JSON.stringify({ flagReason }),
    });
  },

  // CFO
  async cfoDecision(id: string, decision: string, notes: string) {
    return fetchWithAuth(`/cfo/applications/${id}/decision`, {
      method: 'POST',
      body: JSON.stringify({ decision, notes }),
    });
  },

  async cfoBatchApprove(applicationIds: string[], notes: string) {
    return fetchWithAuth('/cfo/batch-approve', {
      method: 'POST',
      body: JSON.stringify({ applicationIds, notes }),
    });
  },

  // Disbursements
  async recordDisbursement(data: any) {
    return fetchWithAuth('/disbursements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getDisbursement(applicationId: string) {
    return fetchWithAuth(`/disbursements/${applicationId}`);
  },

  async getAllDisbursements() {
    return fetchWithAuth('/disbursements');
  },

  // Finance Workflow (Two-Signature System)
  async getPendingInitiation() {
    return fetchWithAuth('/finance/pending-initiation');
  },

  async initiateDisbursement(applicationIds: string[], notes?: string) {
    return fetchWithAuth('/finance/initiate', {
      method: 'POST',
      body: JSON.stringify({ applicationIds, notes }),
    });
  },

  async getPendingApproval() {
    return fetchWithAuth('/finance/pending-approval');
  },

  async approveDisbursement(applicationId: string, notes?: string) {
    return fetchWithAuth('/finance/approve', {
      method: 'POST',
      body: JSON.stringify({ applicationId, notes }),
    });
  },

  async rejectDisbursement(applicationId: string, reason: string) {
    return fetchWithAuth('/finance/reject', {
      method: 'POST',
      body: JSON.stringify({ applicationId, reason }),
    });
  },

  async getPendingPayment() {
    return fetchWithAuth('/finance/pending-payment');
  },

  async processPayment(data: {
    applicationId: string;
    paymentStatus: string;
    referenceNumber?: string;
    bankTransactionId?: string;
    notes?: string;
  }) {
    return fetchWithAuth('/finance/process-payment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async uploadProofOfPayment(applicationId: string, proofOfPaymentUrl: string, transactionId?: string) {
    return fetchWithAuth('/finance/upload-proof', {
      method: 'POST',
      body: JSON.stringify({ applicationId, proofOfPaymentUrl, transactionId }),
    });
  },

  // Delivery Confirmation
  async getPendingDelivery() {
    return fetchWithAuth('/delivery/pending');
  },

  async confirmDelivery(data: {
    applicationId: string;
    handoverReceiptUrl: string;
    geotaggedPhotoUrl: string;
    deliveryNotes?: string;
  }) {
    return fetchWithAuth('/delivery/confirm', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Eligibility Checks
  async saveEligibilityCheck(applicationId: string, eligibilityData: any) {
    return fetchWithAuth(`/analyst/eligibility-check/${applicationId}`, {
      method: 'POST',
      body: JSON.stringify(eligibilityData),
    });
  },

  async getEligibilityCheck(applicationId: string) {
    return fetchWithAuth(`/analyst/eligibility-check/${applicationId}`);
  },
};