const express = require('express');
const controllers = require('../../controllers/contacts');
const { validateBody, authenticate } = require('../../middlewares');
const { schemas } = require('../../models/contacts');

const router = express.Router();

router.get('/', authenticate, controllers.getAll);

router.get('/:id', authenticate, controllers.getById);

router.post(
    '/',
    authenticate,
    validateBody(schemas.addSchema),
    controllers.add
);

router.put(
    '/:id',
    authenticate,
    validateBody(schemas.addSchema),
    controllers.updateById
);

router.patch(
    '/:id/favorite',
    authenticate,
    validateBody(schemas.updateFavoriteSchema),
    controllers.updateStatusContact
);

router.delete('/:id', authenticate, controllers.deleteById);

module.exports = router;
