import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product } from '../../models/product.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private apiUrl = environment.apiUrl;
  private wishlistSubject = new BehaviorSubject<Product[]>([]);
  public wishlist$ = this.wishlistSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Load wishlist when user is logged in
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadWishlist();
      } else {
        this.wishlistSubject.next([]);
      }
    });
  }

  private loadWishlist(): void {
    this.http.get<{ products: Product[] }>(`${this.apiUrl}/wishlist`).subscribe({
      next: (response) => {
        this.wishlistSubject.next(response.products || []);
      },
      error: (err) => {
        console.error('Error loading wishlist:', err);
        this.wishlistSubject.next([]);
      }
    });
  }

  getWishlist(): Observable<Product[]> {
    return this.wishlist$;
  }

  getWishlistItems(): Product[] {
    return this.wishlistSubject.value;
  }

  isInWishlist(productId: string): Observable<boolean> {
    return this.http.get<{ isInWishlist: boolean }>(`${this.apiUrl}/wishlist/check/${productId}`).pipe(
      map(response => response.isInWishlist)
    );
  }

  addToWishlist(product: Product): Observable<any> {
    return this.http.post(`${this.apiUrl}/wishlist`, { productId: product.id }).pipe(
      tap(() => {
        // Reload wishlist after adding
        this.loadWishlist();
      })
    );
  }

  removeFromWishlist(productId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/wishlist/${productId}`).pipe(
      tap(() => {
        // Reload wishlist after removing
        this.loadWishlist();
      })
    );
  }

  toggleWishlist(product: Product): Observable<any> {
    const isInWishlist = this.wishlistSubject.value.some(p => p.id === product.id);
    
    if (isInWishlist) {
      return this.removeFromWishlist(product.id);
    } else {
      return this.addToWishlist(product);
    }
  }

  clearWishlist(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/wishlist`).pipe(
      tap(() => {
        this.wishlistSubject.next([]);
      })
    );
  }

  getWishlistCount(): Observable<number> {
    return this.wishlist$.pipe(
      map(products => products.length)
    );
  }
}

