/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

export interface DemoResponse {
  message: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  admin: {
    id: string;
    email: string;
    name: string;
  };
}

export interface PaymentSubmitRequest {
  flatNumber: string;
  residentName: string;
  residentType: "owner" | "tenant";
  paymentPurpose: string;
  amountPaid: number;
  transactionId: string;
  upiId?: string;
  bankDetails?: string;
  paymentDate: string;
  notes?: string;
}

export interface DashboardResponse {
  totalCollected: number;
  totalPending: number;
  flatsPaid: number;
  flatsNotPaid: number;
  month: string;
}
