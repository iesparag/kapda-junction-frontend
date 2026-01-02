import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { Category } from '../../../models/category.model';
import { ProductModule } from '../../../models/product-module.model';
import { Observable, combineLatest, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ImageUploadComponent } from '../../../shared/components/image-upload/image-upload.component';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUploadComponent],
  templateUrl: './category-management.component.html',
  styleUrl: './category-management.component.css'
})
export class CategoryManagementComponent implements OnInit, OnDestroy {
  categories$!: Observable<Category[]>;
  modules$!: Observable<ProductModule[]>;
  mainCategories$!: Observable<Category[]>;
  showForm = false;
  editingCategory: Category | null = null;
  
  // Cached data to avoid multiple subscriptions
  categories: Category[] = [];
  modules: ProductModule[] = [];
  mainCategories: Category[] = [];
  availableParentCategories: Category[] = [];
  
  private subscriptions = new Subscription();
  
  formData: Partial<Category> = {
    name: '',
    slug: '',
    productModuleId: '',
    parentCategoryId: '',
    description: '',
    image: '',
    isActive: true
  };

  constructor(
    private dataService: DataService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.categories$ = this.dataService.getCategories().pipe(shareReplay(1));
    this.modules$ = this.dataService.getProductModules().pipe(shareReplay(1));
    
    // Subscribe once and cache data
    this.subscriptions.add(
      this.categories$.subscribe(cats => {
        this.categories = cats;
        this.mainCategories = cats.filter(c => !c.parentCategoryId);
        this.updateAvailableParentCategories();
      })
    );
    
    this.subscriptions.add(
      this.modules$.subscribe(mods => {
        this.modules = mods;
      })
    );
    
    this.mainCategories$ = this.categories$.pipe(
      map(cats => cats.filter(c => !c.parentCategoryId))
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  generateSlug(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  onNameChange(): void {
    if (this.formData.name && !this.editingCategory) {
      this.formData.slug = this.generateSlug(this.formData.name);
    }
  }

  onModuleChange(): void {
    // Reset parent category when module changes
    this.formData.parentCategoryId = '';
    // Update available parent categories
    this.updateAvailableParentCategories();
  }

  updateAvailableParentCategories(): void {
    if (!this.formData.productModuleId) {
      this.availableParentCategories = [];
      return;
    }
    
    // Filter by module and exclude subcategories (only main categories)
    this.availableParentCategories = this.categories.filter(c => 
      c.productModuleId === this.formData.productModuleId && 
      !c.parentCategoryId &&
      c.id !== this.editingCategory?.id // Exclude current category if editing
    );
  }

  getCategoriesByModule(moduleId: string): Category[] {
    if (!moduleId) return [];
    // Filter by module and exclude subcategories (only main categories)
    return this.categories.filter(c => 
      c.productModuleId === moduleId && 
      !c.parentCategoryId &&
      c.id !== this.editingCategory?.id // Exclude current category if editing
    );
  }

  getMainCategories(): Category[] {
    return this.mainCategories;
  }

  getSubcategoriesForCategory(categoryId: string): Category[] {
    return this.categories.filter(c => c.parentCategoryId === categoryId);
  }

  getSubcategories(categoryId: string): Category[] {
    return this.categories.filter(c => c.parentCategoryId === categoryId);
  }

  openAddForm(): void {
    this.showForm = true;
    this.editingCategory = null;
    this.formData = {
      name: '',
      slug: '',
      productModuleId: '',
      parentCategoryId: '',
      description: '',
      image: '',
      isActive: true
    };
  }

  openEditForm(category: Category): void {
    this.showForm = true;
    this.editingCategory = category;
    this.formData = { ...category };
    // Update available parent categories when editing
    this.updateAvailableParentCategories();
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingCategory = null;
    this.formData = {
      name: '',
      slug: '',
      productModuleId: '',
      parentCategoryId: '',
      description: '',
      image: '',
      isActive: true
    };
  }

  saveCategory(): void {
    if (!this.formData.name || !this.formData.slug || !this.formData.productModuleId) {
      this.snackbarService.warning('Name, slug, and product module are required');
      return;
    }

    if (this.editingCategory) {
      const updated: any = {
        ...this.editingCategory,
        ...this.formData,
        updatedAt: new Date()
      };
      
      // Handle parentCategoryId - set to undefined if empty, otherwise use the value
      if (this.formData.parentCategoryId && this.formData.parentCategoryId.trim() !== '') {
        updated.parentCategoryId = this.formData.parentCategoryId.trim();
      } else {
        // Explicitly set to undefined to remove parent category
        updated.parentCategoryId = undefined;
      }
      
      // Remove id and _id from update payload
      delete updated.id;
      delete updated._id;
      
      console.log('Updating category with data:', updated); // Debug log
      
      this.dataService.updateCategory(updated).subscribe({
        next: () => {
          this.snackbarService.success('Category updated successfully!');
          this.refreshCategories();
          this.cancelForm();
        },
        error: (err) => {
          this.snackbarService.error('Failed to update category. Please try again.');
          console.error('Update error:', err);
        }
      });
    } else {
      // Don't send id - let MongoDB generate it
      const newCategory: any = {
        name: this.formData.name!,
        slug: this.formData.slug!,
        productModuleId: this.formData.productModuleId!,
        description: this.formData.description || '',
        image: this.formData.image || '',
        isActive: this.formData.isActive ?? true
      };
      
      // Only include parentCategoryId if it has a value
      if (this.formData.parentCategoryId && this.formData.parentCategoryId.trim() !== '') {
        newCategory.parentCategoryId = this.formData.parentCategoryId.trim();
      }
      
      console.log('Creating category with data:', newCategory); // Debug log
      
      this.dataService.addCategory(newCategory).subscribe({
        next: () => {
          this.snackbarService.success('Category added successfully!');
          this.refreshCategories();
          this.cancelForm();
        },
        error: (err) => {
          this.snackbarService.error('Failed to add category. Please try again.');
          console.error('Add error:', err);
        }
      });
    }
  }

  refreshCategories(): void {
    this.dataService.getCategories().subscribe(cats => {
      this.categories = cats;
      this.mainCategories = cats.filter(c => !c.parentCategoryId);
      this.updateAvailableParentCategories();
    });
  }

  toggleActive(category: Category): void {
    const updated = {
      ...category,
      isActive: !category.isActive,
      updatedAt: new Date()
    };
    this.dataService.updateCategory(updated).subscribe({
      next: () => {
        this.refreshCategories();
      },
      error: (err) => {
        this.snackbarService.error('Failed to update category status.');
        console.error('Toggle error:', err);
      }
    });
  }

  deleteCategory(category: Category): void {
    this.snackbarService.confirm(
      `Are you sure you want to delete "${category.name}"?`,
      () => {
        this.dataService.deleteCategory(category.id).subscribe({
          next: () => {
            this.snackbarService.success('Category deleted successfully!');
            this.refreshCategories();
          },
          error: (err) => {
            this.snackbarService.error('Failed to delete category.');
            console.error('Delete error:', err);
          }
        });
      }
    );
  }

  getModuleName(moduleId: string): string {
    const module = this.modules.find(m => m.id === moduleId);
    return module ? module.name : 'Unknown';
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'None';
  }

  onImageChange(images: string[]): void {
    this.formData.image = images.length > 0 ? images[0] : '';
  }

  getImageArray(): string[] {
    return this.formData.image ? [this.formData.image] : [];
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'https://via.placeholder.com/150x150';
    }
  }
}

