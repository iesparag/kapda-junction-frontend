import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface UploadResponse {
  url: string;
  publicId: string;
  secureUrl: string;
}

export interface MultipleUploadResponse {
  images: UploadResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  uploadSingle(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<UploadResponse>(`${this.apiUrl}/upload/single`, formData);
  }

  uploadMultiple(files: File[]): Observable<MultipleUploadResponse> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    return this.http.post<MultipleUploadResponse>(`${this.apiUrl}/upload/multiple`, formData);
  }

  deleteImage(publicId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/upload`, {
      body: { publicId }
    });
  }
}

