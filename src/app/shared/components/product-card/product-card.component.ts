import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Product } from '../../../models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { DataService } from '../../../core/services/data.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { AuthService } from '../../../core/services/auth.service';
import { WhatsAppInquiryModalComponent } from '../whatsapp-inquiry-modal/whatsapp-inquiry-modal.component';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, WhatsAppInquiryModalComponent],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent implements OnInit {
  @Input() product!: Product;
  whatsappNumber$!: Observable<string>;
  isInWishlist = false;
  showInquiryModal = false;

  constructor(
    private cartService: CartService,
    private wishlistService: WishlistService,
    private dataService: DataService,
    private snackbarService: SnackbarService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.whatsappNumber$ = this.dataService.getDeliveryConfig().pipe(
      map(config => config?.whatsappNumber || '')
    );
    
    // Check if product is in wishlist
    this.wishlistService.isInWishlist(this.product.id).subscribe(isInWishlist => {
      this.isInWishlist = isInWishlist;
    });
    
    // Also subscribe to wishlist changes
    this.wishlistService.getWishlist().subscribe(wishlist => {
      this.isInWishlist = wishlist.some(p => p.id === this.product.id);
    });
  }

  addToCart(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    if (this.product.stock > 0) {
      this.cartService.addToCart(this.product, 1);
      this.snackbarService.success('Product added to cart!');
    } else {
      this.snackbarService.warning('Product is out of stock');
    }
  }

  toggleWishlist(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    
    // Check if user is logged in
    this.authService.currentUser$.pipe(take(1)).subscribe(user => {
      if (!user) {
        this.snackbarService.warning('Please login to add items to wishlist');
        this.router.navigate(['/login']);
        return;
      }
      
      this.wishlistService.toggleWishlist(this.product).subscribe({
        next: () => {
          // Wishlist will be updated via subscription in ngOnInit
        },
        error: (err) => {
          console.error('Error toggling wishlist:', err);
          if (err.status === 401 || err.status === 403) {
            this.snackbarService.warning('Please login to add items to wishlist');
            this.router.navigate(['/login']);
          } else {
            this.snackbarService.error('Failed to update wishlist. Please try again.');
          }
        }
      });
    });
  }

  openWhatsApp(event: Event, whatsappNumber: string): void {
    event.stopPropagation();
    event.preventDefault();
    this.showInquiryModal = true;
  }

  closeInquiryModal(): void {
    this.showInquiryModal = false;
  }

  getCurrentPrice(): number {
    if (this.product.discount) {
      return Math.round(this.product.price * (1 - this.product.discount / 100));
    }
    return this.product.price;
  }
}

