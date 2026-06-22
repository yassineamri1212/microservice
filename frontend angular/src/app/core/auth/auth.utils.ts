export class AuthUtils {
    // Check if the token is expired
    static isTokenExpired(token: string): boolean {
        if (!token) {
            return true;
        }
        const expiryDate = this.getTokenExpirationDate(token);
        return !expiryDate || expiryDate.valueOf() <= new Date().valueOf();
    }

    // Decode the token
    static decodeToken(token: string): any {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid JWT token');
        }
        return JSON.parse(atob(parts[1]));
    }

    // Get token expiration date
    private static getTokenExpirationDate(token: string): Date | null {
        const decoded = this.decodeToken(token);
        if (!decoded.exp) {
            return null;
        }
        return new Date(decoded.exp * 1000);
    }
}
