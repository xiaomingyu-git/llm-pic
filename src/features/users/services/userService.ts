/**
 * User API Service
 * 用户管理 API 服务层
 */

import type {
  User,
  SearchParams,
  PaginationConfig,
  UserListResponse,
  ApiResponse,
} from '../types';

class UserService {
  // Base URL for API endpoints
  // private baseUrl = '/api/users'; // Commented out as it's not currently used

  /**
   * 获取用户列表
   */
  async getUsers(
    searchParams: SearchParams,
    pagination: PaginationConfig
  ): Promise<UserListResponse> {
    // Simulate API call delay
    await this.delay(800);

    try {
      // Generate mock data
      const mockData = this.generateMockData(100);

      // Apply search filters
      const filteredData = this.applyFilters(mockData, searchParams);

      // Update pagination
      const total = filteredData.length;

      // Apply pagination
      const startIndex = (pagination.page - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      return {
        success: true,
        data: paginatedData,
        message: `成功加载 ${paginatedData.length} 条数据`,
        total,
        page: pagination.page,
        pageSize: pagination.pageSize,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: '数据加载失败',
        total: 0,
        page: pagination.page,
        pageSize: pagination.pageSize,
      };
    }
  }

  /**
   * 根据ID获取用户详情
   */
  async getUserById(_id: number): Promise<ApiResponse<User | null>> {
    await this.delay(500);

    try {
      const mockData = this.generateMockData(100);
      const user = mockData.find((u) => u.id === _id);

      if (user) {
        return {
          success: true,
          data: user,
          message: '用户信息获取成功',
        };
      } else {
        return {
          success: false,
          data: null,
          message: '用户不存在',
        };
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        message: '获取用户信息失败',
      };
    }
  }

  /**
   * 创建用户
   */
  async createUser(
    userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<User>> {
    await this.delay(600);

    try {
      const newUser: User = {
        ...userData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: newUser,
        message: '用户创建成功',
      };
    } catch (error) {
      return {
        success: false,
        data: {} as User,
        message: '用户创建失败',
      };
    }
  }

  /**
   * 更新用户信息
   */
  async updateUser(
    id: number,
    userData: Partial<User>
  ): Promise<ApiResponse<User | null>> {
    await this.delay(600);

    try {
      const mockData = this.generateMockData(100);
      const userIndex = mockData.findIndex((u) => u.id === id);

      if (userIndex !== -1) {
        const updatedUser = {
          ...mockData[userIndex],
          ...userData,
          updatedAt: new Date().toISOString(),
        };

        return {
          success: true,
          data: updatedUser,
          message: '用户信息更新成功',
        };
      } else {
        return {
          success: false,
          data: null,
          message: '用户不存在',
        };
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        message: '用户信息更新失败',
      };
    }
  }

  /**
   * 删除用户
   */
  async deleteUser(_id: number): Promise<ApiResponse<boolean>> {
    await this.delay(500);

    try {
      // Simulate API call
      return {
        success: true,
        data: true,
        message: '用户删除成功',
      };
    } catch (error) {
      return {
        success: false,
        data: false,
        message: '用户删除失败',
      };
    }
  }

  /**
   * 批量删除用户
   */
  async deleteUsers(ids: number[]): Promise<ApiResponse<boolean>> {
    await this.delay(800);

    try {
      // Simulate API call
      return {
        success: true,
        data: true,
        message: `成功删除 ${ids.length} 个用户`,
      };
    } catch (error) {
      return {
        success: false,
        data: false,
        message: '批量删除用户失败',
      };
    }
  }

  /**
   * 应用搜索过滤条件
   */
  private applyFilters(data: User[], params: SearchParams): User[] {
    let filteredData = [...data];

    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      filteredData = filteredData.filter(
        (user) =>
          user.name.toLowerCase().includes(keyword) ||
          user.email.toLowerCase().includes(keyword) ||
          user.phone.includes(keyword)
      );
    }

    if (params.role) {
      filteredData = filteredData.filter((user) => user.role === params.role);
    }

    if (params.status) {
      filteredData = filteredData.filter(
        (user) => user.status === params.status
      );
    }

    return filteredData;
  }

  /**
   * 生成模拟数据
   */
  private generateMockData(count: number): User[] {
    const roles: Array<User['role']> = ['admin', 'user', 'moderator'];
    const statuses: Array<User['status']> = ['active', 'inactive'];
    const names: string[] = [
      '张三',
      '李四',
      '王五',
      '赵六',
      '钱七',
      '孙八',
      '周九',
      '吴十',
    ];
    const domains = ['qq.com', '163.com', 'gmail.com', 'outlook.com'];

    return Array.from({ length: count }, (_, index): User => ({
      id: index + 1,
      name: (names[index % names.length] || '用户') + (index + 1),
      email: `user${index + 1}@${domains[index % domains.length]}`,
      phone: `138${String(index + 1).padStart(8, '0')}`,
      role: roles[index % roles.length]!,
      status: statuses[index % statuses.length]!,
      createdAt: new Date(
        Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  /**
   * 模拟网络延迟
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const userService = new UserService();
export default userService;
