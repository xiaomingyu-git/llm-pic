/**
 * User Management Types
 * 用户管理相关的 TypeScript 类型定义
 */

// 从全局类型导入统一的 ApiResponse
import type { ApiResponse } from '../../../types';
export type { ApiResponse } from '../../../types';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'user' | 'moderator';
export type UserStatus = 'active' | 'inactive';

export interface SearchParams {
  keyword: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

export interface UserListResponse extends ApiResponse<User[]> {
  success: boolean;
  data: User[];
  message: string;
  total: number;
  page: number;
  pageSize: number;
}

export interface UserFormData extends Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
  // 创建/编辑用户时的表单数据
}

export interface UserActions {
  onEdit: (user: User, index: number) => void;
  onView: (user: User) => void;
  onDelete: (user: User, index: number) => void;
}

// 用户验证相关类型
export interface UserValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  message: string;
}

export interface UserValidationRules {
  name: UserValidationRule[];
  email: UserValidationRule[];
  phone: UserValidationRule[];
  role: UserValidationRule[];
  status: UserValidationRule[];
}

// 用户统计相关类型
export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: Record<UserRole, number>;
  recentRegistrations: number;
}
