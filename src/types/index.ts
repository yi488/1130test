// src/types/index.ts
export interface Artifact {
  id: number;
  title: string;
  image_path: string;
  period: string;
  dynasty: string;
  location: string;
  description: string;
  detailed_description: string;
  material: string;
  dimensions: string;
  discovery_location: string;
  collection: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface ArtifactWithFavorite extends Artifact {
  is_favorite: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export type Category = 'all' | 'ceramics' | 'bronze' | 'jade' | 'calligraphy' | 'sculpture';

export interface SearchParams {
  query?: string;
  category?: Category;
  dynasty?: string;
  favoritesOnly?: boolean;
}

// 认证相关类型
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// 文物操作相关类型
export interface CreateArtifactRequest {
  title: string;
  image_path: string;
  period: string;
  dynasty: string;
  location: string;
  description: string;
  detailed_description: string;
  material: string;
  dimensions: string;
  discovery_location: string;
  collection: string;
  category: string;
}

export interface UpdateArtifactRequest extends Partial<CreateArtifactRequest> {
  id: number;
}

// API 响应类型
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 错误类型
export interface ApiError {
  message: string;
  code: string;
  details?: unknown;
}

// 表单类型
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// 过滤器类型
export interface ArtifactFilters {
  category?: Category;
  dynasty?: string;
  material?: string;
  collection?: string;
  period?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

// 排序类型
export type SortField = 'title' | 'dynasty' | 'period' | 'created_at' | 'updated_at';
export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  field: SortField;
  order: SortOrder;
}

// 搜索类型
export interface SearchOptions {
  query: string;
  filters: ArtifactFilters;
  sort: SortOptions;
  pagination: {
    page: number;
    pageSize: number;
  };
}