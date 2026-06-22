// Enums for Signature Verification System
export enum SignatureVerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export enum SignatureType {
  PNG = 'PNG',
  JPG = 'JPG',
  JPEG = 'JPEG',
  SVG = 'SVG'
}

export enum SignaturePurpose {
  RESERVATION_VERIFICATION = 'RESERVATION_VERIFICATION',
  DOCUMENT_SIGNING = 'DOCUMENT_SIGNING',
  IDENTITY_VERIFICATION = 'IDENTITY_VERIFICATION',
  CUSTOM = 'CUSTOM'
}

// Interfaces for Signature Verification System
export interface SignatureVerificationRequest {
  cin: string;
  signatureData: string; // Base64 encoded signature
  reservationId?: string;
  purpose?: string;
  signatureType?: string;
}

export interface SignatureCreateRequest extends SignatureVerificationRequest {
  width?: number;
  height?: number;
  fileSize?: number;
  notes?: string;
}

export interface SignatureResponse {
  id: number;
  cin: string;
  reservationId?: string;
  signatureData: string;
  signatureType?: string;
  purpose?: string;
  verificationStatus: SignatureVerificationStatus;
  verificationScore?: number;
  verifiedAgainstSignatureId?: number;
  width?: number;
  height?: number;
  fileSize?: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  signatureHash?: string;
}

export interface SignatureVerificationResponse {
  match: boolean;
  similarityScore: number;
  status: string;
  signatureId?: number;
  verifiedAgainstSignatureId?: number;
  message: string;
  verificationDetails?: string;
  // Legacy fields for backward compatibility
  verified?: boolean;
  verificationStatus?: SignatureVerificationStatus;
  matchedSignatureId?: number;
  timestamp?: string;
}

export interface SignatureComparisonRequest {
  signature1Data: string;
  signature2Data: string;
  description?: string;
}

export interface SignatureComparisonResponse {
  similarityScore: number;
  isMatch: boolean;
  threshold: number;
  message: string;
  comparisonDetails?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface SignatureListResponse {
  signatures: SignatureResponse[];
  totalCount: number;
  page?: number;
  pageSize?: number;
}

export interface SignatureValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SignatureMetadata {
  type: string;
  size: number;
  width?: number;
  height?: number;
  format: string;
  quality?: number;
}

// Utility classes
export class SignatureValidator {
  static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  static readonly ALLOWED_FORMATS = ['png', 'jpg', 'jpeg', 'svg'];
  static readonly MIN_WIDTH = 100;
  static readonly MIN_HEIGHT = 50;
  static readonly MAX_WIDTH = 2000;
  static readonly MAX_HEIGHT = 1000;

  static validate(request: SignatureVerificationRequest): SignatureValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate CIN
    if (!request.cin || request.cin.trim().length === 0) {
      errors.push('CIN is required');
    } else if (request.cin.length < 8) {
      warnings.push('CIN seems to be shorter than expected');
    }

    // Validate signature data
    if (!request.signatureData || request.signatureData.trim().length === 0) {
      errors.push('Signature data is required');
    } else if (!this.isValidBase64Image(request.signatureData)) {
      errors.push('Signature data must be a valid base64 image');
    }

    // Validate signature type
    if (request.signatureType) {
      const type = request.signatureType.toLowerCase();
      if (!this.ALLOWED_FORMATS.includes(type)) {
        errors.push(`Signature type '${request.signatureType}' is not supported`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static isValidBase64Image(dataUrl: string): boolean {
    const pattern = /^data:image\/(png|jpg|jpeg|svg\+xml);base64,/;
    return pattern.test(dataUrl);
  }

  static extractMetadata(dataUrl: string): SignatureMetadata | null {
    try {
      if (!this.isValidBase64Image(dataUrl)) {
        return null;
      }

      // Extract MIME type
      const typeMatch = dataUrl.match(/^data:image\/([^;]+);base64,/);
      const format = typeMatch ? typeMatch[1] : 'unknown';

      // Calculate size
      const base64Data = dataUrl.split(',')[1];
      const size = Math.round((base64Data.length * 3) / 4);

      return {
        type: 'image',
        format,
        size
      };
    } catch (error) {
      console.error('Error extracting signature metadata:', error);
      return null;
    }
  }
}

// Helper functions
export class SignatureUtils {
  
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static getVerificationStatusColor(status: SignatureVerificationStatus): string {
    switch (status) {
      case SignatureVerificationStatus.VERIFIED:
        return 'green';
      case SignatureVerificationStatus.REJECTED:
        return 'red';
      case SignatureVerificationStatus.PENDING:
      default:
        return 'orange';
    }
  }

  static getVerificationStatusIcon(status: SignatureVerificationStatus): string {
    switch (status) {
      case SignatureVerificationStatus.VERIFIED:
        return 'check_circle';
      case SignatureVerificationStatus.REJECTED:
        return 'cancel';
      case SignatureVerificationStatus.PENDING:
      default:
        return 'schedule';
    }
  }

  static generateSignatureId(): string {
    return 'sig_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  static isHighConfidenceScore(score: number): boolean {
    return score >= 0.85;
  }

  static isMediumConfidenceScore(score: number): boolean {
    return score >= 0.70 && score < 0.85;
  }

  static isLowConfidenceScore(score: number): boolean {
    return score < 0.70;
  }

  static getScoreDescription(score: number): string {
    if (this.isHighConfidenceScore(score)) {
      return 'High confidence match';
    } else if (this.isMediumConfidenceScore(score)) {
      return 'Medium confidence match';
    } else {
      return 'Low confidence match';
    }
  }
}