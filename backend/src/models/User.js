const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * User Schema
 * Requirements: username, password, nickname only
 */
const userSchema = new mongoose.Schema({
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
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            delete ret.password;
            return ret;
        }
    }
});

/**
 * Pre-save middleware to hash password
 */
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        // Hash password with cost of 12
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Instance method to check password
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

/**
 * Static method to find user by username
 */
userSchema.statics.findByUsername = function(username) {
    return this.findOne({ username: username.toLowerCase() });
};

/**
 * Pre-save middleware to convert username to lowercase
 */
userSchema.pre('save', function(next) {
    if (this.username) {
        this.username = this.username.toLowerCase();
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
