import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// CNSS DTOs and Models
export interface PaymentRequestDTO {
  cin: string;
  email: string;
  phoneNumber: string;
  amount: number;
  reason: string;
}

export interface ReservationRecord {
  id?: number;
  cin: string;
  email?: string;
  phoneNumber?: string;
  amount: number;
  reason: string;
  referenceCode: string;
  status: 'RESERVED' | 'PAID' | 'CANCELLED' | 'CANCELED';
  createdDate?: string;
  expiredDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CnssService {

  private readonly API_URL = 'https://stb-stages.com/cnss-service/api/cnss';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // 1. Health Check - Test if CNSS Service is running
  healthCheck(): Observable<string> {
    return this.http.get(`${this.API_URL}/health`, {
      ...this.httpOptions,
      responseType: 'text'
    }).pipe(
      catchError(this.handleError<string>('healthCheck'))
    );
  }

  // 2. Test Endpoint - Test CNSS Service connectivity
  testEndpoint(): Observable<string> {
    return this.http.get(`${this.API_URL}/test`, {
      ...this.httpOptions,
      responseType: 'text'
    }).pipe(
      catchError(this.handleError<string>('testEndpoint'))
    );
  }

  // 3. Request Payment - Send payment request to CNSS service
  requestPayment(request: PaymentRequestDTO): Observable<ReservationRecord> {
    return this.http.post<ReservationRecord>(`${this.API_URL}/request-payment`, request, this.httpOptions).pipe(
      catchError(this.handleError<ReservationRecord>('requestPayment'))
    );
  }

  // 4. Get Reservation by CIN - Get reservation details by CIN
  getReservationByCin(cin: string): Observable<ReservationRecord> {
    return this.http.get<ReservationRecord>(`${this.API_URL}/reservations/${cin}`, this.httpOptions).pipe(
      catchError(this.handleError<ReservationRecord>('getReservationByCin'))
    );
  }

  // 5. Create Payment Request - Helper method to create payment request
  createPaymentRequest(cin: string, email: string, phoneNumber: string, amount: number, reason?: string): PaymentRequestDTO {
    return {
      cin: this.formatCin(cin),
      email,
      phoneNumber,
      amount,
      reason: reason || 'CNSS Social Security Payment'
    };
  }

  // 6. Validate Payment Request - Client-side validation
  validatePaymentRequest(request: PaymentRequestDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.cin || request.cin.trim().length === 0) {
      errors.push('CIN is required');
    } else if (request.cin.length !== 8) {
      errors.push('CIN must be 8 characters long');
    }

    if (!request.amount || request.amount <= 0) {
      errors.push('Amount must be greater than 0');
    } else if (request.amount > 10000) {
      errors.push('Amount cannot exceed 10,000 TND');
    }

    if (!request.reason || request.reason.trim().length === 0) {
      errors.push('Reason is required');
    }

    if (!request.email || request.email.trim().length === 0) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(request.email)) {
      errors.push('Please enter a valid email address');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Helper method to validate email format
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // 7. Format CIN - Helper method to format CIN
  formatCin(cin: string): string {
    return cin.replace(/\s/g, '').toUpperCase();
  }

  // 8. Calculate Fee - Calculate processing fee (example: 1% of amount)
  calculateFee(amount: number): number {
    const feeRate = 0.01; // 1%
    const minFee = 5; // Minimum 5 TND
    const maxFee = 50; // Maximum 50 TND
    
    const calculatedFee = amount * feeRate;
    return Math.max(minFee, Math.min(maxFee, calculatedFee));
  }

  // 9. Get Total Amount - Get amount including fees
  getTotalAmount(amount: number): number {
    return amount + this.calculateFee(amount);
  }

  // 10. Format Amount - Helper method to format amount with currency
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  }

  // 11. Get Status Display Text - Convert status to display text
  getStatusDisplayText(status: string): string {
    switch (status) {
      case 'RESERVED':
        return 'Réservé';
      case 'PAID':
        return 'Payé';
      case 'CANCELLED':
        return 'Annulé';
      default:
        return status;
    }
  }

  // 12. Get Status Color - Get color class for status
  getStatusColor(status: string): string {
    switch (status) {
      case 'RESERVED':
        return 'text-warning';
      case 'PAID':
        return 'text-success';
      case 'CANCELLED':
        return 'text-danger';
      default:
        return 'text-muted';
    }
  }

  // Error Handling
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);

      // Log error details
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        console.error('Client Error:', error.error.message);
      } else {
        // Server-side error
        console.error(`Server Error: ${error.status} - ${error.message}`);
        console.error('Error Body:', error.error);
      }

      // Return a safe result to keep the app running
      return throwError(() => new Error(`${operation} failed: ${error.message || error}`));
    };
  }

  // Utility method to set authorization header (if needed for JWT)
  setAuthorizationHeader(token: string): void {
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
  }

  // Clear authorization header
  clearAuthorizationHeader(): void {
    this.httpOptions.headers = this.httpOptions.headers.delete('Authorization');
  }

  // Set custom headers for specific requests
  setCustomHeaders(headers: { [key: string]: string }): void {
    Object.keys(headers).forEach(key => {
      this.httpOptions.headers = this.httpOptions.headers.set(key, headers[key]);
    });
  }
}
