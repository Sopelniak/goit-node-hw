const { Schema, model } = require('mongoose');
const Joi = require('joi');

const { handleMongooseError } = require('../helpers');

const contactSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Set name for contact'],
        },
        email: {
            type: String,
        },
        phone: {
            type: String,
        },
        favorite: {
            type: Boolean,
            default: false,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
    },
    { versionKey: false, timestamps: true }
);

contactSchema.post('save', handleMongooseError);

const Contact = model('contact', contactSchema);

const addSchema = Joi.object({
    name: Joi.string().min(2).max(20).required(),
    email: Joi.string()
        .email({
            minDomainSegments: 1,
            tlds: { allow: ['com', 'net', 'org', 'uk', 'ka', 'ua'] },
        })
        .required(),
    phone: Joi.string().min(6).max(17).required(),
    favorite: Joi.boolean(),
});

const updateFavoriteSchema = Joi.object({
    favorite: Joi.boolean().required(),
});

const schemas = { addSchema, updateFavoriteSchema };

module.exports = { Contact, schemas };
