import { User } from "../models/index.js";
import HttpError from "../helpers/HttpError.js";
import { fileURLToPath } from "url";
import path from "path";
import createDirIfNotExist from "../helpers/createDirIfNotExist.js";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultAvatar = "/public/images/avatars/default.png";

// Get all users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    next(err.status ? err : HttpError(500, err.message));
  }
};


export const getUserInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json("User not found");


    const avatarURL = user.avatarURL
        ? user.avatarURL
        : `${process.env.APP_URL}${defaultAvatar}`;


    res.status(200).json({
      user: {
        id,
        name: user.name,
        email: user.email,
        avatarURL,
      }
    });
  } catch (err) {
    next(err.status ? err : HttpError(500, err.message));
  }
};


export const changeAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File upload error" });
    }

    const { path: tempPath, filename } = req.file;
    const avatarsDir = path.join(__dirname, "../public/images/avatars");

    await createDirIfNotExist(avatarsDir);

    const resultPath = path.join(avatarsDir, filename);
    await fs.rename(tempPath, resultPath);


    const avatarURL = `${process.env.APP_URL}/public/images/avatars/${filename}`;
    // --------------------

    req.user.avatarURL = avatarURL;
    await req.user.save();

    res.json({ avatarURL });
  } catch (err) {
    next(err);
  }
};


export const getCurrent = async (req, res) => {
  const { id, name, email, avatarURL } = req.user;


  const fullAvatarUrl = avatarURL
      ? avatarURL
      : `${process.env.APP_URL}${defaultAvatar}`;


  res.status(200).json({ id, name, email, avatarURL: fullAvatarUrl });
};
