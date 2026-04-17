import { Component, inject, input, signal, Signal } from '@angular/core';
import { Product } from '../../types/product';
import { DatePipe, UpperCasePipe, CurrencyPipe } from '@angular/common';
import { ProductService } from '../product-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-details',
  imports: [DatePipe, UpperCasePipe, CurrencyPipe],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails {
  private productService = inject(ProductService);
  private router = inject(Router);

  isLoading = this.productService.isLoading;
  errorMessage = this.productService.errorMessage;

  id = input.required<number>();

  product: Signal<Product | null> = signal(null);

  ngOnInit() {
    this.product = this.productService.getProductById(this.id());

    setTimeout(() => { this.productService.resetError() }, 3000);
  }

  async deleteProduct() {
    await this.productService.deleteProduct(this.id());
    this.router.navigate(['/products']);
  }
}
