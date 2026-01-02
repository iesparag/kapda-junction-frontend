import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../core/services/data.service';
import { Product } from '../../../models/product.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-inventory-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventory-management.component.html',
  styleUrl: './inventory-management.component.css'
})
export class InventoryManagementComponent implements OnInit {
  products$!: Observable<Product[]>;
  totalProducts$!: Observable<number>;
  inStockCount$!: Observable<number>;
  lowStockCount$!: Observable<number>;
  outOfStockCount$!: Observable<number>;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.products$ = this.dataService.getAllProducts();
    
    this.totalProducts$ = this.products$.pipe(
      map(products => products.length)
    );
    
    this.inStockCount$ = this.products$.pipe(
      map(products => products.filter(p => p.stock > 10).length)
    );
    
    this.lowStockCount$ = this.products$.pipe(
      map(products => products.filter(p => p.stock > 0 && p.stock < 10).length)
    );
    
    this.outOfStockCount$ = this.products$.pipe(
      map(products => products.filter(p => p.stock === 0).length)
    );
  }

  getStockStatus(stock: number): string {
    if (stock === 0) return 'out-of-stock';
    if (stock < 10) return 'low-stock';
    return 'in-stock';
  }

  getStockStatusText(stock: number): string {
    if (stock === 0) return 'Out of Stock';
    if (stock < 10) return 'Low Stock';
    return 'In Stock';
  }
}

