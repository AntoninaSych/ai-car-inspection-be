import { Recipe, User, Follow, Favorite } from "../models/index.js";
import HttpError from "../helpers/HttpError.js";
import { fileURLToPath } from "url";
import path from "path";
import createDirIfNotExist from "../helpers/createDirIfNotExist.js";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultAvatar = "/public/images/avatars/default.png";

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    next(err.status ? err : HttpError(500, err.message));
  }
};

export const getCurrentUserInfo = async (req, res, next) => {
  try {
    const { id, name, email, avatarURL } = req.user; // user comes from auth
    let fullAvatarUrl = avatarURL;
    if (!avatarURL) fullAvatarUrl = path.join(__dirname, defaultAvatar);
    else if (!avatarURL.startsWith("http")) {
      fullAvatarUrl = path.join(__dirname, avatarURL);
    }
    console.log(fullAvatarUrl);
    const createdRecipes = await Recipe.count({ where: { ownerId: id } });
    const favorites = await req.user.getFavorites();
    const followers = await req.user.getFollowers();
    const following = await req.user.getFollowings();
    res.status(200).json({
      user: { id, name, email, avatarURL: fullAvatarUrl },
      createdRecipes,
      favorites: favorites.length,
      followers: followers.length,
      following: following.length,
    });
  } catch (err) {
    next(err.status ? err : HttpError(500, err.message));
  }
};

export const getUserInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) res.status(404).json("User not found");
    let avatarURL = user.avatarURL;
    if (!avatarURL) avatarURL = path.join(__dirname, defaultAvatar);
    else if (!avatarURL.startsWith("http")) {
      avatarURL = path.join(__dirname, avatarURL);
    }
    console.log(avatarURL);
    const createdRecipes = await Recipe.count({ where: { ownerId: id } });
    const favorites = await user.getFavorites();
    const followers = await user.getFollowers();
    res.status(200).json({
      user: {
        id,
        name: user.name,
        email: user.email,
        avatarURL,
      },
      createdRecipes,
      favorites: favorites.length,
      followers: followers.length,
    });
  } catch (err) {
    next(err.status ? err : HttpError(500, err.message));
  }
};

export const followUser = async (req, res, next) => {
  try {
    const follower = req.user; // set by auth middleware
    const { id: followingId } = req.params; // ID to follow

    if (follower.id === followingId) {
      throw HttpError(400, "You can't follow yourself");
    }

    const target = await User.findByPk(followingId);
    if (!target) {
      throw HttpError(404, "User to follow not found");
    }
    await follower.addFollowings(target);

    res.json({ message: `Now following user ${followingId}` });
  } catch (err) {
    next(err.status ? err : HttpError(500, err.message));
  }
};

export const unfollowUser = async (req, res, next) => {
  try {
    const follower = req.user;
    const { id: followingId } = req.params;

    if (follower.id === followingId) {
      throw HttpError(400, "You can't unfollow yourself");
    }

    const target = await User.findByPk(followingId);
    if (!target) {
      throw HttpError(404, "User to unfollow not found");
    }

    await follower.removeFollowings(target);

    res.json({ message: `Unfollowed user ${followingId}` });
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

    const avatarURL =
      `${req.protocol}://${req.get("host")}/public` +
      `/images/avatars/${filename}`;
    req.user.avatarURL = avatarURL;
    await req.user.save();

    res.json({ avatarURL });
  } catch (err) {
    next(err);
  }
};

export const getUserFollowers = async (req, res, next) => {
  try {
    const { id: userId } = req.params;

    const target = await User.findByPk(userId);
    if (!target) {
      throw HttpError(404, "User not found");
    }

    const followers = await target.getFollowers({
      include: [
        {
          model: Recipe,
          as: 'recipes',
          attributes: ['id', 'title', 'thumb'],
          limit: 4,
        }
      ]
    });

    const followersWithCounts = await Promise.all(
        followers.map(async follower => {
          const recipeCount = await Recipe.count({
            where: { ownerId: follower.id },
          });

          const jsonFollower = follower.toJSON();
          return {
            ...jsonFollower,
            allRecipes: recipeCount
          };
        })
    );

    res.json(followersWithCounts);
  } catch (err) {
    next(err.status ? err : HttpError(500, err.message));
  }
};

export const followers = async (req, res, next) => {
  try {
    const followers = await req.user.getFollowers({
      include: [
        {
          model: Recipe,
          as: 'recipes',
          attributes: ['id', 'title', 'thumb'],
          limit: 4,
        }
      ]
    });

    const enrichedFollowers = await Promise.all(
        followers.map(async follower => {
          const recipeCount = await Recipe.count({
            where: { ownerId: follower.id },
          });

          return {
            ...follower.toJSON(),
            allRecipes: recipeCount
          };
        })
    );

    res.json(enrichedFollowers);
  } catch (err) {
    next(err.status ? err : HttpError(500, err.message));
  }
};

export const following = async (req, res, next) => {
  try {
    const followings = await req.user.getFollowings({
      include: [
        {
          model: Recipe,
          as: 'recipes',
          attributes: ['id', 'title', 'thumb'],
          limit: 4,
        }
      ]
    });

    const enrichedFollowings = await Promise.all(
        followings.map(async user => {
          const recipeCount = await Recipe.count({
            where: { ownerId: user.id },
          });

          return {
            ...user.toJSON(),
            allRecipes: recipeCount
          };
        })
    );

    res.json(enrichedFollowings);
  } catch (err) {
    next(err.status ? err : HttpError(500, err.message));
  }
};


export const getCurrent = async (req, res) => {
  const { id, name, email, avatarURL } = req.user;
  res.status(200).json({ id, name, email, avatarURL });
};
