import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../core/services/data.service';
import { Order } from '../../../models/order.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-management.component.html',
  styleUrl: './order-management.component.css'
})
export class OrderManagementComponent implements OnInit {
  orders$!: Observable<Order[]>;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.orders$ = this.dataService.getOrders();
  }

  updateOrderStatus(orderId: string, status: Order['status']): void {
    this.dataService.updateOrderStatus(orderId, status).subscribe();
  }

  getStatusClass(status: Order['status']): string {
    return `status-${status}`;
  }

  getTotalItems(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}

