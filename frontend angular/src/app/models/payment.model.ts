// Payment Models and DTOs
export interface PaymentRequest {
  cin: string;
  email?: string;
  phoneNumber?: string;
  referenceCode: string;
  amount?: number;
  reason?: string;
  accountNumber?: string;
}

export interface PaymentConfirmation {
  id: string;
  cin: string;
  email?: string;
  phoneNumber?: string;
  referenceCode: string;
  amount: number;
  status: string;
  message: string;
  transactionId: string;
  timestamp: Date;
  accountNumber: string;
  remainingBalance?: number;
}

export interface PaymentReservation {
  id: string;
  cin: string;
  email?: string;
  phoneNumber?: string;
  referenceCode: string;
  amount: number;
  status: string;
  createdDate: Date;
  expiredDate: Date;
  reason?: string;
  accountNumber?: string;
}

export interface PaymentStatus {
  status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
  message: string;
}

export interface PaymentHistory {
  payments: PaymentConfirmation[];
  totalAmount: number;
  totalCount: number;
}
