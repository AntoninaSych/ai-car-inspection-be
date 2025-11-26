'use strict';

const fs = require("fs/promises");
const path = require("path");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

require("dotenv").config();
const host = process.env.HOST || "localhost";
const port = process.env.PORT || '';
const baseUrl = port ? `http://${host}:${port}` : `http://${host}`;


module.exports = {
  async up(queryInterface) {
    const dataPath = path.join(__dirname, "../db/source/users.json");
    const rawData = await fs.readFile(dataPath, "utf-8");
    const parsed = JSON.parse(rawData);

    const { users, relationships } = parsed;

    const now = new Date();

    const hashedUsers = await Promise.all(
      users.map(async (user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        password: await bcrypt.hash("password123", 10),
        avatarURL:
          user.name === "Foodies Admin"
            ? `${baseUrl}/public/images/avatars/admin.jpeg`
            : `${baseUrl}/public/images/avatars/default.png`,
        token: user.token,
        createdAt: now,
        updatedAt: now,
      }))
    );

    // Insert users
    await queryInterface.bulkInsert("users", hashedUsers);

    // Insert follows (user-user)
    const follows = [];
    for (const [followedId, followerIds] of Object.entries(
      relationships.followers
    )) {
      followerIds.forEach((followerId) => {
        follows.push({
          id: uuidv4(),
          followerId,
          followingId: followedId,
          createdAt: now,
          updatedAt: now,
        });
      });
    }
    if (follows.length > 0) {
      await queryInterface.bulkInsert("follows", follows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("follows", null, {});
    await queryInterface.bulkDelete("users", null, {});
  },
};
