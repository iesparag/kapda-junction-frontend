import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../models/product.model';
import { ProductModule } from '../../../models/product-module.model';
import { Category } from '../../../models/category.model';
import { Observable, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-product-listing',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductCardComponent],
  templateUrl: './product-listing.component.html',
  styleUrl: './product-listing.component.css'
})
export class ProductListingComponent implements OnInit {
  products$!: Observable<Product[]>;
  module$!: Observable<ProductModule | undefined>;
  categories$!: Observable<Category[]>;
  moduleSlug = '';
  selectedCategory = '';
  selectedSubcategory = '';
  sortBy = 'newest';
  minPrice = 0;
  maxPrice = 100000;
  cartItemCount$!: Observable<number>;
  showFilters = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.cartItemCount$ = this.cartService.getCart().pipe(
      map(cart => cart.reduce((count, item) => count + item.quantity, 0))
    );
    
    this.route.params.subscribe(params => {
      this.moduleSlug = params['slug'] || '';
      this.loadData();
    });

    this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['category'] || '';
      this.selectedSubcategory = params['subcategory'] || '';
      this.sortBy = params['sort'] || 'newest';
      this.minPrice = params['minPrice'] ? parseFloat(params['minPrice']) : 0;
      this.maxPrice = params['maxPrice'] ? parseFloat(params['maxPrice']) : 100000;
      this.loadData();
    });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  loadData(): void {
    if (this.moduleSlug) {
      this.module$ = this.dataService.getProductModuleBySlug(this.moduleSlug);
      
      this.module$.subscribe(module => {
        if (module) {
          this.products$ = this.dataService.getProductsByModule(module.id).pipe(
            map(products => this.filterAndSortProducts(products))
          );
          this.categories$ = this.dataService.getCategoriesByModule(module.id);
        }
      });
    } else {
      this.products$ = this.dataService.getProducts().pipe(
        map(products => products.filter(p => p.status === 'active')),
        map(products => this.filterAndSortProducts(products))
      );
      this.categories$ = this.dataService.getCategories();
    }
  }

  filterAndSortProducts(products: Product[]): Product[] {
    let filtered = [...products];

    // Filter by category
    if (this.selectedCategory) {
      filtered = filtered.filter(p => 
        p.categoryId === this.selectedCategory || 
        p.subcategoryId === this.selectedCategory
      );
    }

    // Filter by subcategory
    if (this.selectedSubcategory) {
      filtered = filtered.filter(p => p.subcategoryId === this.selectedSubcategory);
    }

    // Filter by price
    filtered = filtered.filter(p => {
      const price = p.discount 
        ? p.price * (1 - p.discount / 100)
        : p.price;
      return price >= this.minPrice && price <= this.maxPrice;
    });

    // Sort
    filtered.sort((a, b) => {
      const priceA = a.discount ? a.price * (1 - a.discount / 100) : a.price;
      const priceB = b.discount ? b.price * (1 - b.discount / 100) : b.price;

      switch (this.sortBy) {
        case 'price-low':
          return priceA - priceB;
        case 'price-high':
          return priceB - priceA;
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }

  onCategoryChange(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.selectedSubcategory = '';
    this.updateQueryParams();
  }

  onSubcategoryChange(subcategoryId: string): void {
    this.selectedSubcategory = subcategoryId;
    this.updateQueryParams();
  }

  onSortChange(sortBy: string): void {
    this.sortBy = sortBy;
    this.updateQueryParams();
  }

  onPriceFilterChange(): void {
    this.updateQueryParams();
  }

  updateQueryParams(): void {
    const queryParams: any = {};
    if (this.selectedCategory) queryParams.category = this.selectedCategory;
    if (this.selectedSubcategory) queryParams.subcategory = this.selectedSubcategory;
    if (this.sortBy !== 'newest') queryParams.sort = this.sortBy;
    if (this.minPrice > 0) queryParams.minPrice = this.minPrice;
    if (this.maxPrice < 100000) queryParams.maxPrice = this.maxPrice;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.selectedSubcategory = '';
    this.sortBy = 'newest';
    this.minPrice = 0;
    this.maxPrice = 100000;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
  }
}

