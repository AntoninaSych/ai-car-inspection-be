import { Recipe, Area, User, Ingredient, Category, RecipeIngredient } from '../models/index.js';
import HttpError from '../helpers/HttpError.js';
import { Sequelize } from 'sequelize';
import fs from 'fs/promises';
import path from 'path';

export const getRecipeById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const recipe = await Recipe.findOne({
            where: { id },
            include: [
                {
                    model: Area,
                    as: 'area',
                    attributes: ['id', 'name'],
                },
                {
                    model: User,
                    as: 'owner',
                    attributes: ['id', 'name', 'email'],
                },
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'thumb'],
                },
                {
                    model: Ingredient,
                    as: 'ingredients',
                    attributes: ['id', 'name', 'thumb'],
                    through: { attributes: ['measure'] },
                },
            ],
        });

        if (!recipe) {
            return next(HttpError(404, 'Recipe not found'));
        }

        const transformedRecipe = {
            ...recipe.toJSON(),
            ingredients: recipe.ingredients.map(ingredient => ({
                id: ingredient.id,
                name: ingredient.name,
                thumb: ingredient.thumb,
                measure: ingredient.RecipeIngredient?.measure || null,
            })),
        };

        res.json(transformedRecipe);
    } catch (error) {
        next(HttpError(500, error.message));
    }
};

