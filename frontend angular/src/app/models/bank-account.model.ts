// Bank Account Models and DTOs
export interface BankAccount {
  id: number;
  accountNumber: string;
  accountName: string;
  accountType: string;
  balance: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBankAccountRequest {
  accountName: string;
  accountType: string;
  initialBalance?: number;
}

export interface UpdateBankAccountRequest {
  accountName?: string;
  accountType?: string;
  balance?: number;
  status?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: string;
}
