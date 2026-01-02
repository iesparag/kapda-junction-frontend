import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { Order } from '../../../models/order.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  orders$!: Observable<Order[]>;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    // In a real app, filter by current user ID
    this.orders$ = this.dataService.getOrders();
  }

  getTotalItems(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  getStatusClass(status: Order['status']): string {
    return `status-${status}`;
  }
}

