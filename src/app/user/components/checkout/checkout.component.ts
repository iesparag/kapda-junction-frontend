import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { DataService } from '../../../core/services/data.service';
import { AuthService } from '../../../core/services/auth.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { CartItem } from '../../../models/product.model';
import { Order } from '../../../models/order.model';
import { Observable, combineLatest } from 'rxjs';
import { map, switchMap, debounceTime, distinctUntilChanged, take } from 'rxjs/operators';
import { INDIAN_STATES, getCitiesByState, getPincodesByCity, getStateNames, City } from '../../../core/data/indian-addresses';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  cartItems$!: Observable<CartItem[]>;
  shippingAddress = {
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  };

  states: string[] = [];
  cities: City[] = [];
  pincodes: string[] = [];
  
  packagingCharge: number = 0;
  deliveryCharge: number = 0;
  isFreeDelivery: boolean = false;
  subtotal: number = 0;

  constructor(
    private cartService: CartService,
    private dataService: DataService,
    private authService: AuthService,
    private router: Router,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.states = getStateNames();
    this.cartItems$ = this.cartService.getCart();
    
    // Check if cart is empty
    this.cartItems$.subscribe(items => {
      if (items.length === 0) {
        this.router.navigate(['/cart']);
      } else {
        this.calculateCharges(items);
      }
    });
  }

  onStateChange(): void {
    this.cities = getCitiesByState(this.shippingAddress.state);
    this.shippingAddress.city = '';
    this.shippingAddress.zipCode = '';
    this.pincodes = [];
    this.calculateChargesForCurrentState();
  }

  onCityChange(): void {
    this.pincodes = getPincodesByCity(this.shippingAddress.state, this.shippingAddress.city);
    this.shippingAddress.zipCode = '';
    this.calculateChargesForCurrentState();
  }

  onZipCodeChange(): void {
    this.calculateChargesForCurrentState();
  }

  calculateChargesForCurrentState(): void {
    this.cartItems$.pipe(take(1)).subscribe(items => {
      this.calculateCharges(items);
    });
  }

  calculateCharges(cartItems: CartItem[]): void {
    if (!this.shippingAddress.state || cartItems.length === 0) {
      this.packagingCharge = 0;
      this.deliveryCharge = 0;
      this.isFreeDelivery = false;
      return;
    }

    this.subtotal = this.getTotal(cartItems);
    
    const items = cartItems.map(item => ({
      productId: item.product.id,
      quantity: item.quantity
    }));

    this.dataService.calculateDeliveryCharges({
      state: this.shippingAddress.state,
      items: items,
      subtotal: this.subtotal
    }).subscribe({
      next: (result) => {
        this.packagingCharge = result.packagingCharge || 0;
        this.deliveryCharge = result.deliveryCharge || 0;
        this.isFreeDelivery = result.isFreeDelivery || false;
      },
      error: (err) => {
        console.error('Error calculating charges:', err);
        // Set default values on error
        this.packagingCharge = 50;
        this.deliveryCharge = 100;
        this.isFreeDelivery = false;
      }
    });
  }

  getTotal(cartItems: CartItem[]): number {
    return cartItems.reduce((total, item) => {
      const price = item.product.discount 
        ? item.product.price * (1 - item.product.discount / 100)
        : item.product.price;
      return total + (price * item.quantity);
    }, 0);
  }

  getFinalTotal(cartItems: CartItem[]): number {
    return this.subtotal + this.packagingCharge + this.deliveryCharge;
  }

  placeOrder(cartItems: CartItem[]): void {
    if (!this.shippingAddress.name || !this.shippingAddress.address || 
        !this.shippingAddress.city || !this.shippingAddress.state || 
        !this.shippingAddress.zipCode || !this.shippingAddress.phone) {
      this.snackbarService.warning('Please fill in all shipping address fields');
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user) {
      this.snackbarService.warning('Please login to place order');
      this.router.navigate(['/login']);
      return;
    }

    const orderData = {
      items: cartItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.discount 
          ? item.product.price * (1 - item.product.discount / 100)
          : item.product.price,
        discount: item.product.discount
      })),
      subtotal: this.subtotal,
      packagingCharge: this.packagingCharge,
      deliveryCharge: this.deliveryCharge,
      totalAmount: this.getFinalTotal(cartItems),
      shippingAddress: { ...this.shippingAddress }
    };

    this.dataService.addOrder(orderData).subscribe({
      next: () => {
        this.cartService.clearCart();
        this.snackbarService.success('Order placed successfully!');
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        this.snackbarService.error('Failed to place order. Please try again.');
        console.error(err);
      }
    });
  }
}

