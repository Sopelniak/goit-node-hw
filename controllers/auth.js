const fs = require('fs').promises;
const jwt = require('jsonwebtoken');
const Jimp = require('jimp');
const path = require('path');
const bcrypt = require('bcrypt');
const gravatar = require('gravatar');
const { User } = require('../models/user');
const { HttpError, ctrlWrapper } = require('../helpers');

require('dotenv').config();
const { SECRET_KEY } = process.env;

const register = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
        throw HttpError(409, 'Email in use');
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = await gravatar.url(email);

    const newUser = await User.create({
        ...req.body,
        avatarURL,
        password: hashPassword,
    });

    res.status(201).json({
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
    });
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        throw HttpError(401, 'Email or password invalid'); // throw HttpError(401, "Email invalid");
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
        throw HttpError(401, 'Email or password invalid'); // throw HttpError(401, "Password invalid");
    }
    const payload = {
        id: user._id,
    };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '23h' });
    await User.findByIdAndUpdate(user._id, { token });

    res.json({
        token,
    });
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
    await User.findByIdAndUpdate(_id, { token: '' });

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
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
    updateAvatar: ctrlWrapper(updateAvatar),
};
