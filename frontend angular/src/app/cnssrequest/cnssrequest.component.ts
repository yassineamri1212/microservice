import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CnssService, PaymentRequestDTO, ReservationRecord } from '../cnss.service';
import { SmsEmailService } from '../sms-email.service';

@Component({
  selector: 'app-cnssrequest',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cnssrequest.component.html',
  styleUrl: './cnssrequest.component.scss'
})
export class CnssrequestComponent implements OnInit {

  // Form properties
  cin: string = '';
  amount: number = 0;
  reason: string = '';
  email: string = '';
  phoneNumber: string = '';
  
  // Component state
  loading: boolean = false;
  error: string | null = null;
  success: string | null = null;
  validationErrors: string[] = [];
  
  // Fee calculation
  processingFee: number = 0;
  totalAmount: number = 0;
  
  // Created reservation
  createdReservation: ReservationRecord | null = null;

  constructor(
    private cnssService: CnssService,
    private router: Router,
    private smsEmailService: SmsEmailService
  ) {}

  ngOnInit(): void {
    // Initialize default values
    this.reason = 'CNSS Social Security Payment';
  }

  // Calculate fees whenever amount changes
  onAmountChange(): void {
    if (this.amount > 0) {
      this.processingFee = this.cnssService.calculateFee(this.amount);
      this.totalAmount = this.cnssService.getTotalAmount(this.amount);
    } else {
      this.processingFee = 0;
      this.totalAmount = 0;
    }
  }

  // Format CIN input (auto-format while typing)
  onCinChange(): void {
    this.cin = this.cnssService.formatCin(this.cin);
  }

  // Validate email input
  onEmailChange(): void {
    // Basic email validation can be handled by HTML5 email input type
    // Additional custom validation can be added here if needed
  }

  // Validate phone number input
  onPhoneChange(): void {
    // Remove any non-digit characters
    this.phoneNumber = this.phoneNumber.replace(/\D/g, '');
    
    // Limit to 8 digits
    if (this.phoneNumber.length > 8) {
      this.phoneNumber = this.phoneNumber.substring(0, 8);
    }
  }

  // Validate form before submission
  validateForm(): boolean {
    const request: PaymentRequestDTO = {
      cin: this.cin,
      amount: this.amount,
      reason: this.reason,
      email: this.email,
      phoneNumber: this.phoneNumber
    };

    const validation = this.cnssService.validatePaymentRequest(request);
    this.validationErrors = validation.errors;
    return validation.isValid;
  }

  // Submit payment request
  submitRequest(): void {
    // Clear previous messages
    this.error = null;
    this.success = null;
    this.validationErrors = [];

    // Validate form
    if (!this.validateForm()) {
      return;
    }

    // Create payment request
    const request: PaymentRequestDTO = {
      cin: this.cin,
      amount: this.amount,
      reason: this.reason,
      email: this.email,
      phoneNumber: this.phoneNumber
    };

    this.loading = true;

    // Send request to CNSS service
    this.cnssService.requestPayment(request).subscribe({
      next: (reservation: ReservationRecord) => {
        this.loading = false;
        this.createdReservation = reservation;
        this.success = `Payment request submitted successfully! Reference Code: ${reservation.referenceCode}`;
        console.log('Reservation created:', reservation);
        
        // Send success notifications
        this.sendPaymentRequestNotifications(reservation);
        
        // Reset form after successful submission
        this.resetForm();
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Failed to submit payment request. Please try again.';
        console.error('Payment request failed:', error);
      }
    });
  }

  // Send payment request success notifications
  private sendPaymentRequestNotifications(reservation: ReservationRecord): void {
    const message = `Your payment request has been submitted successfully. Reference Code: ${reservation.referenceCode}. CIN: ${reservation.cin}. Amount: ${reservation.amount} TND. Reason: ${reservation.reason}. Your money is now ready to withdraw using this reference code and CIN at any STB branch.`;
    const subject = 'Payment Request Confirmation - STB Services';

    // Send dual notification (SMS + Email) if both are available
    if (reservation.email && reservation.phoneNumber) {
      this.smsEmailService.sendDualNotification(
        reservation.email,
        reservation.phoneNumber,
        subject,
        message
      ).then((response) => {
        console.log('Payment request notifications sent:', response);
      }).catch((error) => {
        console.error('Failed to send payment request notifications:', error);
        // Don't show alert to user - notification failure shouldn't affect request success
      });
    }
    // Send only email if phone number is not available
    else if (reservation.email) {
      this.smsEmailService.sendNotificationEmail(
        reservation.email,
        subject,
        message
      ).subscribe({
        next: (response) => {
          console.log('Payment request email sent:', response);
        },
        error: (error) => {
          console.error('Failed to send payment request email:', error);
        }
      });
    }
    // Send only SMS if email is not available
    else if (reservation.phoneNumber) {
      this.smsEmailService.sendNotificationSms(
        reservation.phoneNumber,
        message
      ).subscribe({
        next: (response) => {
          console.log('Payment request SMS sent:', response);
        },
        error: (error) => {
          console.error('Failed to send payment request SMS:', error);
        }
      });
    }
  }

  // Reset form
  resetForm(): void {
    this.cin = '';
    this.amount = 0;
    this.reason = 'CNSS Social Security Payment';
    this.email = '';
    this.phoneNumber = '';
    this.processingFee = 0;
    this.totalAmount = 0;
    this.validationErrors = [];
  }

  // Clear all messages and errors
  clearMessages(): void {
    this.error = null;
    this.success = null;
    this.validationErrors = [];
  }

  // Check reservation status
  checkReservation(): void {
    if (this.createdReservation) {
      // Navigate to check reservation with the CIN
      this.router.navigate(['/checkreservation'], { 
        queryParams: { 
          cin: this.createdReservation.cin,
          ref: this.createdReservation.referenceCode 
        } 
      });
    }
  }

  // View reservation details
  viewReservation(): void {
    if (this.createdReservation) {
      // Navigate to show reservation
      this.router.navigate(['/showreservation', this.createdReservation.id || this.createdReservation.referenceCode]);
    }
  }

  // Format amount for display
  formatAmount(amount: number): string {
    return this.cnssService.formatAmount(amount);
  }

  // Get status display text
  getStatusDisplay(status: string): string {
    return this.cnssService.getStatusDisplayText(status);
  }

  // Get status color class
  getStatusColor(status: string): string {
    return this.cnssService.getStatusColor(status);
  }

  // Helper methods for error checking
  hasCinError(): boolean {
    return this.validationErrors.some(e => e.includes('CIN'));
  }

  hasAmountError(): boolean {
    return this.validationErrors.some(e => e.includes('Amount'));
  }

  hasReasonError(): boolean {
    return this.validationErrors.some(e => e.includes('Reason'));
  }

  hasEmailError(): boolean {
    return this.validationErrors.some(e => e.includes('Email'));
  }

  hasPhoneError(): boolean {
    return this.validationErrors.some(e => e.includes('Phone'));
  }

  // Test CNSS service connection
  testConnection(): void {
    this.loading = true;
    this.error = null;
    this.success = null;

    this.cnssService.healthCheck().subscribe({
      next: (response) => {
        this.loading = false;
        this.success = 'CNSS Service connection successful!';
        console.log('Health check response:', response);
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Failed to connect to CNSS Service. Please check your connection.';
        console.error('Health check failed:', error);
      }
    });
  }

  // Navigate to different components
  goToReservations(): void {
    this.router.navigate(['/reservations']);
  }

  goToCheckReservation(): void {
    this.router.navigate(['/checkreservation']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}
