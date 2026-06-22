import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BankAccount, CreateBankAccountRequest, UpdateBankAccountRequest } from './models/bank-account.model';

@Injectable({
  providedIn: 'root'
})
export class BankacountService {
  
  private readonly API_URL = 'https://stb-stages.com/bank-accounts-service/api/accounts';
  
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // 1. Health Check - Test if Bank Account Service is running
  healthCheck(): Observable<string> {
    return this.http.get(`${this.API_URL}/health`, { 
      ...this.httpOptions, 
      responseType: 'text' 
    }).pipe(
      catchError(this.handleError<string>('healthCheck'))
    );
  }

  // 2. Get CNSS Balance - Get current CNSS treasury balance
  getCnssBalance(): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/cnss/balance`, this.httpOptions).pipe(
      catchError(this.handleError<number>('getCnssBalance', 0))
    );
  }

  // 3. Create Bank Account - Add new bank account
  createBankAccount(request: CreateBankAccountRequest): Observable<BankAccount> {
    return this.http.post<BankAccount>(this.API_URL, request, this.httpOptions).pipe(
      catchError(this.handleError<BankAccount>('createBankAccount'))
    );
  }

  // 4. Get All Bank Accounts - Retrieve all bank accounts
  getAllBankAccounts(): Observable<BankAccount[]> {
    return this.http.get<BankAccount[]>(this.API_URL, this.httpOptions).pipe(
      catchError(this.handleError<BankAccount[]>('getAllBankAccounts', []))
    );
  }

  // 5. Get Bank Account by ID - Retrieve specific bank account
  getBankAccountById(id: number): Observable<BankAccount> {
    return this.http.get<BankAccount>(`${this.API_URL}/${id}`, this.httpOptions).pipe(
      catchError(this.handleError<BankAccount>('getBankAccountById'))
    );
  }

  // 6. Update Bank Account - Update existing bank account
  updateBankAccount(id: number, request: UpdateBankAccountRequest): Observable<BankAccount> {
    return this.http.put<BankAccount>(`${this.API_URL}/${id}`, request, this.httpOptions).pipe(
      catchError(this.handleError<BankAccount>('updateBankAccount'))
    );
  }

  // 7. Delete Bank Account - Remove bank account
  deleteBankAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`, this.httpOptions).pipe(
      catchError(this.handleError<void>('deleteBankAccount'))
    );
  }

  // 8. Get CNSS Accounts - Retrieve all CNSS type accounts
  getCnssAccounts(): Observable<BankAccount[]> {
    return this.http.get<BankAccount[]>(`${this.API_URL}/cnss`, this.httpOptions).pipe(
      catchError(this.handleError<BankAccount[]>('getCnssAccounts', []))
    );
  }

  // 9. Get Account by Account Number - Helper method
  getAccountByNumber(accountNumber: string): Observable<BankAccount | null> {
    return this.getAllBankAccounts().pipe(
      map(accounts => accounts.find(account => account.accountNumber === accountNumber) || null),
      catchError(this.handleError<BankAccount | null>('getAccountByNumber', null))
    );
  }

  // 10. Get Accounts by Type - Filter accounts by type
  getAccountsByType(accountType: string): Observable<BankAccount[]> {
    return this.getAllBankAccounts().pipe(
      map(accounts => accounts.filter(account => account.accountType === accountType)),
      catchError(this.handleError<BankAccount[]>('getAccountsByType', []))
    );
  }

  // 11. Get Active Accounts - Filter only active accounts
  getActiveAccounts(): Observable<BankAccount[]> {
    return this.getAllBankAccounts().pipe(
      map(accounts => accounts.filter(account => account.status === 'ACTIVE')),
      catchError(this.handleError<BankAccount[]>('getActiveAccounts', []))
    );
  }

  // 12. Update Account Balance - Specific method for balance updates
  updateAccountBalance(id: number, newBalance: number): Observable<BankAccount> {
    const request: UpdateBankAccountRequest = { balance: newBalance };
    return this.updateBankAccount(id, request);
  }

  // 13. Activate Account - Change account status to ACTIVE
  activateAccount(id: number): Observable<BankAccount> {
    const request: UpdateBankAccountRequest = { status: 'ACTIVE' };
    return this.updateBankAccount(id, request);
  }

  // 14. Deactivate Account - Change account status to INACTIVE
  deactivateAccount(id: number): Observable<BankAccount> {
    const request: UpdateBankAccountRequest = { status: 'INACTIVE' };
    return this.updateBankAccount(id, request);
  }

  // 15. Check Account Exists - Verify if account exists
  checkAccountExists(id: number): Observable<boolean> {
    return this.getBankAccountById(id).pipe(
      map(() => true),
      catchError(() => [false])
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
}
