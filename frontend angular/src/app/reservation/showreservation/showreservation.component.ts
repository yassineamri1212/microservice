import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../payment.service';
import { PaymentReservation } from '../../models/payment.model';
import { SmsEmailService } from '../../sms-email.service';
import { PdfService } from '../../pdf.service';

@Component({
  selector: 'app-showreservation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './showreservation.component.html',
  styleUrl: './showreservation.component.scss'
})
export class ShowreservationComponent implements OnInit {

  // Component properties
  reservation: PaymentReservation | null = null;
  reservationId: string = '';
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private smsEmailService: SmsEmailService,
    private pdfService: PdfService
  ) {}

  ngOnInit(): void {
    // Get reservation ID from route parameters
    this.route.params.subscribe(params => {
      this.reservationId = params['reservationId'];
      if (this.reservationId) {
        this.loadReservationDetails();
      }
    });

    // Debug: Log current user roles
    this.logCurrentUserRoles();
  }

  // Debug method to log current user roles
  private logCurrentUserRoles(): void {
    try {
      const rolesString = sessionStorage.getItem('roles');
      console.log('Current user roles from sessionStorage:', rolesString);
      
      if (rolesString) {
        const roles = JSON.parse(rolesString);
        console.log('Parsed roles object:', roles);
        console.log('Is bank user:', this.isBankUser());
        console.log('Is CNSS user:', this.isCnssUser());
      }
    } catch (error) {
      console.error('Error logging user roles:', error);
    }
  }

  // Load reservation details by ID
  loadReservationDetails(): void {
    this.loading = true;
    this.error = null;

    this.paymentService.getReservationById(this.reservationId).subscribe({
      next: (reservation: PaymentReservation) => {
        this.reservation = reservation;
        this.loading = false;
        console.log('Reservation details loaded:', reservation);
      },
      error: (error) => {
        this.error = 'Failed to load reservation details. Reservation not found.';
        this.loading = false;
        console.error('Error loading reservation details:', error);
      }
    });
  }

  // Go back to check reservation component
  goBack(): void {
    this.router.navigate(['/checkreservation']);
  }

  // Refresh reservation details
  refreshReservation(): void {
    this.loadReservationDetails();
  }

  // Process payment for this reservation
  processPayment(): void {
    if (!this.reservation) return;

    const paymentRequest = {
      cin: this.reservation.cin,
      referenceCode: this.reservation.referenceCode,
      amount: this.reservation.amount,
        reason: this.reservation.reason
    };

    this.paymentService.processPayment(paymentRequest).subscribe({
      next: (confirmation) => {
        console.log('Payment processed:', confirmation);
        alert('Payment processed successfully!');
        
        // Send success notifications
        if (this.reservation?.email || this.reservation?.phoneNumber) {
          this.sendPaymentSuccessNotifications();
        }
        
        this.loadReservationDetails(); // Refresh to see updated status
      },
      error: (error) => {
        console.error('Payment failed:', error);
        alert('Payment processing failed. Please try again.');
      }
    });
  }

  // Download reservation as PDF
  downloadPDF(): void {
    if (!this.reservation) {
      console.error('No reservation data available for PDF generation');
      return;
    }

    try {
      this.pdfService.downloadPDF(this.reservation);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  }

  // Send payment success notifications
  private async sendPaymentSuccessNotifications(): Promise<void> {
    if (!this.reservation) return;

    const message = `Payment processed successfully for reservation ${this.reservation.referenceCode}. Amount: ${this.reservation.amount} TND. Reason: ${this.reservation.reason}. Thank you for using our services.`;
    const subject = 'Payment Confirmation - STB Services';

    try {
      // Generate PDF for email (we'll still generate it but pass reservation details to email)
      const pdfBlob = await this.pdfService.generateReservationPDF(this.reservation);
      const pdfBase64 = await this.blobToBase64(pdfBlob);
      const pdfFilename = `STB-Reservation-${this.reservation.referenceCode}.pdf`;

      // Send dual notification (SMS + Email with reservation details) if both are available
      if (this.reservation.email && this.reservation.phoneNumber) {
        // Send SMS notification
        this.smsEmailService.sendNotificationSms(
          this.reservation.phoneNumber,
          message
        ).subscribe({
          next: (smsResponse) => {
            console.log('Payment success SMS sent:', smsResponse);
          },
          error: (error) => {
            console.error('Failed to send payment SMS:', error);
          }
        });

        // Send email with complete reservation details
        this.smsEmailService.sendNotificationEmailWithReservationDetails(
          this.reservation.email,
          subject,
          message,
          this.reservation
        ).subscribe({
          next: (emailResponse) => {
            console.log('Payment success email with reservation details sent:', emailResponse);
          },
          error: (error) => {
            console.error('Failed to send payment email with reservation details:', error);
          }
        });
      }
      // Send only email with reservation details if phone number is not available
      else if (this.reservation.email) {
        this.smsEmailService.sendNotificationEmailWithReservationDetails(
          this.reservation.email,
          subject,
          message,
          this.reservation
        ).subscribe({
          next: (response) => {
            console.log('Payment success email with reservation details sent:', response);
          },
          error: (error) => {
            console.error('Failed to send payment email with reservation details:', error);
          }
        });
      }
      // Send only SMS if email is not available
      else if (this.reservation.phoneNumber) {
        this.smsEmailService.sendNotificationSms(
          this.reservation.phoneNumber,
          message
        ).subscribe({
          next: (response) => {
            console.log('Payment success SMS sent:', response);
          },
          error: (error) => {
            console.error('Failed to send payment SMS:', error);
          }
        });
      }
    } catch (error) {
      console.error('Error in payment notification process:', error);
      
      // Fallback to basic notifications if something fails
      if (this.reservation.email && this.reservation.phoneNumber) {
        this.smsEmailService.sendDualNotification(
          this.reservation.email,
          this.reservation.phoneNumber,
          subject,
          message
        ).then((response) => {
          console.log('Fallback payment success notifications sent:', response);
        }).catch((error) => {
          console.error('Failed to send fallback payment notifications:', error);
        });
      } else if (this.reservation.email) {
        this.smsEmailService.sendNotificationEmail(
          this.reservation.email,
          subject,
          message
        ).subscribe({
          next: (response) => {
            console.log('Fallback payment success email sent:', response);
          },
          error: (error) => {
            console.error('Failed to send fallback payment email:', error);
          }
        });
      } else if (this.reservation.phoneNumber) {
        this.smsEmailService.sendNotificationSms(
          this.reservation.phoneNumber,
          message
        ).subscribe({
          next: (response) => {
            console.log('Fallback payment success SMS sent:', response);
          },
          error: (error) => {
            console.error('Failed to send fallback payment SMS:', error);
          }
        });
      }
    }
  }

  // Helper method to convert Blob to Base64
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1]; // Remove data:type;base64, prefix
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Cancel reservation
  cancelReservation(): void {
    if (!this.reservation) return;

    // Show confirmation dialog
    const confirmed = confirm(
      `Are you sure you want to cancel this reservation?\n\n` +
      `CIN: ${this.reservation.cin}\n` +
      `Reference: ${this.reservation.referenceCode}\n` +
      `Amount: ${this.reservation.amount}\n\n` +
      `This action cannot be undone.`
    );

    if (confirmed) {
      this.loading = true;
      this.error = null;

      this.paymentService.cancelReservation(this.reservation.id).subscribe({
        next: (updatedReservation) => {
          console.log('Reservation canceled:', updatedReservation);
          this.reservation = updatedReservation;
          this.loading = false;
          alert('Reservation has been successfully canceled.');
        },
        error: (error) => {
          this.loading = false;
          this.error = 'Failed to cancel reservation. Please try again.';
          console.error('Cancel reservation failed:', error);
          alert('Failed to cancel reservation. Please try again.');
        }
      });
    }
  }

  // Check if reservation can be processed (not already paid)
  canProcessPayment(): boolean {
    return this.reservation !== null &&
           this.reservation.status !== 'PAID' &&
           this.reservation.status !== 'EXPIRED' &&
           this.reservation.status !== 'CANCELLED' &&
           this.reservation.status !== 'CANCELED';
  }

  // Check if reservation can be canceled (only RESERVED status)
  canCancelReservation(): boolean {
    return this.reservation !== null &&
           this.reservation.status === 'RESERVED';
  }

  // Check if current user is a bank user (bank_agent or bank_officer)
  isBankUser(): boolean {
    try {
      const rolesString = sessionStorage.getItem('roles');
      if (!rolesString) return false;
      
      const roles = JSON.parse(rolesString);
      
      // Check if user has bank roles
      return this.hasRole(roles, 'bank_agent') || this.hasRole(roles, 'bank_officer');
    } catch (error) {
      console.error('Error checking bank user role:', error);
      return false;
    }
  }

  // Check if current user is a CNSS user (cnss_agent or cnss_officer)
  isCnssUser(): boolean {
    try {
      const rolesString = sessionStorage.getItem('roles');
      if (!rolesString) return false;
      
      const roles = JSON.parse(rolesString);
      
      // Check if user has CNSS roles
      return this.hasRole(roles, 'cnss_agent') || this.hasRole(roles, 'cnss_officer');
    } catch (error) {
      console.error('Error checking CNSS user role:', error);
      return false;
    }
  }

  // Helper method to check if a specific role exists in the roles object
  private hasRole(roles: any, roleName: string): boolean {
    if (!roles) return false;
    
    // Check different possible structures of the roles object
    // Structure could be: { "client-name": { roles: ["role1", "role2"] } }
    for (const clientName in roles) {
      const clientRoles = roles[clientName];
      if (clientRoles && clientRoles.roles && Array.isArray(clientRoles.roles)) {
        if (clientRoles.roles.includes(roleName)) {
          return true;
        }
      }
    }
    
    // Alternative structure: direct array of roles
    if (Array.isArray(roles) && roles.includes(roleName)) {
      return true;
    }
    
    // Alternative structure: roles as direct property
    if (roles.roles && Array.isArray(roles.roles) && roles.roles.includes(roleName)) {
      return true;
    }
    
    return false;
  }

  // Get status display class
  getStatusClass(): string {
    if (!this.reservation) return '';

    switch (this.reservation.status.toLowerCase()) {
      case 'reserved':
      case 'pending':
        return 'status-pending';
      case 'paid':
        return 'status-paid';
      case 'canceled':
        return 'status-canceled';
      case 'expired':
      case 'cancelled':
        return 'status-expired';
      default:
        return 'status-unknown';
    }
  }

  // Get status display text
  getStatusText(): string {
    if (!this.reservation) return '';

    switch (this.reservation.status.toLowerCase()) {
      case 'reserved':
        return 'Reserved - Ready for Payment';
      case 'pending':
        return 'Pending Processing';
      case 'paid':
        return 'Payment Completed';
      case 'canceled':
        return 'Reservation Canceled';
      case 'expired':
        return 'Reservation Expired';
      case 'cancelled':
        return 'Reservation Cancelled';
      default:
        return this.reservation.status;
    }
  }

  // Format date for display
  formatDate(dateString: string | Date): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  // Calculate days until expiry
  getDaysUntilExpiry(): number {
    if (!this.reservation || !this.reservation.expiredDate) return 0;

    const expiryDate = new Date(this.reservation.expiredDate);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }

  // Check if reservation is expiring soon (within 3 days)
  isExpiringSoon(): boolean {
    return this.getDaysUntilExpiry() <= 3 && this.getDaysUntilExpiry() > 0;
  }

  // Check if reservation is expired
  isExpired(): boolean {
    return this.getDaysUntilExpiry() <= 0;
  }

  // Format created date
  formatCreatedDate(): string {
    if (!this.reservation || !this.reservation.createdDate) return 'N/A';
    const date = new Date(this.reservation.createdDate);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  // Format expired date
  formatExpiredDate(): string {
    if (!this.reservation || !this.reservation.expiredDate) return 'N/A';
    const date = new Date(this.reservation.expiredDate);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  // Get email display
  getEmailDisplay(): string {
    return this.reservation?.email || 'Not provided';
  }

  // Get expiry status message
  getExpiryStatusMessage(): string {
    if (this.isExpired()) {
      return 'This reservation has expired';
    } else if (this.isExpiringSoon()) {
      const days = this.getDaysUntilExpiry();
      return `This reservation expires in ${days} day${days !== 1 ? 's' : ''}`;
    } else {
      const days = this.getDaysUntilExpiry();
      return `This reservation expires in ${days} day${days !== 1 ? 's' : ''}`;
    }
  }

  // Get expiry status class
  getExpiryStatusClass(): string {
    if (this.isExpired()) {
      return 'expiry-expired';
    } else if (this.isExpiringSoon()) {
      return 'expiry-warning';
    } else {
      return 'expiry-normal';
    }
  }
}
