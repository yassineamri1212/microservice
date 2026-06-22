import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  PaymentRequest,
  PaymentConfirmation,
  PaymentReservation,
  PaymentStatus,
  PaymentHistory
} from './models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private readonly API_URL = 'https://stb-stages.com/payment-service/api/payments';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // 1. Health Check - Test if Payment Service is running
  healthCheck(): Observable<string> {
    return this.http.get(`${this.API_URL}/health`, {
      ...this.httpOptions,
      responseType: 'text'
    }).pipe(
      catchError(this.handleError<string>('healthCheck'))
    );
  }

  // 2. Process Payment/Withdraw - Main payment processing endpoint
  processPayment(request: PaymentRequest): Observable<PaymentConfirmation> {
    return this.http.post<PaymentConfirmation>(`${this.API_URL}/withdraw`, request, this.httpOptions).pipe(
      catchError(this.handleError<PaymentConfirmation>('processPayment'))
    );
  }

    // 3. Get Reservation - Get payment reservation by CIN and reference
  getReservation(request: PaymentRequest): Observable<PaymentReservation> {
    // Since the backend GET /reservation endpoint has issues with @RequestBody,
    // we'll get all reservations and filter by CIN and referenceCode
    return this.getAllReservations().pipe(
      map(reservations => {
        console.log('All reservations:', reservations);
        console.log('Searching for CIN:', request.cin, 'Reference:', request.referenceCode);
        
        const found = reservations.find(r => {
          const cinMatch = r.cin && r.cin.toString().toLowerCase() === request.cin.toLowerCase();
          const refMatch = r.referenceCode && r.referenceCode.toString().toLowerCase() === request.referenceCode.toLowerCase();
          
          console.log(`Checking reservation ID ${r.id}: CIN=${r.cin} (match: ${cinMatch}), Ref=${r.referenceCode} (match: ${refMatch})`);
          
          return cinMatch && refMatch;
        });
        
        if (!found) {
          console.error('No matching reservation found');
          throw new Error(`Reservation not found for CIN: ${request.cin} and Reference: ${request.referenceCode}`);
        }
        
        console.log('Found reservation:', found);
        return found;
      }),
      catchError(this.handleError<PaymentReservation>('getReservation'))
    );
  }

  // 4. Get All Reservations - NEW ENDPOINT
  getAllReservations(): Observable<PaymentReservation[]> {
    return this.http.get<PaymentReservation[]>(`${this.API_URL}/reservations`, this.httpOptions).pipe(
      catchError(this.handleError<PaymentReservation[]>('getAllReservations', []))
    );
  }

  // 5. Get Reservation by ID - NEW ENDPOINT
  getReservationById(reservationId: string): Observable<PaymentReservation> {
    return this.http.get<PaymentReservation>(`${this.API_URL}/reservations/${reservationId}`, this.httpOptions).pipe(
      catchError(this.handleError<PaymentReservation>('getReservationById'))
    );
  }

  // 6. Get Reservation by CIN and Reference - Alternative method with params
  getReservationByCinAndReference(cin: string, referenceCode: string): Observable<PaymentReservation> {
    const request: PaymentRequest = { cin, referenceCode };
    return this.getReservation(request);
  }

  // 7. Create Payment Request - Helper method to create payment request
  createPaymentRequest(cin: string, referenceCode: string, amount: number, reason?: string): PaymentRequest {
    return {
      cin,
      referenceCode,
      amount,
      reason: reason || `Payment for ${referenceCode}`,
      accountNumber: undefined
    };
  }

  // 6. Withdraw Cash - Simplified withdraw method
  withdrawCash(cin: string, referenceCode: string, amount: number): Observable<PaymentConfirmation> {
    const request = this.createPaymentRequest(cin, referenceCode, amount, 'Cash Withdrawal');
    return this.processPayment(request);
  }

  // 7. Validate Payment Request - Client-side validation
  validatePaymentRequest(request: PaymentRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.cin || request.cin.trim().length === 0) {
      errors.push('CIN is required');
    }

    if (!request.referenceCode || request.referenceCode.trim().length === 0) {
      errors.push('Reference code is required');
    }

    if (request.amount !== undefined && request.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 8. Check Payment Status - Helper method to check payment status
  checkPaymentStatus(transactionId: string): Observable<PaymentStatus> {
    // This would be implemented if your backend supports it
    return new Observable(observer => {
      observer.next({
        status: 'PENDING',
        message: 'Payment status check not implemented in backend'
      });
    });
  }

  // 9. Get Payment History - Helper method for payment history
  getPaymentHistory(cin: string): Observable<PaymentHistory> {
    // This would be implemented if your backend supports it
    return new Observable(observer => {
      observer.next({
        payments: [],
        totalAmount: 0,
        totalCount: 0
      });
    });
  }

  // 10. Cancel Payment - Helper method for payment cancellation
  cancelPayment(transactionId: string): Observable<PaymentConfirmation> {
    // This would be implemented if your backend supports it
    return new Observable(observer => {
      observer.error(new Error('Cancel payment not implemented in backend'));
    });
  }

  // 11. Format CIN - Helper method to format CIN
  formatCin(cin: string): string {
    return cin.replace(/\s/g, '').toUpperCase();
  }

  // 12. Format Reference Code - Helper method to format reference code
  formatReferenceCode(referenceCode: string): string {
    return referenceCode.replace(/\s/g, '').toUpperCase();
  }

  // 13. Create CNSS Payment Request - Specific for CNSS payments
  createCnssPaymentRequest(cin: string, amount: number): PaymentRequest {
    const referenceCode = `CNSS-${cin}-${Date.now()}`;
    return {
      cin: this.formatCin(cin),
      referenceCode,
      amount,
      reason: 'CNSS Social Security Payment',
      accountNumber: 'CNSS-TREASURY-001'
    };
  }

  // 14. Process CNSS Payment - Specific method for CNSS payments
  processCnssPayment(cin: string, amount: number): Observable<PaymentConfirmation> {
    const request = this.createCnssPaymentRequest(cin, amount);
    return this.processPayment(request);
  }

  // 15. Get Payment Summary - Helper method for payment summary
  getPaymentSummary(confirmation: PaymentConfirmation): string {
    return `Payment ${confirmation.status}: ${confirmation.amount} for ${confirmation.referenceCode}`;
  }

  // 16. Cancel Reservation - Cancel a reservation by ID
  cancelReservation(reservationId: string): Observable<PaymentReservation> {
    return this.http.put<PaymentReservation>(`${this.API_URL}/reservations/${reservationId}/cancel`, {}, this.httpOptions).pipe(
      catchError(this.handleError<PaymentReservation>('cancelReservation'))
    );
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
