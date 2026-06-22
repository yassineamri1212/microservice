import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankacountService } from '../bankacount.service';
import { BankAccount } from '../models/bank-account.model';

@Component({
    selector: 'app-bank-acounts',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './bank-acounts.component.html',
    styleUrl: './bank-acounts.component.scss'
})
export class BankAcountsComponent implements OnInit {

    // Component properties
    bankAccounts: BankAccount[] = [];
    loading: boolean = false;
    error: string | null = null;
    cnssBalance: number = 0;

    constructor(private bankAccountService: BankacountService) {}

    ngOnInit(): void {
        this.loadAllBankAccounts();
        this.loadCnssBalance();
    }

    // Load all bank accounts with enhanced error handling
    loadAllBankAccounts(): void {
        this.loading = true;
        this.error = null;

        this.bankAccountService.getAllBankAccounts().subscribe({
            next: (accounts: BankAccount[]) => {
                this.bankAccounts = accounts;
                this.loading = false;
                console.log('Bank accounts loaded successfully:', accounts);
            },
            error: (error) => {
                this.error = 'Unable to load bank accounts. Please check your connection and try again.';
                this.loading = false;
                console.error('Error loading bank accounts:', error);
            }
        });
    }

    // Load CNSS balance with enhanced error handling
    loadCnssBalance(): void {
        this.bankAccountService.getCnssBalance().subscribe({
            next: (balance: number) => {
                this.cnssBalance = balance;
                console.log('CNSS balance loaded successfully:', balance);
            },
            error: (error) => {
                console.error('Error loading CNSS balance:', error);
                // Don't set error state for CNSS balance failure as it's not critical
            }
        });
    }

    // Refresh accounts with user feedback
    refreshAccounts(): void {
        console.log('Refreshing bank accounts data...');
        this.loadAllBankAccounts();
        this.loadCnssBalance();
    }

    // Filter methods with enhanced logic
    getActiveAccounts(): BankAccount[] {
        return this.bankAccounts.filter(account =>
            account.status && account.status.toUpperCase() === 'ACTIVE'
        );
    }

    getCnssAccounts(): BankAccount[] {
        return this.bankAccounts.filter(account =>
            account.accountType && account.accountType.toUpperCase() === 'TREASURY'
        );
    }

    // Enhanced helper methods
    getTotalBalance(): number {
        return this.bankAccounts.reduce((total, account) => {
            return total + (account.balance || 0);
        }, 0);
    }

    getAccountsCount(): number {
        return this.bankAccounts.length;
    }

    getActiveAccountsCount(): number {
        return this.getActiveAccounts().length;
    }

    getInactiveAccountsCount(): number {
        return this.bankAccounts.filter(account =>
            account.status && account.status.toUpperCase() === 'INACTIVE'
        ).length;
    }

    // Get accounts by type for enhanced filtering
    getAccountsByType(type: string): BankAccount[] {
        return this.bankAccounts.filter(account =>
            account.accountType && account.accountType.toUpperCase() === type.toUpperCase()
        );
    }

    // Format account number for display
    formatAccountNumber(accountNumber: string): string {
        if (!accountNumber) return '';
        // Add spaces every 4 characters for better readability
        return accountNumber.replace(/(.{4})/g, '$1 ').trim();
    }

    // Get account status color class
    getStatusClass(status: string): string {
        if (!status) return '';
        switch (status.toUpperCase()) {
            case 'ACTIVE':
                return 'status-active';
            case 'INACTIVE':
                return 'status-inactive';
            default:
                return 'status-unknown';
        }
    }

    // Get account type color class
    getTypeClass(accountType: string): string {
        if (!accountType) return '';
        switch (accountType.toUpperCase()) {
            case 'TREASURY':
                return 'type-treasury';
            case 'SAVINGS':
                return 'type-savings';
            case 'CHECKING':
                return 'type-checking';
            default:
                return 'type-other';
        }
    }

    // Enhanced TrackBy function for ngFor performance
    trackByAccountId(index: number, account: BankAccount): number {
        return account.id || index;
    }

    // Utility method to check if account is recently updated (within last 7 days)
    isRecentlyUpdated(updatedAt: Date): boolean {
        if (!updatedAt) return false;
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return new Date(updatedAt) > oneWeekAgo;
    }

    // Get summary statistics
    getSummaryStats() {
        return {
            totalAccounts: this.getAccountsCount(),
            activeAccounts: this.getActiveAccountsCount(),
            inactiveAccounts: this.getInactiveAccountsCount(),
            cnssAccounts: this.getCnssAccounts().length,
            totalBalance: this.getTotalBalance(),
            cnssBalance: this.cnssBalance,
            averageBalance: this.getAccountsCount() > 0 ? this.getTotalBalance() / this.getAccountsCount() : 0
        };
    }
}
