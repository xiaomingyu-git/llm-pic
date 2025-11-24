/**
 * User Utils
 * 用户管理相关的工具函数
 */

import type { User } from '../types';

/**
 * 格式化日期时间
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateString;
  }
};

/**
 * 格式化日期（仅日期）
 */
export const formatDateOnly = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateString;
  }
};

/**
 * 格式化时间（仅时间）
 */
export const formatTimeOnly = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Time formatting error:', error);
    return dateString;
  }
};

/**
 * 生成用户头像URL
 */
export const generateAvatarUrl = (
  user: Pick<User, 'id' | 'name' | 'email'>
): string => {
  // 使用 Gravatar 或者其他头像服务
  const baseUrl = 'https://api.dicebear.com/7.x/avataaars/svg';
  const seed = `${user.email}-${user.id}`;
  return `${baseUrl}?seed=${seed}`;
};

/**
 * 获取用户显示名称
 */
export const getDisplayName = (user: User): string => {
  return user.name || `用户${user.id}`;
};

/**
 * 检查用户是否在线（基于最后更新时间）
 */
export const isUserOnline = (
  user: User,
  thresholdMinutes: number = 5
): boolean => {
  try {
    const now = new Date().getTime();
    const lastUpdate = new Date(user.updatedAt).getTime();
    const diffMinutes = (now - lastUpdate) / (1000 * 60);
    return diffMinutes <= thresholdMinutes;
  } catch (error) {
    console.error('Check user online status error:', error);
    return false;
  }
};

/**
 * 生成用户完整信息文本
 */
export const generateUserInfo = (user: User): string => {
  const roleLabels = {
    admin: '管理员',
    user: '普通用户',
    moderator: '协管员',
  };

  const statusLabels = {
    active: '启用',
    inactive: '禁用',
  };

  return `${getDisplayName(user)} (${roleLabels[user.role]}) - ${statusLabels[user.status]}`;
};

/**
 * 验证邮箱格式
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 验证手机号格式（中国大陆）
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * 搜索用户（支持多字段搜索）
 */
export const searchUsers = (users: User[], keyword: string): User[] => {
  if (!keyword.trim()) {
    return users;
  }

  const lowerKeyword = keyword.toLowerCase();
  return users.filter(
    (user) =>
      user.name.toLowerCase().includes(lowerKeyword) ||
      user.email.toLowerCase().includes(lowerKeyword) ||
      user.phone.includes(keyword) ||
      user.id.toString().includes(keyword)
  );
};

/**
 * 按角色筛选用户
 */
export const filterUsersByRole = (users: User[], role?: string): User[] => {
  if (!role) {
    return users;
  }
  return users.filter((user) => user.role === role);
};

/**
 * 按状态筛选用户
 */
export const filterUsersByStatus = (users: User[], status?: string): User[] => {
  if (!status) {
    return users;
  }
  return users.filter((user) => user.status === status);
};

/**
 * 获取用户统计信息
 */
export const getUserStatistics = (users: User[]) => {
  const stats = {
    total: users.length,
    active: 0,
    inactive: 0,
    admin: 0,
    user: 0,
    moderator: 0,
  };

  users.forEach((user) => {
    // 按状态统计
    if (user.status === 'active') {
      stats.active++;
    } else {
      stats.inactive++;
    }

    // 按角色统计
    stats[user.role]++;
  });

  return stats;
};

/**
 * 排序用户
 */
export const sortUsers = (
  users: User[],
  sortBy: keyof User,
  sortOrder: 'asc' | 'desc' = 'asc'
): User[] => {
  return [...users].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // 处理日期类型
    if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    // 处理字符串类型
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc'
        ? aValue.localeCompare(bValue, 'zh-CN')
        : bValue.localeCompare(aValue, 'zh-CN');
    }

    // 处理数字类型
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });
};
