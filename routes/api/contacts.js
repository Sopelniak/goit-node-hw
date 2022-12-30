const express = require('express');
const controllers = require('../../controllers/contacts');
const { validateBody } = require('../../middlewares');
const { schemas } = require('../../models/contacts');

const router = express.Router();

router.get('/', controllers.getAll);

router.get('/:id', controllers.getById);

router.post('/', validateBody(schemas.addSchema), controllers.add);

router.put('/:id', validateBody(schemas.addSchema), controllers.updateById);

router.patch(
    '/:id/favorite',
    validateBody(schemas.updateFavoriteSchema),
    controllers.updateStatusContact
);

router.delete('/:id', controllers.deleteById);

module.exports = router;
