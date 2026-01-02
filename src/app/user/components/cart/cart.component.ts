import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { CartItem } from '../../../models/product.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cartItems$!: Observable<CartItem[]>;
  total$!: Observable<number>;

  constructor(
    private cartService: CartService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.cartItems$ = this.cartService.getCart();
  }

  getItemTotal(item: CartItem): number {
    const price = item.product.discount 
      ? item.product.price * (1 - item.product.discount / 100)
      : item.product.price;
    return price * item.quantity;
  }

  getTotal(cartItems: CartItem[]): number {
    return cartItems.reduce((total, item) => total + this.getItemTotal(item), 0);
  }

  updateQuantity(productId: string, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
  }

  removeItem(productId: string): void {
    this.cartService.removeFromCart(productId);
  }

  clearCart(): void {
    this.snackbarService.confirm(
      'Are you sure you want to clear the cart?',
      () => {
        this.cartService.clearCart();
        this.snackbarService.success('Cart cleared');
      }
    );
  }
}

