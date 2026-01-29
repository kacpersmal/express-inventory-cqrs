export interface ProductDto {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductForOrderDto {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

export interface IProductReadRepository {
  findById(id: string): Promise<ProductDto | null>;
  findByIds(ids: string[]): Promise<ProductDto[]>;
  findAll(filter?: ProductFilter): Promise<ProductDto[]>;
  count(filter?: ProductFilter): Promise<number>;
  getProductForOrder(id: string): Promise<ProductForOrderDto | null>;
}

export interface IProductWriteRepository {
  create(product: CreateProductData): Promise<ProductDto>;
  updateStock(id: string, stockDelta: number): Promise<ProductDto | null>;
  update(id: string, data: UpdateProductData): Promise<ProductDto | null>;
  delete(id: string): Promise<boolean>;
  setUnitOfWork(uow: unknown): void;
}

export interface ProductFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
}
