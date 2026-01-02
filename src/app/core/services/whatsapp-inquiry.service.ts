import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface WhatsAppInquiry {
  id?: string;
  productId: string;
  productName: string;
  productLink: string;
  productPrice: number;
  productImage?: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  message: string;
  status?: 'pending' | 'responded' | 'closed';
  whatsappUrl?: string;
  whatsappMessage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InquiryRequest {
  productId: string;
  message?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WhatsAppInquiryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createInquiry(inquiry: InquiryRequest): Observable<WhatsAppInquiry> {
    return this.http.post<WhatsAppInquiry>(`${this.apiUrl}/whatsapp-inquiries`, inquiry);
  }

  getAllInquiries(filters?: { status?: string; productId?: string; userId?: string }): Observable<WhatsAppInquiry[]> {
    let url = `${this.apiUrl}/whatsapp-inquiries`;
    if (filters) {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.productId) params.append('productId', filters.productId);
      if (filters.userId) params.append('userId', filters.userId);
      if (params.toString()) {
        url += '?' + params.toString();
      }
    }
    return this.http.get<WhatsAppInquiry[]>(url);
  }

  getInquiryById(id: string): Observable<WhatsAppInquiry> {
    return this.http.get<WhatsAppInquiry>(`${this.apiUrl}/whatsapp-inquiries/${id}`);
  }

  updateInquiryStatus(id: string, status: 'pending' | 'responded' | 'closed'): Observable<any> {
    return this.http.patch(`${this.apiUrl}/whatsapp-inquiries/${id}/status`, { status });
  }

  deleteInquiry(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/whatsapp-inquiries/${id}`);
  }

  getStats(): Observable<{ total: number; pending: number; responded: number; closed: number }> {
    return this.http.get<{ total: number; pending: number; responded: number; closed: number }>(
      `${this.apiUrl}/whatsapp-inquiries/stats/summary`
    );
  }

  resendMessage(inquiryId: string): Observable<{ success: boolean; message?: string; error?: string; messageId?: string }> {
    return this.http.post<{ success: boolean; message?: string; error?: string; messageId?: string }>(
      `${this.apiUrl}/whatsapp-inquiries/${inquiryId}/resend`,
      {}
    );
  }
}

