import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadService, UploadResponse } from '../../../core/services/upload.service';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.css'
})
export class ImageUploadComponent implements OnInit {
  @Input() existingImages: string[] = [];
  @Input() multiple: boolean = true;
  @Input() maxImages: number = 10;
  @Output() imagesChange = new EventEmitter<string[]>();

  uploadedImages: string[] = [];
  isUploading: boolean = false;
  uploadProgress: number = 0;
  errorMessage: string = '';

  constructor(private uploadService: UploadService) {}

  ngOnInit(): void {
    this.uploadedImages = [...this.existingImages];
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    
    // Check if adding these files would exceed maxImages
    if (this.uploadedImages.length + files.length > this.maxImages) {
      this.errorMessage = `Maximum ${this.maxImages} images allowed`;
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Only image files are allowed';
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'File size must be less than 5MB';
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    this.isUploading = true;
    this.uploadProgress = 0;
    this.errorMessage = '';

    if (this.multiple && validFiles.length > 1) {
      this.uploadMultiple(validFiles);
    } else {
      this.uploadSingle(validFiles[0]);
    }
  }

  uploadSingle(file: File): void {
    this.uploadService.uploadSingle(file).subscribe({
      next: (response) => {
        this.uploadedImages.push(response.secureUrl || response.url);
        this.imagesChange.emit([...this.uploadedImages]);
        this.isUploading = false;
        this.uploadProgress = 0;
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Upload failed. Please try again.';
        this.isUploading = false;
        this.uploadProgress = 0;
      }
    });
  }

  uploadMultiple(files: File[]): void {
    this.uploadService.uploadMultiple(files).subscribe({
      next: (response) => {
        const newUrls = response.images.map(img => img.secureUrl || img.url);
        this.uploadedImages.push(...newUrls);
        this.imagesChange.emit([...this.uploadedImages]);
        this.isUploading = false;
        this.uploadProgress = 0;
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Upload failed. Please try again.';
        this.isUploading = false;
        this.uploadProgress = 0;
      }
    });
  }

  removeImage(index: number): void {
    this.uploadedImages.splice(index, 1);
    this.imagesChange.emit([...this.uploadedImages]);
  }

  triggerFileInput(): void {
    const input = document.getElementById('image-upload-input') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'https://via.placeholder.com/200x200';
    }
  }
}

