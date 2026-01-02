import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { ProductModule } from '../../../models/product-module.model';
import { Observable } from 'rxjs';
import { ImageUploadComponent } from '../../../shared/components/image-upload/image-upload.component';

@Component({
  selector: 'app-product-module-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUploadComponent],
  templateUrl: './product-module-management.component.html',
  styleUrl: './product-module-management.component.css'
})
export class ProductModuleManagementComponent implements OnInit {
  modules$!: Observable<ProductModule[]>;
  showForm = false;
  editingModule: ProductModule | null = null;
  
  formData: Partial<ProductModule> = {
    name: '',
    slug: '',
    icon: '',
    bannerImage: '',
    description: '',
    isActive: true
  };

  constructor(
    private dataService: DataService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.modules$ = this.dataService.getAllProductModules();
  }

  generateSlug(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  onNameChange(): void {
    if (this.formData.name && !this.editingModule) {
      this.formData.slug = this.generateSlug(this.formData.name);
    }
  }

  openAddForm(): void {
    this.showForm = true;
    this.editingModule = null;
    this.formData = {
      name: '',
      slug: '',
      icon: '',
      bannerImage: '',
      description: '',
      isActive: true
    };
  }

  openEditForm(module: ProductModule): void {
    this.showForm = true;
    this.editingModule = module;
    this.formData = { ...module };
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingModule = null;
    this.formData = {
      name: '',
      slug: '',
      icon: '',
      bannerImage: '',
      description: '',
      isActive: true
    };
  }

  saveModule(): void {
    if (!this.formData.name || !this.formData.slug) {
      this.snackbarService.warning('Name and slug are required');
      return;
    }

    if (this.editingModule) {
      // Create update payload without id field to avoid conflicts
      const updatePayload: ProductModule = {
        id: this.editingModule.id, // Keep id for the API call
        name: this.formData.name || this.editingModule.name,
        slug: this.formData.slug || this.editingModule.slug,
        icon: this.formData.icon !== undefined ? this.formData.icon : this.editingModule.icon,
        bannerImage: this.formData.bannerImage !== undefined ? this.formData.bannerImage : this.editingModule.bannerImage,
        description: this.formData.description !== undefined ? this.formData.description : this.editingModule.description,
        isActive: this.formData.isActive !== undefined ? this.formData.isActive : this.editingModule.isActive,
        createdAt: this.editingModule.createdAt,
        updatedAt: new Date()
      };
      
      this.dataService.updateProductModule(updatePayload).subscribe({
        next: () => {
          this.snackbarService.success('Module updated successfully!');
          this.modules$ = this.dataService.getAllProductModules();
          this.cancelForm();
        },
        error: (err) => {
          this.snackbarService.error('Failed to update module. Please try again.');
          console.error('Update error:', err);
        }
      });
    } else {
      // Don't send id - let MongoDB generate it
      const newModule: Partial<ProductModule> = {
        name: this.formData.name!,
        slug: this.formData.slug!,
        icon: this.formData.icon || '',
        bannerImage: this.formData.bannerImage || '',
        description: this.formData.description || '',
        isActive: this.formData.isActive ?? true
      };
      
      this.dataService.addProductModule(newModule).subscribe({
        next: () => {
          this.snackbarService.success('Module added successfully!');
          this.modules$ = this.dataService.getAllProductModules();
          this.cancelForm();
        },
        error: (err) => {
          this.snackbarService.error('Failed to add module. Please try again.');
          console.error('Add error:', err);
        }
      });
    }
  }

  toggleActive(module: ProductModule): void {
    const updated = {
      ...module,
      isActive: !module.isActive,
      updatedAt: new Date()
    };
    this.dataService.updateProductModule(updated).subscribe({
      next: () => {
        this.modules$ = this.dataService.getAllProductModules();
      },
      error: (err) => {
        this.snackbarService.error('Failed to update module status.');
        console.error('Toggle error:', err);
      }
    });
  }

  deleteModule(module: ProductModule): void {
    this.snackbarService.confirm(
      `Are you sure you want to delete "${module.name}"?`,
      () => {
        this.dataService.deleteProductModule(module.id).subscribe({
          next: () => {
            this.snackbarService.success('Module deleted successfully!');
            this.modules$ = this.dataService.getAllProductModules();
          },
          error: (err) => {
            this.snackbarService.error('Failed to delete module.');
            console.error('Delete error:', err);
          }
        });
      }
    );
  }

  onBannerImageChange(images: string[]): void {
    this.formData.bannerImage = images.length > 0 ? images[0] : '';
  }

  getBannerImageArray(): string[] {
    return this.formData.bannerImage ? [this.formData.bannerImage] : [];
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'https://via.placeholder.com/200x100';
    }
  }
}

