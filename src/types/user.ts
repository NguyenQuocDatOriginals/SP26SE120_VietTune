// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface User {
// [VI] Thực thi một bước trong luồng xử lý.
  id: string;
// [VI] Thực thi một bước trong luồng xử lý.
  username: string;
// [VI] Thực thi một bước trong luồng xử lý.
  email: string;
// [VI] Thực thi một bước trong luồng xử lý.
  fullName: string;
// [VI] Thực thi một bước trong luồng xử lý.
  role: UserRole;
// [VI] Thực thi một bước trong luồng xử lý.
  avatar?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  bio?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  expertise?: string[];
// [VI] Thực thi một bước trong luồng xử lý.
  phoneNumber?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  isActive?: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
  isEmailConfirmed?: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
  createdAt: string;
// [VI] Thực thi một bước trong luồng xử lý.
  updatedAt: string;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export enum UserRole {
// [VI] Thực thi một bước trong luồng xử lý.
  ADMIN = 'Admin',
// [VI] Thực thi một bước trong luồng xử lý.
  MODERATOR = 'Moderator',
// [VI] Thực thi một bước trong luồng xử lý.
  RESEARCHER = 'Researcher',
// [VI] Thực thi một bước trong luồng xử lý.
  CONTRIBUTOR = 'Contributor',
// [VI] Thực thi một bước trong luồng xử lý.
  EXPERT = 'Expert',
// [VI] Thực thi một bước trong luồng xử lý.
  USER = 'User',
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface LoginForm {
// [VI] Thực thi một bước trong luồng xử lý.
  email: string;
// [VI] Thực thi một bước trong luồng xử lý.
  password: string;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface RegisterForm {
// [VI] Thực thi một bước trong luồng xử lý.
  username: string;
// [VI] Thực thi một bước trong luồng xử lý.
  email: string;
// [VI] Thực thi một bước trong luồng xử lý.
  password: string;
// [VI] Thực thi một bước trong luồng xử lý.
  confirmPassword: string;
// [VI] Thực thi một bước trong luồng xử lý.
  fullName: string;
// [VI] Thực thi một bước trong luồng xử lý.
  phoneNumber: string;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface RegisterResearcherForm {
// [VI] Thực thi một bước trong luồng xử lý.
  email: string;
// [VI] Thực thi một bước trong luồng xử lý.
  password: string;
// [VI] Thực thi một bước trong luồng xử lý.
  fullName: string;
// [VI] Thực thi một bước trong luồng xử lý.
  phoneNumber: string;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface ConfirmAccountForm {
// [VI] Thực thi một bước trong luồng xử lý.
  otp: string;
// [VI] Thực thi một bước trong luồng xử lý.
}
