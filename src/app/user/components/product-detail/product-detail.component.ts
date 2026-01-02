import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { CartService } from '../../../core/services/cart.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { WhatsAppInquiryModalComponent } from '../../../shared/components/whatsapp-inquiry-modal/whatsapp-inquiry-modal.component';
import { Product } from '../../../models/product.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, WhatsAppInquiryModalComponent],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  product$!: Observable<Product | undefined>;
  quantity = 1;
  selectedImageIndex = 0;
  showInquiryModal = false;
  currentProduct: Product | null = null;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private dataService: DataService,
    private cartService: CartService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = params['id'];
      if (productId) {
        this.product$ = this.dataService.getProductById(productId);
        this.product$.subscribe(product => {
          if (product) {
            this.currentProduct = product;
          }
        });
      }
    });
  }

  openInquiryModal(): void {
    this.showInquiryModal = true;
  }

  closeInquiryModal(): void {
    this.showInquiryModal = false;
  }

  getCurrentPrice(product: Product): number {
    if (product.discount) {
      return product.price * (1 - product.discount / 100);
    }
    return product.price;
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  increaseQuantity(): void {
    this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(product: Product): void {
    if (product.stock < this.quantity) {
      this.snackbarService.warning('Insufficient stock available');
      return;
    }
    this.cartService.addToCart(product, this.quantity);
    this.snackbarService.success('Product added to cart!');
  }

  buyNow(product: Product): void {
    if (product.stock < this.quantity) {
      this.snackbarService.warning('Insufficient stock available');
      return;
    }
    this.cartService.addToCart(product, this.quantity);
    this.router.navigate(['/checkout']);
  }
}

