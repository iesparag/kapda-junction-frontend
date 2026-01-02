import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./user/components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'module/:slug',
    loadComponent: () => import('./user/components/product-listing/product-listing.component').then(m => m.ProductListingComponent)
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./user/components/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('./user/components/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'wishlist',
    canActivate: [authGuard],
    loadComponent: () => import('./user/components/wishlist/wishlist.component').then(m => m.WishlistComponent)
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () => import('./user/components/checkout/checkout.component').then(m => m.CheckoutComponent)
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () => import('./user/components/orders/orders.component').then(m => m.OrdersComponent)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./admin/components/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    children: [
      {
        path: '',
        redirectTo: 'modules',
        pathMatch: 'full'
      },
      {
        path: 'modules',
        loadComponent: () => import('./admin/components/product-module-management/product-module-management.component').then(m => m.ProductModuleManagementComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./admin/components/category-management/category-management.component').then(m => m.CategoryManagementComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./admin/components/product-management/product-management.component').then(m => m.ProductManagementComponent)
      },
      {
        path: 'inventory',
        loadComponent: () => import('./admin/components/inventory-management/inventory-management.component').then(m => m.InventoryManagementComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./admin/components/order-management/order-management.component').then(m => m.OrderManagementComponent)
      },
      {
        path: 'delivery-config',
        loadComponent: () => import('./admin/components/delivery-config-management/delivery-config-management.component').then(m => m.DeliveryConfigManagementComponent)
      },
      {
        path: 'whatsapp-inquiries',
        loadComponent: () => import('./admin/components/whatsapp-inquiry-management/whatsapp-inquiry-management.component').then(m => m.WhatsAppInquiryManagementComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

