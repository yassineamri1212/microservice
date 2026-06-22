import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaymentService } from '../payment.service';
import { PaymentReservation } from '../models/payment.model';

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.scss'
})
export class ReservationComponent implements OnInit {
  
  // Component properties
  reservations: PaymentReservation[] = [];
  filteredReservations: PaymentReservation[] = [];
  loading: boolean = false;
  error: string | null = null;
  
  // Filter properties
  searchText: string = '';
  statusFilter: string = '';
  minAmount: number | null = null;
  maxAmount: number | null = null;
  startDate: string = '';
  endDate: string = '';
  
  // Pagination properties
  currentTablePage: number = 1;
  currentActivePage: number = 1;
  currentPaidPage: number = 1;
  currentCanceledPage: number = 1;
  itemsPerPage: number = 5;
  
  // Check reservation form
  checkForm = {
    cin: '',
    referenceCode: ''
  };
  checkingReservation: boolean = false;
  checkError: string | null = null;
  
  constructor(
    private paymentService: PaymentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllReservations();
  }

  // Load all reservations
  loadAllReservations(): void {
    this.loading = true;
    this.error = null;
    
    this.paymentService.getAllReservations().subscribe({
      next: (reservations: PaymentReservation[]) => {
        this.reservations = reservations;
        this.filteredReservations = [...reservations]; // Initialize filtered list
        this.loading = false;
        console.log('Reservations loaded:', reservations);
      },
      error: (error) => {
        this.error = 'Failed to load reservations. Please try again.';
        this.loading = false;
        console.error('Error loading reservations:', error);
      }
    });
  }

  // Refresh reservations
  refreshReservations(): void {
    this.loadAllReservations();
  }

  // Navigate to reservation details page
  viewReservationDetails(reservationId: string): void {
    if (reservationId) {
      this.router.navigate(['/reservations', reservationId]);
    } else {
      console.error('No reservation ID provided for navigation');
    }
  }

  // Filter methods
  getActiveReservations(): PaymentReservation[] {
    return this.reservations.filter(reservation => 
      reservation.status === 'RESERVED'
    );
  }

  getPaidReservations(): PaymentReservation[] {
    return this.reservations.filter(reservation => reservation.status === 'PAID');
  }

  getCanceledReservations(): PaymentReservation[] {
    return this.reservations.filter(reservation => reservation.status === 'CANCELED');
  }

  getExpiredReservations(): PaymentReservation[] {
    return this.reservations.filter(reservation => 
      reservation.status === 'EXPIRED' || reservation.status === 'CANCELLED'
    );
  }

  // Dynamic filtering methods
  applyFilters(): void {
    this.filteredReservations = this.reservations.filter(reservation => {
      // Text search filter (CIN, Email, Phone Number, Reference Code)
      const matchesSearch = this.searchText === '' || 
        reservation.cin.toLowerCase().includes(this.searchText.toLowerCase()) ||
        (reservation.email && reservation.email.toLowerCase().includes(this.searchText.toLowerCase())) ||
        (reservation.phoneNumber && reservation.phoneNumber.toLowerCase().includes(this.searchText.toLowerCase())) ||
        reservation.referenceCode.toLowerCase().includes(this.searchText.toLowerCase());

      // Status filter
      const matchesStatus = this.statusFilter === '' || reservation.status === this.statusFilter;

      // Amount range filter
      const matchesMinAmount = this.minAmount === null || reservation.amount >= this.minAmount;
      const matchesMaxAmount = this.maxAmount === null || reservation.amount <= this.maxAmount;

      // Date range filter
      let matchesDateRange = true;
      if (this.startDate || this.endDate) {
        const reservationDate = new Date(reservation.createdDate);
        if (this.startDate) {
          const startDate = new Date(this.startDate);
          matchesDateRange = matchesDateRange && reservationDate >= startDate;
        }
        if (this.endDate) {
          const endDate = new Date(this.endDate);
          endDate.setHours(23, 59, 59, 999); // Include the entire end date
          matchesDateRange = matchesDateRange && reservationDate <= endDate;
        }
      }

      return matchesSearch && matchesStatus && matchesMinAmount && matchesMaxAmount && matchesDateRange;
    });
    
    // Reset table pagination to first page when filters are applied
    this.currentTablePage = 1;
  }

