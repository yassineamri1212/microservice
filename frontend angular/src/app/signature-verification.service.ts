import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { 
  SignatureVerificationRequest, 
  SignatureCreateRequest,
  SignatureResponse, 
  SignatureVerificationResponse,
  SignatureComparisonRequest,
  SignatureComparisonResponse,
  ApiResponse,
  SignatureListResponse,
  SignatureValidator,
  SignatureMetadata,
  SignatureUtils
} from './models/signature-verification.models';

@Injectable({
  providedIn: 'root'
})
export class SignatureVerificationService {

  private baseURL = 'https://stb-stages.com/signature-service/api/signatures';

  constructor(private httpClient: HttpClient) { }

  private getHttpHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  /**
   * Create a new signature with extended options
   */
  createSignatureExtended(request: SignatureCreateRequest): Observable<SignatureResponse> {
    // Validate request before sending
    const validation = SignatureValidator.validate(request);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    return this.httpClient.post<SignatureResponse>(
      this.baseURL, 
      request, 
      { headers: this.getHttpHeaders() }
    );
  }

  /**
   * Get all signatures
   */
  getAllSignatures(): Observable<SignatureResponse[]> {
    return this.httpClient.get<SignatureResponse[]>(this.baseURL);
  }

  /**
   * Get signature by ID
   */
  getSignatureById(id: number): Observable<SignatureResponse> {
    return this.httpClient.get<SignatureResponse>(`${this.baseURL}/${id}`);
  }

  /**
   * Get signatures by CIN
   */
  getSignaturesByCin(cin: string): Observable<SignatureResponse[]> {
    return this.httpClient.get<SignatureResponse[]>(`${this.baseURL}/cin/${cin}`);
  }

  /**
   * Get signatures by reservation ID
   */
  getSignaturesByReservationId(reservationId: string): Observable<SignatureResponse[]> {
    return this.httpClient.get<SignatureResponse[]>(`${this.baseURL}/reservation/${reservationId}`);
  }

  /**
   * Get latest signature by CIN
   */
  getLatestSignatureByCin(cin: string): Observable<SignatureResponse> {
    return this.httpClient.get<SignatureResponse>(`${this.baseURL}/cin/${cin}/latest`);
  }

  /**
   * Verify signature against existing signatures
   */
  verifySignature(request: SignatureVerificationRequest): Observable<SignatureVerificationResponse> {
    return this.httpClient.post<SignatureVerificationResponse>(
      `${this.baseURL}/verify`, 
      request, 
      { headers: this.getHttpHeaders() }
    );
  }

  /**
   * Update signature
   */
  updateSignature(id: number, request: SignatureVerificationRequest): Observable<SignatureResponse> {
    return this.httpClient.put<SignatureResponse>(
      `${this.baseURL}/${id}`, 
      request, 
      { headers: this.getHttpHeaders() }
    );
  }

  /**
   * Delete signature
   */
  deleteSignature(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseURL}/${id}`);
  }

  /**
   * Check service health
   */
  checkHealth(): Observable<any> {
    return this.httpClient.get(`https://stb-stages.com/signature-service/actuator/health`);
  }

  /**
   * Utility method to convert File to Base64
   */
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject('Failed to convert file to base64');
        }
      };
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Utility method to validate signature data using validator
   */
  validateSignatureData(signatureData: string): boolean {
    return SignatureValidator.isValidBase64Image(signatureData);
  }

  /**
   * Utility method to extract file info from signature data using validator
   */
  getSignatureInfo(signatureData: string): SignatureMetadata | null {
    return SignatureValidator.extractMetadata(signatureData);
  }

  /**
   * Validate a complete signature request
   */
  validateSignatureRequest(request: SignatureVerificationRequest): { isValid: boolean; errors: string[]; warnings: string[] } {
    return SignatureValidator.validate(request);
  }

  /**
   * Format file size using utility
   */
  formatFileSize(bytes: number): string {
    return SignatureUtils.formatFileSize(bytes);
  }

  /**
   * Get verification status styling information
   */
  getStatusInfo(status: string): { color: string; icon: string; description: string } {
    return {
      color: SignatureUtils.getVerificationStatusColor(status as any),
      icon: SignatureUtils.getVerificationStatusIcon(status as any),
      description: status
    };
  }

  /**
   * Get score confidence information
   */
  getScoreInfo(score: number): { isHigh: boolean; isMedium: boolean; isLow: boolean; description: string } {
    return {
      isHigh: SignatureUtils.isHighConfidenceScore(score),
      isMedium: SignatureUtils.isMediumConfidenceScore(score),
      isLow: SignatureUtils.isLowConfidenceScore(score),
      description: SignatureUtils.getScoreDescription(score)
    };
  }

  /**
   * NEW: Get signature image data by ID
   * This method exposes the actual signature image data for display purposes
   */
  getSignatureImageById(id: number): Observable<string | null> {
    console.log(`[SignatureService] Getting signature image for ID: ${id}`);
    return this.httpClient.get(`${this.baseURL}/${id}/image`, { responseType: 'text' })
      .pipe(
        map(response => response || null),
        tap(response => console.log(`[SignatureService] Retrieved signature image for ID ${id}, size: ${response?.length} chars`)),
        catchError(error => {
          console.error(`[SignatureService] Error getting signature image for ID ${id}:`, error);
          return of(null);
        })
      );
  }

  /**
   * NEW: Get latest signature image data by CIN
   * This method exposes the actual signature image data for display purposes
   */
  getLatestSignatureImageByCin(cin: string): Observable<string | null> {
    console.log(`[SignatureService] Getting latest signature image for CIN: ${cin}`);
    return this.httpClient.get(`${this.baseURL}/cin/${cin}/image`, { responseType: 'text' })
      .pipe(
        map(response => response || null),
        tap(response => console.log(`[SignatureService] Retrieved latest signature image for CIN ${cin}, size: ${response?.length} chars`)),
        catchError(error => {
          console.error(`[SignatureService] Error getting signature image for CIN ${cin}:`, error);
          return of(null);
        })
      );
  }

  /**
   * Compare two signature images and return similarity score
   */
  compareSignatures(request: SignatureComparisonRequest): Observable<SignatureComparisonResponse> {
    console.log(`[SignatureService] Comparing two signatures`);
    return this.httpClient.post<SignatureComparisonResponse>(
      `${this.baseURL}/compare`, 
      request, 
      { headers: this.getHttpHeaders() }
    ).pipe(
      tap(response => console.log(`[SignatureService] Signature comparison result: ${response.similarityScore * 100}% similarity`)),
      catchError(error => {
        console.error(`[SignatureService] Error comparing signatures:`, error);
        throw error;
      })
    );
  }

  /**
   * Compare two signature images with just the base64 data
   */
  compareSignatureImages(signature1Data: string, signature2Data: string, description?: string): Observable<SignatureComparisonResponse> {
    const request: SignatureComparisonRequest = {
      signature1Data: signature1Data.replace(/^data:image\/[a-z]+;base64,/, ''),
      signature2Data: signature2Data.replace(/^data:image\/[a-z]+;base64,/, ''),
      description: description
    };
    
    return this.compareSignatures(request);
  }
}