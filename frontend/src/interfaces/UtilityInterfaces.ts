// Form validation types
export interface FormErrors {
  [key: string]: string;
}

export interface LoadingStates {
  [key: string]: boolean;
}

// General utility interfaces can be added here
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
