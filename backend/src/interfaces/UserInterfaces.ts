import { Document, Model } from 'mongoose';
import { Request } from 'express';

/**
 * Search History Item Interface
 */
export interface ISearchHistoryItem {
    searchId: string;
    query: string;
    summary: string;
    timestamp: Date;
}

/**
 * User Interface
 * Requirements: username, password, nickname only
 */
export interface IUser extends Document {
    username: string;
    password: string;
    nickname: string;
    searchHistory?: ISearchHistoryItem[];
    comparePassword(candidatePassword: string): Promise<boolean>;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * User Model Interface (includes static methods)
 */
export interface IUserModel extends Model<IUser> {
    findByUsername(username: string): Promise<IUser | null>;
}

/**
 * Authenticated Request Interface
 */
export interface AuthenticatedRequest extends Request {
    session: any; // Simplified session type
}
