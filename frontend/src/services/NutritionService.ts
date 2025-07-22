import axios, { AxiosResponse } from 'axios';
import { NutritionResult, BreadcrumbItem } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export interface NutritionAnalysisRequest {
  foodInput: string;
}

export interface NutritionAnalysisResponse {
  success: boolean;
  message?: string;
  data?: NutritionResult;
}

export interface BreadcrumbsResponse {
  success: boolean;
  breadcrumbs: BreadcrumbItem[];
}

class NutritionServiceClass {
  private apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  async analyzeFood(foodInput: string): Promise<NutritionAnalysisResponse> {
    try {
      const response: AxiosResponse<NutritionAnalysisResponse> = await this.apiClient.post('/api/nutrition/analyze', {
        foodInput,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Analysis failed',
      };
    }
  }

  async getBreadcrumbs(): Promise<BreadcrumbItem[]> {
    try {
      const response: AxiosResponse<BreadcrumbsResponse> = await this.apiClient.get('/api/breadcrumbs');
      return response.data.breadcrumbs || [];
    } catch (error) {
      return [];
    }
  }

  async clearHistory(): Promise<boolean> {
    try {
      await this.apiClient.delete('/api/history');
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const NutritionService = new NutritionServiceClass();
export { NutritionServiceClass };
