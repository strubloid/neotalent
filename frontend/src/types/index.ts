// User types
export interface User {
  id: string;
  username: string;
  nickname: string;
  createdAt: string;
}

// Authentication types
export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
}

export interface AuthStatusResponse {
  success: boolean;
  isAuthenticated: boolean;
  user?: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  nickname: string;
}

// Nutrition types
export interface NutritionResult {
  searchId: string;
  query: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  breakdown: FoodItem[];
  summary: string;
  timestamp: string;
}

export interface FoodItem {
  food: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity?: string;
}

export interface NutritionAnalysisRequest {
  food: string;
}

export interface NutritionResponse {
  success: boolean;
  data: NutritionResult;
  search_id: string;
  message?: string;
}

// Breadcrumb types
export interface BreadcrumbItem {
  searchId: string;
  query: string;
  summary: string;
  timestamp: string;
}

export interface BreadcrumbResponse {
  success: boolean;
  data: BreadcrumbItem[];
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface HealthResponse {
  success: boolean;
  status: string;
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
}

// Component prop types
export interface NavigationProps {
  user: User | null;
  isAuthenticated: boolean;
  onLogout: () => void;
  onDeleteAccount: () => Promise<{ success: boolean; message?: string }>;
}

export interface CalorieFormProps {
  onAnalyze: (foodText: string) => Promise<void>;
  isLoading: boolean;
  error: string;
}

export interface BreadcrumbsSectionProps {
  breadcrumbs: BreadcrumbItem[];
  onBreadcrumbClick: (searchId: string) => Promise<void>;
  onClearHistory: () => Promise<void>;
}

export interface ResultsCardProps {
  result: NutritionResult;
  onNewAnalysis: () => void;
}

export interface AuthModalsProps {
  onLogin: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
  onRegister: (userData: RegisterData) => Promise<{ success: boolean; message?: string }>;
}

// Form validation types
export interface FormErrors {
  [key: string]: string;
}

export interface LoadingStates {
  [key: string]: boolean;
}

// Local storage types
export interface LocalBreadcrumb extends BreadcrumbItem {
  // Same as BreadcrumbItem for now, can be extended if needed
}
