const express = require('express');
const controllers = require('../../controllers/contacts');
const { validateBody } = require('../../middlewares');
const schemas = require('../../schemas/contacts');

const router = express.Router();

router.get('/', controllers.getAll);

router.get('/:id', controllers.getById);

router.post('/', validateBody(schemas.addSchema), controllers.add);

router.put('/:id', validateBody(schemas.addSchema), controllers.updateById);

router.delete('/:id', controllers.deleteById);

module.exports = router;
