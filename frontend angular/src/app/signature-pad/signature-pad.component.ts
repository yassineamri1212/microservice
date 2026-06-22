import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SignatureVerificationService } from '../signature-verification.service';
import { 
  SignatureVerificationRequest, 
  SignatureCreateRequest,
  SignatureResponse, 
  SignatureVerificationResponse,
  SignatureVerificationStatus 
} from '../models/signature-verification.models';

@Component({
  selector: 'app-signature-pad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './signature-pad.component.html',
  styleUrls: ['./signature-pad.component.scss']
})
export class SignaturePadComponent implements AfterViewInit, OnInit {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;

  // Properties for reservation data
  reservationId: string = '';
  cin: string = '';
  
  // Signature verification properties
  isProcessing = false;
  hasExistingSignature = false;
  reservationHasSignature = false;
  existingSignature: SignatureResponse | null = null;
  verificationResult: SignatureVerificationResponse | null = null;
  showResults = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private signatureService: SignatureVerificationService
  ) {}

  ngOnInit(): void {
    // Get query parameters
    this.route.queryParams.subscribe(params => {
      this.reservationId = params['reservationId'] || '';
      this.cin = params['cin'] || '';
      console.log('Signature verification for:', { reservationId: this.reservationId, cin: this.cin });
      
      // Check if user has existing signature
      if (this.cin) {
        this.checkExistingSignature();
      }
    });
  }

  ngAfterViewInit(): void {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    
    // Set canvas size
    this.resizeCanvas();
    
    // Configure drawing style
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // Add event listeners
    this.setupEventListeners();
  }

  private resizeCanvas(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  private setupEventListeners(): void {
    // Mouse events
    this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
    this.canvas.addEventListener('mousemove', this.draw.bind(this));
    this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
    this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));

    // Touch events for mobile
    this.canvas.addEventListener('touchstart', this.handleTouch.bind(this));
    this.canvas.addEventListener('touchmove', this.handleTouch.bind(this));
    this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));
  }

  private getEventPos(event: MouseEvent | TouchEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    let x, y;

    if (event instanceof TouchEvent) {
      x = event.touches[0]?.clientX || event.changedTouches[0]?.clientX || 0;
      y = event.touches[0]?.clientY || event.changedTouches[0]?.clientY || 0;
    } else {
      x = event.clientX;
      y = event.clientY;
    }

    return {
      x: x - rect.left,
      y: y - rect.top
    };
  }

  private startDrawing(event: MouseEvent): void {
    this.isDrawing = true;
    const pos = this.getEventPos(event);
    this.lastX = pos.x;
    this.lastY = pos.y;
  }

  private draw(event: MouseEvent | TouchEvent): void {
    if (!this.isDrawing) return;

    event.preventDefault();
    const pos = this.getEventPos(event);

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();

    this.lastX = pos.x;
    this.lastY = pos.y;
  }

  private stopDrawing(): void {
    this.isDrawing = false;
  }

  private handleTouch(event: TouchEvent): void {
    event.preventDefault();
    
    if (event.type === 'touchstart') {
      this.isDrawing = true;
      const pos = this.getEventPos(event);
      this.lastX = pos.x;
      this.lastY = pos.y;
    } else if (event.type === 'touchmove') {
      this.draw(event);
    }
  }

  clearSignature(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.resetMessages();
  }

  saveSignature(): string {
    return this.canvas.toDataURL('image/png');
  }

  /**
   * Check the signature status for this reservation and user
   */
  private checkExistingSignature(): void {
    this.isProcessing = true;
    this.resetMessages();

    // Step 1: Check if RESERVATION already has a signature
    this.signatureService.getSignaturesByReservationId(this.reservationId).subscribe({
      next: (reservationSignatures) => {
        if (reservationSignatures && reservationSignatures.length > 0) {
          // Reservation already has a signature
          this.reservationHasSignature = true;
          this.errorMessage = 'This reservation already has a signature. You cannot sign again.';
          this.isProcessing = false;
          console.log('Reservation already has signature:', reservationSignatures);
          return;
        }

        // Step 2: Reservation is free - check if USER has any signatures
        console.log('Reservation is available for signing. Checking user signature history...');
        this.checkUserSignatureHistory();
      },
      error: (error) => {
        console.error('Error checking reservation signatures:', error);
        if (error.status === 404) {
          // No signatures for this reservation - good, continue to check user
          console.log('No existing signatures for reservation. Checking user signature history...');
          this.checkUserSignatureHistory();
        } else {
          this.errorMessage = 'Error checking reservation status. Please try again.';
          this.isProcessing = false;
        }
      }
    });
  }

  /**
   * Check if user has any existing signatures
   */
  private checkUserSignatureHistory(): void {
    // Get user's latest signature for reference display
    this.signatureService.getLatestSignatureByCin(this.cin).subscribe({
      next: (response) => {
        if (response && response.id) {
          this.hasExistingSignature = true;
          this.existingSignature = response;
          console.log('Found existing signature for user CIN:', this.cin, response);
          
          // Get the signature image data separately
          this.signatureService.getLatestSignatureImageByCin(this.cin).subscribe({
            next: (imageData) => {
              if (imageData) {
                console.log('Retrieved user signature image data for comparison display');
                const validatedData = this.validateSignatureData(imageData);
                if (validatedData) {
                  this.existingSignature!.signatureData = validatedData;
                  console.log('User has existing signature - will verify against it for this reservation');
                } else {
                  console.error('Failed to validate user signature image data');
                }
              }
              this.isProcessing = false;
            },
            error: (error) => {
              console.error('Error retrieving user signature image:', error);
              this.isProcessing = false;
            }
          });
        } else {
          // No existing signatures for this user
          this.hasExistingSignature = false;
          console.log('No existing signatures found for user CIN:', this.cin, '- first signature');
          this.isProcessing = false;
        }
      },
      error: (error) => {
        console.error('Error checking user signature history:', error);
        this.hasExistingSignature = false;
        this.isProcessing = false;
        // Don't show error message for 404 (no signature found)
        if (error.status !== 404) {
          this.errorMessage = 'Error checking user signature history. Please try again.';
        }
      }
    });
  }

  /**
   * Process the drawn signature - use unified verification endpoint
   */
  processSignature(): void {
    if (this.reservationHasSignature) {
      this.errorMessage = 'This reservation already has a signature. You cannot sign again.';
      return;
    }

    if (this.isCanvasEmpty()) {
      this.errorMessage = 'Please draw a signature first.';
      return;
    }

    const signatureData = this.saveSignature();
    this.verifySignature(signatureData);
  }

  /**
   * Unified signature verification that handles all business rules
   */
  private verifySignature(newSignatureData: string): void {
    this.isProcessing = true;
    this.resetMessages();

    // Remove data URL prefix if present
    const cleanSignatureData = newSignatureData.replace(/^data:image\/[a-z]+;base64,/, '');

    const verificationRequest: SignatureVerificationRequest = {
      cin: this.cin,
      signatureData: cleanSignatureData,
      reservationId: this.reservationId,
      purpose: 'SIGNATURE_VERIFICATION'
    };

    console.log('Sending verification request:', verificationRequest);

    this.signatureService.verifySignature(verificationRequest).subscribe({
      next: (response) => {
        console.log('Verification response:', response);
        
        if (response) {
          this.verificationResult = response;
          this.showResults = true;
          
          // Clear any previous messages since we're showing detailed results
          this.successMessage = '';
          this.errorMessage = '';
          
          // Handle different response scenarios
          if (response.match) {
            console.log(`Signature ${response.status}: ${(response.similarityScore * 100).toFixed(1)}% similarity`);
            
            // For successful verification, update local state
            this.hasExistingSignature = true;
            
            // Auto-redirect after successful verification
            setTimeout(() => {
              this.navigateToNextStep();
            }, 3000);
          } else {
            console.log(`Signature ${response.status}: ${response.message}`);
            
            // For rejected signatures, clear canvas to encourage re-signing
            if (response.status === 'REJECTED' && response.message.includes('does not match')) {
              setTimeout(() => {
                this.clearSignature();
              }, 3000);
            }
          }
        } else {
          console.error('Invalid verification response:', response);
          this.errorMessage = 'Signature verification failed. Please try again.';
          this.showResults = false;
        }
        this.isProcessing = false;
      },
      error: (error) => {
        console.error('Error verifying signature:', error);
        
        // Handle specific error scenarios
        if (error.status === 400 && error.error && error.error.message) {
          // Backend validation errors (like duplicate reservation)
          this.errorMessage = error.error.message;
        } else if (error.status === 404) {
          this.errorMessage = 'Verification service not available. Please try again later.';
        } else if (error.error && error.error.message) {
          this.errorMessage = `Verification failed: ${error.error.message}`;
        } else {
          this.errorMessage = 'Error during signature verification. Please try again.';
        }
        
        this.showResults = false;
        this.isProcessing = false;
      }
    });
  }

  /**
   * Verify signature only - Compare drawn signature with existing signature
   */
  verifySignatureOnly(): void {
    if (this.isCanvasEmpty()) {
      this.errorMessage = 'Please draw a signature first.';
      return;
    }

    if (!this.hasExistingSignature || !this.existingSignature?.signatureData) {
      this.errorMessage = 'No existing signature found to compare against.';
      return;
    }

    this.isProcessing = true;
    this.resetMessages();

    const drawnSignature = this.getCurrentSignature();
    
    console.log('Comparing signatures...');
    console.log('Existing signature data length:', this.existingSignature.signatureData.length);
    console.log('Drawn signature data length:', drawnSignature.length);

    this.signatureService.compareSignatureImages(
      this.existingSignature.signatureData,
      drawnSignature,
      `Verification comparison for CIN: ${this.cin}`
    ).subscribe({
      next: (response) => {
        console.log('Signature comparison result:', response);
        
        // Create a verification result to display
        this.verificationResult = {
          match: response.isMatch,
          similarityScore: response.similarityScore,
          status: response.isMatch ? 'VERIFIED' : 'REJECTED',
          message: response.message,
          verificationDetails: response.comparisonDetails || `Similarity: ${(response.similarityScore * 100).toFixed(1)}%`
        };
        
        this.showResults = true;
        this.isProcessing = false;
        
        console.log(`Verification result: ${response.isMatch ? 'MATCH' : 'NO MATCH'} - ${(response.similarityScore * 100).toFixed(1)}% similarity`);
      },
      error: (error) => {
        console.error('Error comparing signatures:', error);
        this.errorMessage = 'Error comparing signatures. Please try again.';
        this.isProcessing = false;
      }
    });
  }

  /**
   * Save signature - Use the full verification flow to save
   */
  saveSignatureWithVerification(): void {
    if (this.isCanvasEmpty()) {
      this.errorMessage = 'Please draw a signature first.';
      return;
    }

    // Use the existing verification method which handles all the business logic
    this.processSignature();
  }

  /**
   * Get the current canvas signature as base64
   */
  private getCurrentSignature(): string {
    return this.canvas.toDataURL('image/png');
  }

  /**
   * Check if canvas is empty
   */
  private isCanvasEmpty(): boolean {
    const blank = document.createElement('canvas');
    blank.width = this.canvas.width;
    blank.height = this.canvas.height;
    return this.canvas.toDataURL() === blank.toDataURL();
  }

  /**
   * Validate and fix signature data format
   */
  private validateSignatureData(signatureData: string): string | null {
    if (!signatureData) {
      console.error('No signature data provided');
      return null;
    }

    // Check if it's already a valid data URL
    if (signatureData.startsWith('data:image/')) {
      return signatureData;
    }

    // Check if it's valid base64
    try {
      atob(signatureData);
      return `data:image/png;base64,${signatureData}`;
    } catch (error) {
      console.error('Invalid base64 signature data:', error);
      return null;
    }
  }

  /**
   * Reset all messages
   */
  private resetMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.showResults = false;
  }

  /**
   * Navigate to next step (customize based on your flow)
   */
  private navigateToNextStep(): void {
    // Redirect to reservation confirmation or next step
    if (this.reservationId) {
      this.router.navigate(['/reservation/confirmation'], {
        queryParams: { reservationId: this.reservationId }
      });
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Retry signature process
   */
  retrySignature(): void {
    this.clearSignature();
    this.resetMessages();
    this.verificationResult = null;
    this.showResults = false;
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  }

  /**
   * Handle image load errors
   */
  onImageError(event: any): void {
    console.error('Error loading existing signature image:', event);
    console.log('Failed image src:', event.target.src);
    console.log('Image src length:', event.target.src?.length);
    console.log('Existing signature data:', this.existingSignature?.signatureData?.substring(0, 100));
    
    // Set fallback image
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDYwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjhmOWZhIiBzdHJva2U9IiNkZWUyZTYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWRhc2hhcnJheT0iMTAgNSIvPgo8dGV4dCB4PSIzMDAiIHk9IjE0MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNmM3NTdkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TaWduYXR1cmUgaW1hZ2UgdW5hdmFpbGFibGU8L3RleHQ+Cjx0ZXh0IHg9IjMwMCIgeT0iMTYwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkVycm9yIGxvYWRpbmcgaW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';
    event.target.alt = 'Signature image could not be loaded';
    
    // Show error message to user
    this.errorMessage = 'Could not load existing signature image. The image data may be corrupted.';
  }
}