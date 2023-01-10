const fs = require('fs').promises;
const jwt = require('jsonwebtoken');
const Jimp = require('jimp');
const path = require('path');
const bcrypt = require('bcrypt');
const gravatar = require('gravatar');
const { User } = require('../models/user');
const { nanoid } = require('nanoid');
const { HttpError, ctrlWrapper, sendEmail } = require('../helpers');

require('dotenv').config();
const { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY, BASE_URL } = process.env;

const register = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
        throw HttpError(409, 'Email in use');
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = await gravatar.url(email);
    const verificationToken = nanoid();

    const newUser = await User.create({
        ...req.body,
        avatarURL,
        password: hashPassword,
        verificationToken,
    });
    const verifyEmail = {
        to: email,
        subject: 'Verify your email',
        html: `<a targer="_blanc" href="${BASE_URL}/api/auth/verify/${verificationToken}">Click to verify your email</a>`,
    };
    await sendEmail(verifyEmail);

    res.status(201).json({
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
    });
};

const verify = async (req, res) => {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    if (!user) {
        throw HttpError(404);
    }
    await User.findByIdAndUpdate(user._id, {
        verify: true,
        verificationToken: '',
    });
    res.json({
        message: 'Verify email success',
    });
};

const resendVerifyEmail = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw HttpError(404);
    }
    if (user.verify) {
        throw HttpError(400, 'Verification has already been passed');
    }
    const verifyEmail = {
        to: email,
        subject: 'Verify your email',
        html: `<a targer="_blanc" href="${BASE_URL}/api/auth/verify/${user.verificationToken}">Click to verify your email</a>`,
    };
    await sendEmail(verifyEmail);

    res.json({
        message: 'Verify email resend success',
    });
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        throw HttpError(401, 'Email or password invalid'); // throw HttpError(401, "Email invalid");
    }
    if (!user.verify) {
        throw HttpError(400, 'Email not verify');
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
        throw HttpError(401, 'Email or password invalid'); // throw HttpError(401, "Password invalid");
    }
    const payload = {
        id: user._id,
    };
    const accessToken = jwt.sign(payload, ACCESS_SECRET_KEY, {
        expiresIn: '2m',
    });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {
        expiresIn: '7d',
    });
    await User.findByIdAndUpdate(user._id, { accessToken, refreshToken });

    res.json({
        accessToken,
        refreshToken,
    });
};

const refresh = async (req, res) => {
    const { refreshToken: token } = req.body;
    try {
        const { id } = jwt.verify(token, REFRESH_SECRET_KEY);
        const isExist = await User.findOne({ refreshToken: token });
        if (!isExist) {
            throw HttpError(403, 'Token invalid');
        }
        const payload = {
            id,
        };
        const accessToken = jwt.sign(payload, ACCESS_SECRET_KEY, {
            expiresIn: '2m',
        });
        const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {
            expiresIn: '7d',
        });
        res.json({
            accessToken,
            refreshToken,
        });
    } catch (error) {
        throw HttpError(403, error.message);
    }
};

const getCurrent = (req, res) => {
    const { name, email } = req.user;

    res.json({
        name,
        email,
    });
};

const logout = async (req, res) => {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { accessToken: '', refreshToken: '' });

    res.json({
        message: 'Logout success',
    });
};

const avatarsDir = path.join(__dirname, '../', 'public', 'avatars');

const updateAvatar = async (req, res) => {
    const { _id } = req.user;
    const { path: tempUpload, originalname } = req.file;
    const filename = `${_id}_${originalname}`;
    const resultUpload = path.join(avatarsDir, filename);

    Jimp.read(tempUpload, (err, avatar) => {
        if (err) throw err;
        avatar
            .resize(250, 250) // resize
            .quality(60) // set JPEG quality
            .greyscale() // set greyscale
            .writeAsync(resultUpload); // save
    });
    await fs.unlink(tempUpload);
    const avatarURL = path.join('avatars', filename);
    await User.findByIdAndUpdate(_id, { avatarURL });

    res.json({ avatarURL });
};

module.exports = {
    register: ctrlWrapper(register),
    verify: ctrlWrapper(verify),
    resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
    login: ctrlWrapper(login),
    refresh: ctrlWrapper(refresh),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
    updateAvatar: ctrlWrapper(updateAvatar),
};
