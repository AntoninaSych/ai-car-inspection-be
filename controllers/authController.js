import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import Joi from "joi";
import { User } from "../models/index.js";
import path from "path";
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from "url";
import axios from 'axios';

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const SECRET_KEY = process.env.JWT_SECRET || "defaultsecret";

const AVATARS_DIR = path.resolve('public', 'images', 'avatars');

export const register = async (req, res, next) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).json({ message: "Email in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const gravatarUrl = gravatar.url(email, { s: "250", d: "retro" }, true);
    const avatarFilename = `${uuidv4()}.jpg`;
    const avatarPath = path.join(AVATARS_DIR, avatarFilename);

    const response = await axios.get(gravatarUrl, { responseType: 'arraybuffer' });
    await fs.mkdir(AVATARS_DIR, { recursive: true });
    await fs.writeFile(avatarPath, response.data);

    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.PORT || 3000;
    const avatarURL = `http://${host}:${port}/public/images/avatars/${avatarFilename}`;

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      avatarURL,
    });

    const payload = { id: newUser.id };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "24h" });

    await newUser.update({ token });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatarURL: newUser.avatarURL,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const payload = { id: user.id };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "24h" });

    await user.update({ token });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarURL: user.avatarURL,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    await req.user.update({ token: null });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// For avatar change
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
