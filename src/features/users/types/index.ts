/**
 * User Management Types
 * 用户管理相关的 TypeScript 类型定义
 */

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchParams {
  keyword: string;
  role?: string;
  status?: string;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

// 从全局类型导入统一的 ApiResponse
export type { ApiResponse } from '../../../types';

export interface UserListResponse extends ApiResponse<User[]> {
  total: number;
  page: number;
  pageSize: number;
}

export type UserRole = User['role'];
export type UserStatus = User['status'];

export interface UserActions {
  onEdit: (user: User, index: number) => void;
  onView: (user: User) => void;
  onDelete: (user: User, index: number) => void;
}
