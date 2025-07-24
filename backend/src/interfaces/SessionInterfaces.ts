/**
 * Session User Information Interface
 */
export interface SessionUserInfo {
    userId: string;
    username: string;
    nickname: string;
}

/**
 * Session Data Interface
 */
export interface SessionData {
    isAuthenticated?: boolean;
    userId?: string;
    username?: string;
    nickname?: string;
    loginTime?: string;
    id?: string;
    cookie?: any;
}

/**
 * Session Helper Response Interface
 */
export interface SessionResponse {
    success: boolean;
    isAuthenticated: boolean;
    user?: SessionUserInfo;
    message?: string;
}
