import { User, LoginCredentials, RegisterData } from './UserInterfaces';
import { NutritionResult, BreadcrumbItem } from './NutritionInterfaces';

// Component prop types
export interface NavigationProps {
  user: User | null;
  isAuthenticated: boolean;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onNavigateToRecentSearches: () => void;
  onNavigateToHome: () => void;
  currentView: 'home' | 'recent-searches';
}

export interface CalorieFormProps {
  onAnalyze: (foodText: string) => void;
  isLoading: boolean;
  error: string;
  resetTrigger?: number;
}

export interface BreadcrumbsSectionProps {
  breadcrumbs: BreadcrumbItem[];
  onBreadcrumbClick: (searchId: string) => void;
  onClearHistory: () => void;
}

export interface ResultsCardProps {
  result: NutritionResult;
  onNewAnalysis: () => void;
}

export interface AuthModalsProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  onRegister: (userData: RegisterData) => Promise<void>;
}

export interface RecentSearchesProps {
  breadcrumbs: BreadcrumbItem[];
  onSearchClick: (searchId: string) => void;
  onClearHistory: () => void;
  onBackToHome: () => void;
  isAuthenticated: boolean;
  nutritionResult?: NutritionResult | null;
  onNewAnalysis?: () => void;
}
