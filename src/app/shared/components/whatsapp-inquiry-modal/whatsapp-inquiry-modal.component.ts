import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../models/product.model';
import { WhatsAppInquiryService, InquiryRequest } from '../../../core/services/whatsapp-inquiry.service';
import { AuthService } from '../../../core/services/auth.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { DataService } from '../../../core/services/data.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-whatsapp-inquiry-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './whatsapp-inquiry-modal.component.html',
  styleUrl: './whatsapp-inquiry-modal.component.css'
})
export class WhatsAppInquiryModalComponent implements OnInit, OnChanges {
  @Input() product!: Product;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  
  inquiryForm = {
    message: '',
    userName: '',
    userEmail: '',
    userPhone: ''
  };
  
  isSubmitting = false;
  currentPrice = 0;
  whatsappNumber = '';
  private overlayMouseDown = false;

  constructor(
    private inquiryService: WhatsAppInquiryService,
    private authService: AuthService,
    private snackbarService: SnackbarService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (changes['isOpen'].currentValue === true && changes['isOpen'].previousValue !== true) {
        // Only initialize when opening (not when closing or re-rendering)
        this.initializeForm();
      } else if (changes['isOpen'].currentValue === false) {
        // Reset state when closing
        this.overlayMouseDown = false;
      }
    }
    
    // Prevent re-initialization if product changes while modal is open
    if (changes['product'] && this.isOpen && changes['product'].firstChange === false) {
      // Don't re-initialize if product changes while modal is already open
      return;
    }
  }

  private initializeForm(): void {
    if (!this.product) return;

    // Calculate price once
    this.currentPrice = this.getCurrentPrice();

    // Get WhatsApp number from delivery config
    this.dataService.getDeliveryConfig().pipe(take(1)).subscribe(config => {
      this.whatsappNumber = config?.whatsappNumber || '';
    });

    // Pre-fill user info if logged in
    this.authService.currentUser$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.inquiryForm.userName = user.name || '';
        this.inquiryForm.userEmail = user.email || '';
      } else {
        this.inquiryForm.userName = '';
        this.inquiryForm.userEmail = '';
      }
    });

    // Set default message
    this.inquiryForm.message = `I'm interested in ${this.product.name}. Please provide more details.`;
  }

  getCurrentPrice(): number {
    if (!this.product) return 0;
    if (this.product.discount) {
      return Math.round(this.product.price * (1 - this.product.discount / 100));
    }
    return this.product.price;
  }

  onOverlayMouseDown(event: MouseEvent): void {
    // Only track mousedown on the overlay itself, not on children
    if (event.target === event.currentTarget) {
      this.overlayMouseDown = true;
    }
  }

  onOverlayClick(event: MouseEvent): void {
    // Only close if the click started and ended on the overlay (not on modal content)
    if (event.target === event.currentTarget && this.overlayMouseDown) {
      this.closeModal();
    }
    this.overlayMouseDown = false;
  }

  closeModal(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.overlayMouseDown = false;
    this.close.emit();
  }

  onSubmit(): void {
    if (!this.inquiryForm.message.trim()) {
      this.snackbarService.warning('Please enter your inquiry message');
      return;
    }

    if (!this.inquiryForm.userName.trim()) {
      this.snackbarService.warning('Please enter your name');
      return;
    }

    if (!this.whatsappNumber || !this.whatsappNumber.trim()) {
      this.snackbarService.warning('WhatsApp number not configured. Please contact admin.');
      return;
    }

    this.isSubmitting = true;

    // Format WhatsApp message
    const whatsappMessage = this.formatWhatsAppMessage();

    // Generate WhatsApp URL
    const phoneNumber = this.whatsappNumber.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    // Save inquiry to DB first (async, don't wait)
    const inquiryRequest: InquiryRequest = {
      productId: this.product.id,
      message: this.inquiryForm.message,
      userName: this.inquiryForm.userName,
      userEmail: this.inquiryForm.userEmail || undefined,
      userPhone: this.inquiryForm.userPhone || undefined
    };

    // Save to DB (fire and forget)
    this.inquiryService.createInquiry(inquiryRequest).subscribe({
      next: () => {
        console.log('Inquiry saved to database');
      },
      error: (err) => {
        console.error('Error saving inquiry to database:', err);
        // Don't show error to user, still open WhatsApp
      }
    });

    // Open WhatsApp directly from frontend
    window.open(whatsappUrl, '_blank');
    
    this.snackbarService.success('Opening WhatsApp... Your inquiry will be sent directly!');
    this.closeModal();
    this.resetForm();
    this.isSubmitting = false;
  }

  private formatWhatsAppMessage(): string {
    const productLink = `${window.location.origin}/products/${this.product.id}`;
    let message = `🛍️ *New Product Inquiry*\n\n`;
    message += `*Customer Details:*\n`;
    message += `Name: ${this.inquiryForm.userName}\n`;
    if (this.inquiryForm.userEmail) {
      message += `Email: ${this.inquiryForm.userEmail}\n`;
    }
    if (this.inquiryForm.userPhone) {
      message += `Phone: ${this.inquiryForm.userPhone}\n`;
    }
    message += `\n*Product Details:*\n`;
    message += `Product: ${this.product.name}\n`;
    message += `Price: ₹${this.currentPrice}\n`;
    message += `Product Link: ${productLink}\n`;
    message += `\n*Customer Message:*\n${this.inquiryForm.message}\n`;
    message += `\n*Date:* ${new Date().toLocaleString('en-IN')}`;
    return message;
  }

  private resetForm(): void {
    this.inquiryForm = {
      message: '',
      userName: '',
      userEmail: '',
      userPhone: ''
    };
    this.isSubmitting = false;
  }
}

