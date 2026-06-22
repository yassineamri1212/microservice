import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaymentService } from '../../payment.service';
import { PaymentReservation } from '../../models/payment.model';

@Component({
  selector: 'app-checkreservation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkreservation.component.html',
  styleUrl: './checkreservation.component.scss'
})
export class CheckreservationComponent {
  
  // Form fields
  cin: string = '';
  referenceCode: string = '';
  
  // Component state
  loading: boolean = false;
  error: string | null = null;
  
  constructor(
    private paymentService: PaymentService,
    private router: Router
  ) {}

  // Check reservation
  checkReservation(): void {
    // Validate inputs
    if (!this.cin || !this.referenceCode) {
      this.error = 'Please enter both CIN and Reference Code';
      return;
    }

    this.loading = true;
    this.error = null;

    // Create payment request
    const paymentRequest = {
      cin: this.cin.trim(),
      referenceCode: this.referenceCode.trim()
    };

    // Call the existing getReservation method
    this.paymentService.getReservation(paymentRequest).subscribe({
      next: (reservation: PaymentReservation) => {
        this.loading = false;
        console.log('Reservation found:', reservation);
        // Navigate to show reservation component with the reservation ID
        this.router.navigate(['/reservations', reservation.id]);
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Reservation not found. Please check your CIN and Reference Code.';
        console.error('Error checking reservation:', error);
      }
    });
  }

  // Clear form
  clearForm(): void {
    this.cin = '';
    this.referenceCode = '';
    this.error = null;
  }

  // Format CIN input (uppercase and remove spaces)
  onCinChange(): void {
    this.cin = this.cin.replace(/\s/g, '').toUpperCase();
    this.error = null;
  }

  // Format reference code input (uppercase and remove spaces)
  onReferenceChange(): void {
    this.referenceCode = this.referenceCode.replace(/\s/g, '').toUpperCase();
    this.error = null;
  }
}
