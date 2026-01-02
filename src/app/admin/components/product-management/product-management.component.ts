import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { Product } from '../../../models/product.model';
import { ProductModule } from '../../../models/product-module.model';
import { Category } from '../../../models/category.model';
import { Observable, Subscription } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { ImageUploadComponent } from '../../../shared/components/image-upload/image-upload.component';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUploadComponent],
  templateUrl: './product-management.component.html',
  styleUrl: './product-management.component.css'
})
export class ProductManagementComponent implements OnInit, OnDestroy {
  products$!: Observable<Product[]>;
  modules$!: Observable<ProductModule[]>;
  categories$!: Observable<Category[]>;
  showForm = false;
  editingProduct: Product | null = null;
  
  // Cached data to avoid multiple subscriptions
  categories: Category[] = [];
  modules: ProductModule[] = [];
  availableCategories: Category[] = [];
  availableSubcategories: Category[] = [];
  
  private subscriptions = new Subscription();
  
  formData: Partial<Product> = {
    name: '',
    description: '',
    images: [],
    price: 0,
    discount: 0,
    stock: 0,
    productModuleId: '',
    categoryId: '',
    subcategoryId: '',
    status: 'active'
  };

  constructor(
    private dataService: DataService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.products$ = this.dataService.getAllProducts();
    this.modules$ = this.dataService.getAllProductModules().pipe(shareReplay(1));
    this.categories$ = this.dataService.getCategories().pipe(shareReplay(1));
    
    // Subscribe once and cache data
    this.subscriptions.add(
      this.categories$.subscribe(cats => {
        this.categories = cats;
        this.updateAvailableCategories();
      })
    );
    
    this.subscriptions.add(
      this.modules$.subscribe(mods => {
        this.modules = mods;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onModuleChange(): void {
    // Reset category and subcategory when module changes
    this.formData.categoryId = '';
    this.formData.subcategoryId = '';
    this.updateAvailableCategories();
  }

  onCategoryChange(): void {
    // Reset subcategory when category changes
    this.formData.subcategoryId = '';
    this.updateAvailableSubcategories();
  }

  updateAvailableCategories(): void {
    if (!this.formData.productModuleId) {
      this.availableCategories = [];
      this.availableSubcategories = [];
      return;
    }
    
    // Filter by module and exclude subcategories (only main categories)
    this.availableCategories = this.categories.filter(c => 
      c.productModuleId === this.formData.productModuleId && 
      !c.parentCategoryId
    );
    
    // Update subcategories if category is selected
    this.updateAvailableSubcategories();
  }

  updateAvailableSubcategories(): void {
    if (!this.formData.categoryId) {
      this.availableSubcategories = [];
      return;
    }
    
    // Filter subcategories by parent category
    this.availableSubcategories = this.categories.filter(c => 
      c.parentCategoryId === this.formData.categoryId
    );
  }

  getCategoriesByModule(moduleId: string): Category[] {
    if (!moduleId) return [];
    return this.categories.filter(c => 
      c.productModuleId === moduleId && 
      !c.parentCategoryId
    );
  }

  getSubcategories(categoryId: string): Category[] {
    if (!categoryId) return [];
    return this.categories.filter(c => c.parentCategoryId === categoryId);
  }

  getModuleName(moduleId: string): string {
    const module = this.modules.find(m => m.id === moduleId);
    return module ? module.name : 'Unknown';
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  openAddForm(): void {
    this.showForm = true;
    this.editingProduct = null;
    this.formData = {
      name: '',
      description: '',
      images: [],
      price: 0,
      discount: 0,
      stock: 0,
      productModuleId: '',
      categoryId: '',
      subcategoryId: '',
      status: 'active'
    };
  }

  openEditForm(product: Product): void {
    this.showForm = true;
    this.editingProduct = product;
    this.formData = { ...product };
    // Update available categories and subcategories when editing
    this.updateAvailableCategories();
    this.updateAvailableSubcategories();
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingProduct = null;
  }

  onImagesChange(images: string[]): void {
    this.formData.images = images;
  }

  saveProduct(): void {
    if (!this.formData.name || !this.formData.productModuleId || !this.formData.categoryId) {
      this.snackbarService.warning('Name, product module, and category are required');
      return;
    }

    if (this.editingProduct) {
      const updated: Product = {
        ...this.editingProduct,
        ...this.formData,
        images: this.formData.images || [],
        subcategoryId: this.formData.subcategoryId || undefined,
        updatedAt: new Date()
      } as Product;
      
      this.dataService.updateProduct(updated).subscribe({
        next: () => {
          this.snackbarService.success('Product updated successfully!');
          this.refreshProducts();
          this.cancelForm();
        },
        error: (err) => {
          this.snackbarService.error('Failed to update product. Please try again.');
          console.error('Update error:', err);
        }
      });
    } else {
      // Don't send id - let MongoDB generate it
      const newProduct: Partial<Product> = {
        name: this.formData.name!,
        description: this.formData.description || '',
        images: this.formData.images || [],
        price: this.formData.price || 0,
        discount: this.formData.discount || undefined,
        stock: this.formData.stock || 0,
        productModuleId: this.formData.productModuleId!,
        categoryId: this.formData.categoryId!,
        subcategoryId: this.formData.subcategoryId || undefined,
        status: this.formData.status || 'active'
      };
      
      this.dataService.addProduct(newProduct).subscribe({
        next: () => {
          this.snackbarService.success('Product added successfully!');
          this.refreshProducts();
          this.cancelForm();
        },
        error: (err) => {
          this.snackbarService.error('Failed to add product. Please try again.');
          console.error('Add error:', err);
        }
      });
    }
  }

  toggleStatus(product: Product): void {
    const updated = {
      ...product,
      status: product.status === 'active' ? 'inactive' : 'active' as 'active' | 'inactive',
      updatedAt: new Date()
    };
    this.dataService.updateProduct(updated).subscribe({
      next: () => {
        this.refreshProducts();
      },
      error: (err) => {
        this.snackbarService.error('Failed to update product status.');
        console.error('Toggle error:', err);
      }
    });
  }

  deleteProduct(product: Product): void {
    this.snackbarService.confirm(
      `Are you sure you want to delete "${product.name}"?`,
      () => {
        this.dataService.deleteProduct(product.id).subscribe({
          next: () => {
            this.snackbarService.success('Product deleted successfully!');
            this.refreshProducts();
          },
          error: (err) => {
            this.snackbarService.error('Failed to delete product.');
            console.error('Delete error:', err);
          }
        });
      }
    );
  }

  refreshProducts(): void {
    this.products$ = this.dataService.getAllProducts();
  }
}

