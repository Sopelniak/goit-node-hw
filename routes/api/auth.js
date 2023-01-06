const express = require('express');

const ctrl = require('../../controllers/auth');
const { schemas } = require('../../models/user');
const { validateBody, authenticate, upload } = require('../../middlewares');

const router = express.Router();

router.post('/register', validateBody(schemas.registerSchema), ctrl.register);
router.get('/verify/:verificationToken', ctrl.verify);
router.post(
    '/verify',
    validateBody(schemas.verifyEmailSchema),
    ctrl.resendVerifyEmail
);
router.post('/login', validateBody(schemas.loginSchema), ctrl.login);
router.post('/refresh', validateBody(schemas.refreshSchema), ctrl.refresh);

router.get('/current', authenticate, ctrl.getCurrent);
router.get('/logout', authenticate, ctrl.logout);

router.patch(
    '/avatars',
    authenticate,
    upload.single('avatar'),
    ctrl.updateAvatar
);

module.exports = router;
