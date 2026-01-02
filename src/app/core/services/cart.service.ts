import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from '../../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  public cart$ = this.cartSubject.asObservable();

  constructor() {
    this.loadCartFromStorage();
  }

  private loadCartFromStorage(): void {
    const stored = localStorage.getItem('cart');
    if (stored) {
      try {
        const cart = JSON.parse(stored);
        this.cartSubject.next(cart);
      } catch (e) {
        this.cartSubject.next([]);
      }
    }
  }

  private saveCartToStorage(cart: CartItem[]): void {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  getCart(): Observable<CartItem[]> {
    return this.cart$;
  }

  getCartItems(): CartItem[] {
    return this.cartSubject.value;
  }

  getCartTotal(): number {
    return this.cartSubject.value.reduce((total, item) => {
      const price = item.product.discount 
        ? item.product.price * (1 - item.product.discount / 100)
        : item.product.price;
      return total + (price * item.quantity);
    }, 0);
  }

  getCartItemCount(): number {
    return this.cartSubject.value.reduce((count, item) => count + item.quantity, 0);
  }

  addToCart(product: CartItem['product'], quantity: number = 1): void {
    const current = this.cartSubject.value;
    const existingIndex = current.findIndex(item => item.product.id === product.id);

    if (existingIndex !== -1) {
      current[existingIndex].quantity += quantity;
    } else {
      current.push({ product, quantity });
    }

    this.cartSubject.next([...current]);
    this.saveCartToStorage(current);
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const current = this.cartSubject.value;
    const index = current.findIndex(item => item.product.id === productId);
    
    if (index !== -1) {
      current[index].quantity = quantity;
      this.cartSubject.next([...current]);
      this.saveCartToStorage(current);
    }
  }

  removeFromCart(productId: string): void {
    const current = this.cartSubject.value;
    const filtered = current.filter(item => item.product.id !== productId);
    this.cartSubject.next(filtered);
    this.saveCartToStorage(filtered);
  }

  clearCart(): void {
    this.cartSubject.next([]);
    localStorage.removeItem('cart');
  }
}

