import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SignatureVerificationService, SignatureVerificationRequest, SignatureResponse, SignatureVerificationResponse, ApiResponse } from './signature-verification.service';

describe('SignatureVerificationService', () => {
  let service: SignatureVerificationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(SignatureVerificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create signature', () => {
    const mockRequest: SignatureVerificationRequest = {
      cin: '12345678',
      signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      reservationId: 'RES001',
      purpose: 'Test signature'
    };

    const mockResponse: ApiResponse<SignatureResponse> = {
      success: true,
      message: 'Signature created successfully',
      data: {
        id: 1,
        cin: '12345678',
        reservationId: 'RES001',
        signatureData: mockRequest.signatureData,
        verificationStatus: 'PENDING',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    service.createSignature(mockRequest).subscribe(response => {
      expect(response.success).toBe(true);
      expect(response.data?.cin).toBe('12345678');
    });

    const req = httpMock.expectOne(`${service['baseURL']}`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should get signatures by CIN', () => {
    const cin = '12345678';
    const mockResponse: ApiResponse<SignatureResponse[]> = {
      success: true,
      message: 'Signatures retrieved successfully',
      data: []
    };

    service.getSignaturesByCin(cin).subscribe(response => {
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
    });

    const req = httpMock.expectOne(`${service['baseURL']}/cin/${cin}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should verify signature', () => {
    const mockRequest: SignatureVerificationRequest = {
      cin: '12345678',
      signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
    };

    const mockResponse: ApiResponse<SignatureVerificationResponse> = {
      success: true,
      message: 'Signature verified successfully',
      data: {
        verified: true,
        similarityScore: 0.95,
        verificationStatus: 'VERIFIED',
        matchedSignatureId: 1,
        message: 'Signature matches with high confidence',
        timestamp: new Date().toISOString()
      }
    };

    service.verifySignature(mockRequest).subscribe(response => {
      expect(response.success).toBe(true);
      expect(response.data?.verified).toBe(true);
      expect(response.data?.similarityScore).toBe(0.95);
    });

    const req = httpMock.expectOne(`${service['baseURL']}/verify`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should validate signature data', () => {
    const validSignature = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    const invalidSignature = 'invalid-signature-data';

    expect(service.validateSignatureData(validSignature)).toBe(true);
    expect(service.validateSignatureData(invalidSignature)).toBe(false);
  });

  it('should extract signature info', () => {
    const signatureData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    const info = service.getSignatureInfo(signatureData);

    expect(info).toBeTruthy();
    expect(info?.type).toBe('png');
    expect(typeof info?.size).toBe('number');
  });

  it('should convert file to base64', async () => {
    const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
    
    // Mock FileReader
    const originalFileReader = window.FileReader;
    const mockFileReader = {
      readAsDataURL: jasmine.createSpy('readAsDataURL'),
      result: 'data:image/png;base64,dGVzdA==',
      onload: null as any,
      onerror: null as any
    };

    spyOn(window, 'FileReader' as any).and.returnValue(mockFileReader);

    const promise = service.fileToBase64(mockFile);
    
    // Simulate successful read
    mockFileReader.onload();
    
    const result = await promise;
    expect(result).toBe('data:image/png;base64,dGVzdA==');
  });
});