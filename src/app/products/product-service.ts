import { inject, Injectable, Signal, signal } from '@angular/core';
import { ApiService } from '../api/api-service';
import { Product } from '../types/product';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {

  private apiService = inject(ApiService);
  private products = signal<Product[]>([]);
  private selectedProduct = signal<Product | null>(null);

  private loading = signal(false);
  isLoading = this.loading.asReadonly();

  private error = signal<string | null>(null);
  errorMessage = this.error.asReadonly();

  resetError() {
    this.error.set(null);
  }

  private loadProducts() {
    this.loading.set(true);
    this.apiService.loadProducts().subscribe(
      {
        next: (products) => {
          this.products.set(products);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Failed to load products');
          this.loading.set(false);
        }
      }
    );
  }

  getProducts() {
    if (this.products().length === 0 && !this.loading()) {
      this.loadProducts();
    }
    return this.products.asReadonly();
  }

  getProductById(id: number): Signal<Product | null> {
    const product = this.products().find((p) => p.id === id);

    if (!product) {
      this.loadProduct(id);
    } else {
      this.selectedProduct.set(product);
    }

    return this.selectedProduct.asReadonly();
  }

  private loadProduct(id: number): void {
    this.loading.set(true);
    this.apiService.loadProduct(id).subscribe({
      next: (product) => {
        this.loading.set(false);
        this.selectedProduct.set(product);
      },
      error: (err) => {
        this.error.set('Failed to load product.');
        this.loading.set(false);
      }
    });
  }


  async createProduct(newProduct: Omit<Product, 'id'>): Promise<void> {
    try {
      const product = await firstValueFrom(this.apiService.createProduct(newProduct));
      this.products.update((products) => [...products, product]);
      console.log('Product saved on the server with id: ' + product.id);
    } catch (error) {
      this.error.set('Failed to save product.');
      throw error;
    }
  }


  async deleteProduct(id: number): Promise<void>  {
    try {
      await firstValueFrom(this.apiService.deleteProduct(id));
      this.products.update(products => products.filter(p => p.id !== id));
      console.log('Product deleted');
    } catch (error) {
      this.error.set('Failed to delete product.');
      throw error;
    }
  }

}
