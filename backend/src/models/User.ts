import mongoose, { Document, Schema, Model } from 'mongoose';
import crypto from 'crypto';

/**
 * Password hashing utility using Node.js crypto (Docker-friendly)
 */
const hashPassword = (password: string): string => {
    // Generate a salt
    const salt = crypto.randomBytes(16).toString('hex');
    // Hash password with salt using pbkdf2
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
};

const verifyPassword = (password: string, hashedPassword: string): boolean => {
    try {
        const [salt, hash] = hashedPassword.split(':');
        const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
        return hash === verifyHash;
    } catch (error) {
        return false;
    }
};

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
 * User Schema
 * Requirements: username, password, nickname only
 */
const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [50, 'Username cannot exceed 50 characters'],
        match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    nickname: {
        type: String,
        required: [true, 'Nickname is required'],
        trim: true,
        maxlength: [100, 'Nickname cannot exceed 100 characters']
    },
    searchHistory: [{
        searchId: {
            type: String,
            required: true
        },
        query: {
            type: String,
            required: true,
            maxlength: [500, 'Search query cannot exceed 500 characters']
        },
        summary: {
            type: String,
            required: true,
            maxlength: [1000, 'Search summary cannot exceed 1000 characters']
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            delete (ret as any).password;
            return ret;
        }
    }
});

/**
 * Pre-save middleware to hash password
 */
userSchema.pre<IUser>('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        // Hash password using crypto (Docker-friendly)
        this.password = hashPassword(this.password);
        next();
    } catch (error: any) {
        next(error);
    }
});

/**
 * Instance method to check password
 */
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    try {
        // Use crypto-based password verification (Docker-friendly)
        return verifyPassword(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

/**
 * Static method to find user by username
 */
userSchema.statics.findByUsername = function(username: string) {
    return this.findOne({ username: username.toLowerCase() });
};

/**
 * Pre-save middleware to convert username to lowercase
 */
userSchema.pre<IUser>('save', function(next) {
    if (this.username) {
        this.username = this.username.toLowerCase();
    }
    next();
});

export default mongoose.model<IUser, IUserModel>('User', userSchema);
