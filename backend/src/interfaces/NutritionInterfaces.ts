/**
 * Nutrition Data Interface
 */
export interface NutritionData {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    confidence: number;
    foodItems: Array<{
        name: string;
        quantity: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    }>;
}

/**
 * Food Item Interface
 */
export interface FoodItem {
    name: string;
    quantity: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
}