  clearFilters(): void {
    this.searchText = '';
    this.statusFilter = '';
    this.minAmount = null;
    this.maxAmount = null;
    this.startDate = '';
    this.endDate = '';
    this.filteredReservations = [...this.reservations];
    
    // Reset all pagination to first page
    this.currentTablePage = 1;
    this.currentActivePage = 1;
    this.currentPaidPage = 1;
    this.currentCanceledPage = 1;
  }

  // Helper methods
  getReservationsCount(): number {
    return this.reservations.length;
  }

  getTotalAmount(): number {
    return this.reservations.reduce((total, reservation) => total + reservation.amount, 0);
  }

  getPaidAmount(): number {
    return this.getPaidReservations().reduce((total, reservation) => total + reservation.amount, 0);
  }

  getReservedAmount(): number {
    return this.getActiveReservations().reduce((total, reservation) => total + reservation.amount, 0);
  }

  getCanceledAmount(): number {
    return this.getCanceledReservations().reduce((total, reservation) => total + reservation.amount, 0);
  }

  // Format status for display
  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'reserved':
        return 'status-reserved';
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

  // Track by function for ngFor performance
  trackByReservationId(index: number, reservation: PaymentReservation): string {
    return reservation.id;
  }

  // Pagination methods for table
  getPaginatedTableData(): PaymentReservation[] {
    const startIndex = (this.currentTablePage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredReservations.slice(startIndex, endIndex);
  }

  getTableTotalPages(): number {
    return Math.ceil(this.filteredReservations.length / this.itemsPerPage);
  }

  getTablePages(): number[] {
    const totalPages = this.getTableTotalPages();
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  goToTablePage(page: number): void {
    if (page >= 1 && page <= this.getTableTotalPages()) {
      this.currentTablePage = page;
    }
  }

  // Pagination methods for Active Reservations
  getPaginatedActiveReservations(): PaymentReservation[] {
    const activeReservations = this.getActiveReservations();
    const startIndex = (this.currentActivePage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return activeReservations.slice(startIndex, endIndex);
  }

  getActiveTotalPages(): number {
    return Math.ceil(this.getActiveReservations().length / this.itemsPerPage);
  }

  getActivePages(): number[] {
    const totalPages = this.getActiveTotalPages();
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  goToActivePage(page: number): void {
    if (page >= 1 && page <= this.getActiveTotalPages()) {
      this.currentActivePage = page;
    }
  }

  // Pagination methods for Paid Reservations
  getPaginatedPaidReservations(): PaymentReservation[] {
    const paidReservations = this.getPaidReservations();
    const startIndex = (this.currentPaidPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return paidReservations.slice(startIndex, endIndex);
  }

  getPaidTotalPages(): number {
    return Math.ceil(this.getPaidReservations().length / this.itemsPerPage);
  }

  getPaidPages(): number[] {
    const totalPages = this.getPaidTotalPages();
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  goToPaidPage(page: number): void {
    if (page >= 1 && page <= this.getPaidTotalPages()) {
      this.currentPaidPage = page;
    }
  }

  // Pagination methods for Canceled Reservations
  getPaginatedCanceledReservations(): PaymentReservation[] {
    const canceledReservations = this.getCanceledReservations();
    const startIndex = (this.currentCanceledPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return canceledReservations.slice(startIndex, endIndex);
  }

  getCanceledTotalPages(): number {
    return Math.ceil(this.getCanceledReservations().length / this.itemsPerPage);
  }

  getCanceledPages(): number[] {
    const totalPages = this.getCanceledTotalPages();
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  goToCanceledPage(page: number): void {
    if (page >= 1 && page <= this.getCanceledTotalPages()) {
      this.currentCanceledPage = page;
    }
  }
}