export const createRecipe = async (req, res, next) => {
    try {
        const {
            title,
            description,
            instructions,
            time,
            categoryId,
            areaId,
            ingredients,
        } = req.body;

        const parsedIngredients = JSON.parse(ingredients || '[]');

        if (!title || !categoryId || parsedIngredients.length === 0) {
            return next(HttpError(400, 'Title, category and at least one ingredient are required.'));
        }

        let thumbPath = null;
        if (req.file) {
            const { path: oldPath, filename } = req.file;
            const imagesDir = path.resolve('public', 'images', 'recipies');
            const newPath = path.join(imagesDir, filename);

            await fs.mkdir(imagesDir, { recursive: true });

            await fs.rename(oldPath, newPath);
            const host = process.env.HOST || "localhost";
            const port = process.env.PORT || '';
            const baseUrl = (process.env.NODE_ENV && process.env.NODE_ENV === 'production') ? `${host}` : `${host}:${port}`;
            thumbPath = `${baseUrl}/public/images/recipies/${filename}`;
        }

        const newRecipe = await Recipe.create({
            title,
            description,
            instructions,
            time,
            categoryId,
            areaId: areaId || null,
            ownerId: req.user.id,
            thumb: thumbPath,
        });

        const ingredientsToInsert = parsedIngredients.map(ing => ({
            recipeId: newRecipe.id,
            ingredientId: ing.id,
            measure: ing.measure || null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        await RecipeIngredient.bulkCreate(ingredientsToInsert);

        res.status(201).json({ message: 'Recipe created successfully', recipeId: newRecipe.id });
    } catch (error) {
        next(HttpError(500, error.message));
    }
};

export const deleteOwnRecipe = async (req, res, next) => {
    try {
        const { id } = req.params;
        const recipe = await Recipe.findByPk(id);

        if (!recipe) {
            return next(HttpError(404, 'Рецепт не найден'));
        }

        if (recipe.ownerId !== req.user.id) {
            return next(HttpError(403, 'У вас нет прав на удаление этого рецепта'));
        }
        await recipe.destroy();

        res.status(204).send();
    } catch (error) {
        next(HttpError(500, error.message));
    }
};

export const getAllRecipes = async (req, res, next) => {
    try {
        const { category, ingredient, area, page = 1, limit = 10, owner = "" } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        const where = {};
        const include = [
            {
                model: Category,
                as: "category",
                attributes: ["name"], // тільки назва
            },
            {
                model: Area,
                as: "area",
                attributes: ["name"],
            },
            {
                model: User,
                as: "owner",
                attributes: ["name", "avatarURL", "id"],
            },
        ];

        if (owner !== "") {
          where.ownerId = owner;
        }

        // Пошук по назві категорії (нижній регістр)
        if (category) {
            const foundCategory = await Category.findOne({
                where: Sequelize.where(
                    Sequelize.fn("LOWER", Sequelize.col("name")),
                    category.toLowerCase()
                ),
            });
            if (foundCategory) {
                where.categoryId = foundCategory.id;
            } else {
                return res.json({
                    total: 0,
                    page: Number(page),
                    totalPages: 0,
                    limit: Number(limit),
                    items: [],
                });
            }
        }

        // Пошук по назві регіону (area)
        if (area) {
            const foundArea = await Area.findOne({
                where: Sequelize.where(
                    Sequelize.fn("LOWER", Sequelize.col("name")),
                    area.toLowerCase()
                ),
            });
            if (foundArea) {
                where.areaId = foundArea.id;
            } else {
                return res.json({
                    total: 0,
                    page: Number(page),
                    totalPages: 0,
                    limit: Number(limit),
                    items: [],
                });
            }
        }

        // Пошук по інгредієнту (назва, нижній регістр)
        if (ingredient) {
            const foundIngredient = await Ingredient.findOne({
                where: Sequelize.where(
                    Sequelize.fn("LOWER", Sequelize.col("name")),
                    ingredient.toLowerCase()
                ),
            });

            if (!foundIngredient) {
                return res.json({
                    total: 0,
                    page: Number(page),
                    totalPages: 0,
                    limit: Number(limit),
                    items: [],
                });
            }

            include.push({
                model: Ingredient,
                as: "ingredients",
                where: { id: foundIngredient.id },
                attributes: ["id", "name", "thumb"],
                through: { attributes: [] },
                required: true,
            });
        } else {
            include.push({
                model: Ingredient,
                as: "ingredients",
                attributes: ["id", "name", "thumb"],
                through: { attributes: [] },
            });
        }

        const { count, rows } = await Recipe.findAndCountAll({
            where,
            include,
            distinct: true,
            offset,
            limit: Number(limit),
            order: [["createdAt", "DESC"]],
        });

        const totalPages = Math.ceil(count / Number(limit));

        // Формуємо результат з деталями без ID
        const items = rows.map((recipe) => ({
            id: recipe.id,
            title: recipe.title,
            preview: recipe.preview,
            instructions: recipe.instructions,
            description: recipe.description,
            time: recipe.time,
            createdAt: recipe.createdAt,
            updatedAt: recipe.updatedAt,
            area: recipe.area?.name || null,
            category: recipe.category?.name || null,
            thumb: recipe.thumb,
            owner: recipe.owner
                ? {
                    name: recipe.owner.name,
                    avatarURL: recipe.owner.avatarURL,
                    id: recipe.owner.id,
                }
                : null,
            ingredients: recipe.ingredients || [],
        }));

        res.json({
            total: count,
            page: Number(page),
            totalPages,
            limit: Number(limit),
            items,
        });
    } catch (err) {
        next(HttpError(500, err.message));
    }
};

export const getOwnRecipes = async (req, res, next) => {
  req.query.owner = req.user.id;
  return getAllRecipes(req, res, next);
}

export const addToFavorites = async (req, res, next) => {
  try {
    const user = req.user; // set by auth middleware
    const { id: favoriteId } = req.params; // ID to follow

    const target = await Recipe.findByPk(favoriteId);
    if (!target) {
      throw HttpError(404, "Recipe not found");
    }

    await user.addFavorites(target);

    res.json({ message: `Added recipe ${favoriteId} to favorites` });
  } catch (err) {
    next(err.status ? err : HttpError(500, err.message));
  }
};

export const removeFromFavorites = async (req, res, next) => {
  try {
    const user = req.user;
    const { id: favoriteId } = req.params;

    const target = await Recipe.findByPk(favoriteId);
    if (!target) {
      throw HttpError(404, "Recipe not found");
    }

    await user.removeFavorites(target);

    res.json({ message: `Removed ${favoriteId} recipe from favorites` });
  } catch (err) {
    next(err.status ? err : HttpError(500, err.message));
  }
};

export const getFavorites = async (req, res, next) => {
  try {
    const user = req.user;
    const favorites = await user.getFavorites();
    res.json(favorites);
  } catch (err) {
    next(err.status ? err : HttpError(500, err.message));
  }
};

export const getPopular = async (_, res, next) => {
  try {
    const popularRecipes = await Recipe.findAll({
      subQuery: false,
      attributes: {
        exclude: ["ownerId"],
        include: [
          [
            Sequelize.fn("COUNT", Sequelize.col("favorited.id")),
            "favoritesCount",
          ],
        ],
      },
      include: [
        {
          model: User,
          as: "favorited",
          attributes: [],
          through: { attributes: [] },
        },
        {
          model: User,
          as: "owner",
          attributes: ["id", "name", "avatarURL"],
        },
      ],
      group: ["Recipe.id", "owner.id"],
      having: Sequelize.literal('COUNT("favorited"."id") > 0'),
      order: [[Sequelize.fn("COUNT", Sequelize.col("favorited.id")), "DESC"]],
      limit: 4,
    });

    res.json(popularRecipes);
  } catch (err) {
    next(err.status ? err : HttpError(500, err.message));
 }
};