// Nutrition types
export interface NutritionResult {
  searchId: string;
  query: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber?: number;
  totalSugar?: number;
  totalSodium?: number;
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
  fiber?: number;
  sugar?: number;
  sodium?: number;
  quantity?: string;
}

// Breadcrumb types
export interface BreadcrumbItem {
  searchId: string;
  query: string;
  summary: string;
  timestamp: string;
}

// Local storage types
export interface LocalBreadcrumb extends BreadcrumbItem {
  // Same as BreadcrumbItem for now, can be extended if needed
}
