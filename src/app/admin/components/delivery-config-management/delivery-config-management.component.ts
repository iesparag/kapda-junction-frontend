import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { Product } from '../../../models/product.model';
import { Observable } from 'rxjs';

interface DeliveryConfig {
  id?: string;
  stateCharges: { [key: string]: number };
  productCharges: { [key: string]: number };
  packagingCharge: number;
  freeDeliveryThreshold: number;
  whatsappNumber: string;
}

@Component({
  selector: 'app-delivery-config-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delivery-config-management.component.html',
  styleUrl: './delivery-config-management.component.css'
})
export class DeliveryConfigManagementComponent implements OnInit {
  config: DeliveryConfig = {
    stateCharges: {},
    productCharges: {},
    packagingCharge: 50,
    freeDeliveryThreshold: 1000,
    whatsappNumber: ''
  };
  
  products$!: Observable<Product[]>;
  states: string[] = [];
  newState: string = '';
  newStateCharge: number = 0;
  selectedProductId: string = '';
  newProductCharge: number = 0;
  isSaving = false;

  constructor(
    private dataService: DataService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.loadConfig();
    this.products$ = this.dataService.getAllProducts();
    this.states = [
      'Gujarat', 'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu',
      'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Punjab', 'Haryana',
      'Madhya Pradesh', 'Andhra Pradesh', 'Kerala'
    ];
  }

  loadConfig(): void {
    this.dataService.getDeliveryConfig().subscribe({
      next: (config) => {
        if (config) {
          this.config = {
            stateCharges: config.stateCharges || {},
            productCharges: config.productCharges || {},
            packagingCharge: config.packagingCharge || 50,
            freeDeliveryThreshold: config.freeDeliveryThreshold || 1000,
            whatsappNumber: config.whatsappNumber || '',
            id: config.id
          };
        }
      },
      error: (err) => {
        console.error('Error loading config:', err);
      }
    });
  }

  addStateCharge(): void {
    if (this.newState && this.newStateCharge > 0) {
      this.config.stateCharges[this.newState] = this.newStateCharge;
      this.newState = '';
      this.newStateCharge = 0;
    }
  }

  removeStateCharge(state: string): void {
    delete this.config.stateCharges[state];
  }

  addProductCharge(): void {
    if (this.selectedProductId && this.newProductCharge > 0) {
      this.config.productCharges[this.selectedProductId] = this.newProductCharge;
      this.selectedProductId = '';
      this.newProductCharge = 0;
    }
  }

  removeProductCharge(productId: string): void {
    delete this.config.productCharges[productId];
  }

  getProductName(products: Product[], productId: string): string {
    const product = products.find(p => p.id === productId);
    return product ? product.name : productId;
  }

  getStateKeys(): string[] {
    return Object.keys(this.config.stateCharges);
  }

  getProductKeys(): string[] {
    return Object.keys(this.config.productCharges);
  }

  hasStateCharges(): boolean {
    return Object.keys(this.config.stateCharges).length > 0;
  }

  hasProductCharges(): boolean {
    return Object.keys(this.config.productCharges).length > 0;
  }

  saveConfig(): void {
    this.isSaving = true;
    this.dataService.updateDeliveryConfig(this.config).subscribe({
      next: () => {
        this.snackbarService.success('Delivery configuration saved successfully!');
        this.isSaving = false;
      },
      error: (err) => {
        this.snackbarService.error('Failed to save configuration. Please try again.');
        console.error(err);
        this.isSaving = false;
      }
    });
  }
}

