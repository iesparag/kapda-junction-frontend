import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SnackbarMessage {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export interface SnackbarConfirm {
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  private messageSubject = new BehaviorSubject<SnackbarMessage | null>(null);
  public message$ = this.messageSubject.asObservable();

  private confirmSubject = new BehaviorSubject<SnackbarConfirm | null>(null);
  public confirm$ = this.confirmSubject.asObservable();

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration: number = 3000): void {
    this.messageSubject.next({ message, type, duration });
  }

  success(message: string, duration: number = 3000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 4000): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration: number = 3000): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration: number = 3000): void {
    this.show(message, 'warning', duration);
  }

  confirm(message: string, onConfirm: () => void, onCancel?: () => void): void {
    this.confirmSubject.next({ message, onConfirm, onCancel });
  }

  dismiss(): void {
    this.messageSubject.next(null);
  }

  dismissConfirm(): void {
    this.confirmSubject.next(null);
  }
}

