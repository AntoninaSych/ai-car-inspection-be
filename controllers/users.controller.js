import { User } from "../models/index.js";
import HttpError from "../helpers/HttpError.js";
import ErrorCodes from "../helpers/errorCodes.js";
import { fileURLToPath } from "url";
import path from "path";
import createDirIfNotExist from "../helpers/createDirIfNotExist.js";
import fs from "fs/promises";
import { getBaseUrl } from "../helpers/getBaseUrl.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultAvatar = "/public/images/avatars/default.png";

// Get all users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    next(err.status ? err : HttpError(500, err.message, ErrorCodes.SERVER_ERROR));
  }
};


export const getUserInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found", internalCode: ErrorCodes.RESOURCE_USER_NOT_FOUND });


    const avatarURL = user.avatarURL
        ? user.avatarURL
      : `${getBaseUrl()}${defaultAvatar}`;


    res.status(200).json({
      user: {
        id,
        name: user.name,
        email: user.email,
        avatarURL,
      }
    });
  } catch (err) {
    next(err.status ? err : HttpError(500, err.message, ErrorCodes.SERVER_ERROR));
  }
};


export const changeAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File upload error", internalCode: ErrorCodes.USER_AVATAR_UPLOAD_FAILED });
    }

    const { path: tempPath, filename } = req.file;
    const avatarsDir = path.join(__dirname, "../public/images/avatars");

    await createDirIfNotExist(avatarsDir);

    const resultPath = path.join(avatarsDir, filename);
    await fs.rename(tempPath, resultPath);


    const avatarURL = `${getBaseUrl()}/public/images/avatars/${filename}`;
    // --------------------

    req.user.avatarURL = avatarURL;
    await req.user.save();

    res.json({ avatarURL });
  } catch (err) {
    next(err);
  }
};


export const getCurrent = async (req, res) => {
  const { id, name, email, avatarURL, language, currency } = req.user;


  const fullAvatarUrl = avatarURL
      ? avatarURL
    : `${getBaseUrl()}${defaultAvatar}`;


  res.status(200).json({ id, name, email, avatarURL: fullAvatarUrl, language, currency });
};


export const updateLanguage = async (req, res, next) => {
  try {
    const { language } = req.body;

    if (!language || typeof language !== 'string') {
      return next(HttpError(400, "Language code is required", ErrorCodes.VALIDATION_REQUIRED_FIELD));
    }

    const languageCode = language.toLowerCase().trim();
    if (languageCode.length < 2 || languageCode.length > 5) {
      return next(HttpError(400, "Invalid language code", ErrorCodes.VALIDATION_INVALID_INPUT));
    }

    req.user.language = languageCode;
    await req.user.save();

    res.status(200).json({
      ok: true,
      message: "Language updated successfully",
      language: req.user.language,
    });
  } catch (err) {
    next(err.status ? err : HttpError(500, err.message, ErrorCodes.SERVER_ERROR));
  }
};


export const updateCurrency = async (req, res, next) => {
  try {
    const { currency } = req.body;

    if (!currency || typeof currency !== 'string') {
      return next(HttpError(400, "Currency code is required", ErrorCodes.VALIDATION_REQUIRED_FIELD));
    }

    const currencyCode = currency.toUpperCase().trim();
    if (currencyCode.length !== 3) {
      return next(HttpError(400, "Currency code must be 3 characters (ISO 4217)", ErrorCodes.VALIDATION_INVALID_INPUT));
    }

    req.user.currency = currencyCode;
    await req.user.save();

    res.status(200).json({
      ok: true,
      message: "Currency updated successfully",
      currency: req.user.currency,
    });
  } catch (err) {
    next(err.status ? err : HttpError(500, err.message, ErrorCodes.SERVER_ERROR));
  }
};
