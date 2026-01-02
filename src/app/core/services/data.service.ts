import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ProductModule } from '../../models/product-module.model';
import { Category } from '../../models/category.model';
import { Product } from '../../models/product.model';
import { Order } from '../../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = environment.apiUrl;
  private productModulesSubject = new BehaviorSubject<ProductModule[]>([]);
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  private productsSubject = new BehaviorSubject<Product[]>([]);
  private ordersSubject = new BehaviorSubject<Order[]>([]);

  public productModules$ = this.productModulesSubject.asObservable();
  public categories$ = this.categoriesSubject.asObservable();
  public products$ = this.productsSubject.asObservable();
  public orders$ = this.ordersSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.getProductModules().subscribe();
    this.getCategories().subscribe();
    this.getProducts().subscribe();
  }

  // Product Module Methods
  getProductModules(): Observable<ProductModule[]> {
    return this.http.get<ProductModule[]>(`${this.apiUrl}/product-modules`).pipe(
      tap(modules => this.productModulesSubject.next(modules))
    );
  }

  getActiveProductModules(): Observable<ProductModule[]> {
    return this.productModules$.pipe(
      map(modules => modules.filter(m => m.isActive))
    );
  }

  getAllProductModules(): Observable<ProductModule[]> {
    return this.http.get<ProductModule[]>(`${this.apiUrl}/product-modules/all`).pipe(
      tap(modules => this.productModulesSubject.next(modules))
    );
  }

  getProductModuleById(id: string): Observable<ProductModule> {
    return this.http.get<ProductModule>(`${this.apiUrl}/product-modules/${id}`);
  }

  getProductModuleBySlug(slug: string): Observable<ProductModule> {
    return this.http.get<ProductModule>(`${this.apiUrl}/product-modules/slug/${slug}`);
  }

  addProductModule(module: Partial<ProductModule>): Observable<ProductModule> {
    return this.http.post<ProductModule>(`${this.apiUrl}/product-modules`, module).pipe(
      tap(() => this.getProductModules().subscribe())
    );
  }

  updateProductModule(module: ProductModule): Observable<ProductModule> {
    // Remove id from body, it's in the URL
    const { id, ...updateData } = module;
    return this.http.put<ProductModule>(`${this.apiUrl}/product-modules/${id}`, updateData).pipe(
      tap(() => this.getProductModules().subscribe())
    );
  }

  deleteProductModule(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/product-modules/${id}`).pipe(
      tap(() => this.getProductModules().subscribe())
    );
  }

  // Category Methods
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`).pipe(
      tap(categories => this.categoriesSubject.next(categories))
    );
  }

  getCategoriesByModule(moduleId: string): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories/module/${moduleId}`);
  }

  getSubcategories(categoryId: string): Observable<Category[]> {
    return this.categories$.pipe(
      map(categories => categories.filter(c => c.parentCategoryId === categoryId))
    );
  }

  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/categories/${id}`);
  }

  addCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, category).pipe(
      tap(() => this.getCategories().subscribe())
    );
  }

  updateCategory(category: Category): Observable<Category> {
    // Remove id from body, it's in the URL
    const { id, ...updateData } = category;
    return this.http.put<Category>(`${this.apiUrl}/categories/${id}`, updateData).pipe(
      tap(() => this.getCategories().subscribe())
    );
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`).pipe(
      tap(() => this.getCategories().subscribe())
    );
  }

  // Product Methods
  getProducts(moduleId?: string, categoryId?: string): Observable<Product[]> {
    let url = `${this.apiUrl}/products`;
    const params: string[] = [];
    if (moduleId) params.push(`moduleId=${moduleId}`);
    if (categoryId) params.push(`categoryId=${categoryId}`);
    if (params.length > 0) url += '?' + params.join('&');

    return this.http.get<Product[]>(url).pipe(
      tap(products => this.productsSubject.next(products))
    );
  }

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/all`).pipe(
      tap(products => this.productsSubject.next(products))
    );
  }

  getProductsByModule(moduleId: string): Observable<Product[]> {
    return this.getProducts(moduleId);
  }

  getProductsByCategory(categoryId: string): Observable<Product[]> {
    return this.getProducts(undefined, categoryId);
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  addProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, product).pipe(
      tap(() => this.getProducts().subscribe())
    );
  }

  updateProduct(product: Product): Observable<Product> {
    // Remove id from body, it's in the URL
    const { id, ...updateData } = product;
    return this.http.put<Product>(`${this.apiUrl}/products/${id}`, updateData).pipe(
      tap(() => this.getProducts().subscribe())
    );
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`).pipe(
      tap(() => this.getProducts().subscribe())
    );
  }

  updateProductStock(productId: string, quantity: number): Observable<Product> {
    return this.getProductById(productId).pipe(
      map(product => ({
        ...product,
        stock: Math.max(0, product.stock - quantity)
      })),
      tap(product => this.updateProduct(product).subscribe())
    );
  }

  // Order Methods
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders`).pipe(
      tap(orders => this.ordersSubject.next(orders))
    );
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${id}`);
  }

  addOrder(order: Partial<Order>): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders`, order).pipe(
      tap(() => {
        this.getOrders().subscribe();
        this.getProducts().subscribe(); // Refresh products to update stock
      })
    );
  }

  updateOrderStatus(orderId: string, status: Order['status']): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/orders/${orderId}/status`, { status }).pipe(
      tap(() => this.getOrders().subscribe())
    );
  }

  // Delivery Config Methods
  getDeliveryConfig(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/delivery-config`);
  }

  updateDeliveryConfig(config: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/delivery-config`, config);
  }

  calculateDeliveryCharges(data: { state: string; items: any[]; subtotal: number }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/delivery-config/calculate`, data);
  }
}
