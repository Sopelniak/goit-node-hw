const { Schema, model } = require('mongoose');
const Joi = require('joi');

const { handleMongooseError } = require('../helpers');

const emailRegexp = /^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/;

const userSchema = new Schema(
    {
        password: {
            type: String,
            required: [true, 'Set password for user'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
        },
        subscription: {
            type: String,
            enum: ['starter', 'pro', 'business'],
            default: 'starter',
        },
        accessToken: {
            type: String,
        },
        refreshToken: {
            type: String,
        },
        avatarURL: {
            type: String,
            required: true,
        },
        verify: {
            type: Boolean,
            default: false,
        },
        verificationToken: {
            type: String,
            required: [true, 'Verify token is required'],
        },
    },
    { versionKey: false, timestamps: true }
);

userSchema.post('save', handleMongooseError);

const registerSchema = Joi.object({
    email: Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().min(6).required(),
});

const verifyEmailSchema = Joi.object({
    email: Joi.string().pattern(emailRegexp).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().min(6).required(),
});

const refreshSchema = Joi.object({
    refreshToken: Joi.string().required(),
});

const schemas = {
    registerSchema,
    verifyEmailSchema,
    loginSchema,
    refreshSchema,
};

const User = model('user', userSchema);

module.exports = {
    User,
    schemas,
};
