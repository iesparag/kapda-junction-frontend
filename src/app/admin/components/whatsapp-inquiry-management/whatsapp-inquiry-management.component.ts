import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { WhatsAppInquiryService, WhatsAppInquiry } from '../../../core/services/whatsapp-inquiry.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-whatsapp-inquiry-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './whatsapp-inquiry-management.component.html',
  styleUrl: './whatsapp-inquiry-management.component.css'
})
export class WhatsAppInquiryManagementComponent implements OnInit {
  inquiries$!: Observable<WhatsAppInquiry[]>;
  stats$!: Observable<{ total: number; pending: number; responded: number; closed: number }>;
  selectedStatus: string = 'all';
  selectedInquiry: WhatsAppInquiry | null = null;

  constructor(
    private inquiryService: WhatsAppInquiryService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.loadInquiries();
    this.loadStats();
  }

  loadInquiries(): void {
    const filters: any = {};
    if (this.selectedStatus !== 'all') {
      filters.status = this.selectedStatus;
    }
    this.inquiries$ = this.inquiryService.getAllInquiries(filters);
  }

  loadStats(): void {
    this.stats$ = this.inquiryService.getStats();
  }

  onStatusFilterChange(): void {
    this.loadInquiries();
  }

  updateStatus(inquiry: WhatsAppInquiry, status: 'pending' | 'responded' | 'closed'): void {
    this.inquiryService.updateInquiryStatus(inquiry.id!, status).subscribe({
      next: () => {
        this.snackbarService.success('Status updated successfully');
        this.loadInquiries();
        this.loadStats();
      },
      error: (err) => {
        this.snackbarService.error('Failed to update status');
        console.error(err);
      }
    });
  }

  deleteInquiry(inquiry: WhatsAppInquiry): void {
    this.snackbarService.confirm(
      `Are you sure you want to delete inquiry from ${inquiry.userName}?`,
      () => {
        this.inquiryService.deleteInquiry(inquiry.id!).subscribe({
          next: () => {
            this.snackbarService.success('Inquiry deleted successfully');
            this.loadInquiries();
            this.loadStats();
          },
          error: (err) => {
            this.snackbarService.error('Failed to delete inquiry');
            console.error(err);
          }
        });
      }
    );
  }

  viewInquiry(inquiry: WhatsAppInquiry): void {
    this.selectedInquiry = inquiry;
  }

  closeInquiryDetail(): void {
    this.selectedInquiry = null;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'responded':
        return 'status-responded';
      case 'closed':
        return 'status-closed';
      default:
        return '';
    }
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  openWhatsApp(whatsappUrl: string): void {
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank');
    } else {
      this.snackbarService.warning('WhatsApp URL not available. Please configure WhatsApp number in Delivery Config.');
    }
  }

  resendMessage(inquiry: WhatsAppInquiry): void {
    if (!inquiry.id) {
      this.snackbarService.error('Invalid inquiry ID');
      return;
    }

    this.inquiryService.resendMessage(inquiry.id).subscribe({
      next: (result) => {
        if (result.success) {
          this.snackbarService.success('WhatsApp message sent successfully!');
          this.loadInquiries();
          this.loadStats();
        } else {
          if (result.error && result.error.includes('not configured')) {
            this.snackbarService.warning('WhatsApp API not configured. Use "Open WhatsApp" button to send manually. See backend/WHATSAPP_SETUP.md for setup.');
          } else {
            this.snackbarService.error(result.error || 'Failed to send message');
          }
        }
      },
      error: (err) => {
        const errorMsg = err.error?.error || err.message || 'Unknown error';
        if (errorMsg.includes('not configured') || errorMsg.includes('credentials')) {
          this.snackbarService.warning('WhatsApp API credentials not configured. Use "Open WhatsApp" button to send manually. See backend/WHATSAPP_QUICK_SETUP.md for setup instructions.');
        } else {
          this.snackbarService.error('Failed to send WhatsApp message. Please check configuration.');
        }
        console.error('Error resending message:', err);
      }
    });
  }
}

