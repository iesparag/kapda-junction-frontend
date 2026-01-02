import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { SnackbarService, SnackbarMessage, SnackbarConfirm } from '../../../core/services/snackbar.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snackbar.component.html',
  styleUrl: './snackbar.component.css',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))
      ])
    ])
  ]
})
export class SnackbarComponent implements OnInit, OnDestroy {
  message: SnackbarMessage | null = null;
  confirm: SnackbarConfirm | null = null;
  private messageSubscription!: Subscription;
  private confirmSubscription!: Subscription;
  private timeoutId: any;

  constructor(private snackbarService: SnackbarService) {}

  ngOnInit(): void {
    this.messageSubscription = this.snackbarService.message$.subscribe(msg => {
      this.message = msg;
      if (msg) {
        this.clearTimeout();
        const duration = msg.duration || 3000;
        this.timeoutId = setTimeout(() => {
          this.dismiss();
        }, duration);
      }
    });

    this.confirmSubscription = this.snackbarService.confirm$.subscribe(confirm => {
      this.confirm = confirm;
    });
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    if (this.confirmSubscription) {
      this.confirmSubscription.unsubscribe();
    }
    this.clearTimeout();
  }

  dismiss(): void {
    this.clearTimeout();
    this.snackbarService.dismiss();
  }

  handleConfirm(): void {
    if (this.confirm) {
      this.confirm.onConfirm();
      this.snackbarService.dismissConfirm();
    }
  }

  handleCancel(): void {
    if (this.confirm) {
      if (this.confirm.onCancel) {
        this.confirm.onCancel();
      }
      this.snackbarService.dismissConfirm();
    }
  }

  private clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

