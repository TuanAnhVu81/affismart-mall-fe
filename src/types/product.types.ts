export interface Category {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  stockQuantity: number;
  imageUrl: string | null;
  category: Category;
  isActive: boolean;
}

export interface PageableSort {
  sorted: boolean;
  unsorted: boolean;
  empty: boolean;
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  offset: number;
  paged: boolean;
  unpaged: boolean;
  sort: PageableSort;
}

export interface ProductListResponse {
  content: Product[];
  pageable: Pageable;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
