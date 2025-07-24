/**
 * Session Helper Service
 * Simple utilities for session management
 */
export class SessionHelper {
    /**
     * Create user session
     */
    static createUserSession(session: any, user: any): void {
        session.isAuthenticated = true;
        session.userId = user._id.toString();
        session.username = user.username;
        session.nickname = user.nickname;
        session.loginTime = new Date().toISOString();
    }

    /**
     * Destroy user session
     */
    static destroyUserSession(session: any): void {
        session.isAuthenticated = false;
        delete session.userId;
        delete session.username;
        delete session.nickname;
        delete session.loginTime;
    }

    /**
     * Check if session is authenticated
     */
    static isAuthenticated(session: any): boolean {
        return !!(session && session.isAuthenticated && session.userId);
    }

    /**
     * Get user info from session
     */
    static getUserFromSession(session: any): { userId: string; username: string; nickname: string } | null {
        if (!this.isAuthenticated(session)) {
            return null;
        }

        return {
            userId: session.userId,
            username: session.username,
            nickname: session.nickname
        };
    }
}
