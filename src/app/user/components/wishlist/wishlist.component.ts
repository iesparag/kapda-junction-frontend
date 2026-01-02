import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WishlistService } from '../../../core/services/wishlist.service';
import { CartService } from '../../../core/services/cart.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { Product } from '../../../models/product.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit {
  wishlist$!: Observable<Product[]>;
  wishlistCount$!: Observable<number>;

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.wishlist$ = this.wishlistService.getWishlist();
    this.wishlistCount$ = this.wishlistService.getWishlistCount();
  }

  removeFromWishlist(product: Product): void {
    this.snackbarService.confirm(
      `Remove "${product.name}" from wishlist?`,
      () => {
        this.wishlistService.removeFromWishlist(product.id).subscribe({
          next: () => {
            this.snackbarService.success('Product removed from wishlist');
          },
          error: (err) => {
            this.snackbarService.error('Failed to remove from wishlist. Please try again.');
            console.error('Error removing from wishlist:', err);
          }
        });
      }
    );
  }

  addToCart(product: Product): void {
    if (product.stock > 0) {
      this.cartService.addToCart(product, 1);
      this.snackbarService.success('Product added to cart!');
    } else {
      this.snackbarService.warning('Product is out of stock');
    }
  }

  clearWishlist(): void {
    this.snackbarService.confirm(
      'Clear entire wishlist?',
      () => {
        this.wishlistService.clearWishlist().subscribe({
          next: () => {
            this.snackbarService.success('Wishlist cleared');
          },
          error: (err) => {
            this.snackbarService.error('Failed to clear wishlist. Please try again.');
            console.error('Error clearing wishlist:', err);
          }
        });
      }
    );
  }

  getCurrentPrice(product: Product): number {
    if (product.discount) {
      return Math.round(product.price * (1 - product.discount / 100));
    }
    return product.price;
  }
}

