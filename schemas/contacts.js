const Joi = require('joi');

const addSchema = Joi.object(
    {
        name: Joi.string().min(2).max(20).required(),
        email: Joi.string()
            .email({
                minDomainSegments: 1,
                tlds: { allow: ['com', 'net', 'org', 'uk', 'ka', 'ua'] },
            })
            .required(),
        phone: Joi.string().min(6).max(17).required(),
        favorite: Joi.boolean(),
    }
);

module.exports = { addSchema };
