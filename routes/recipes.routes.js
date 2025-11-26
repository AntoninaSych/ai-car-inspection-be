import auth from '../middlewares/auth.js';
import { Router } from 'express';
import {
  getAllRecipes,
  getOwnRecipes,
  getRecipeById,
  createRecipe,
  deleteOwnRecipe,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  getPopular,
} from '../controllers/recipes.controller.js';
import upload from '../middlewares/upload.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Recipes
 *   description: API endpoints for managing recipes
 */

/**
 * @swagger
 * /api/recipes/:
 *   get:
 *     summary: Search recipes by category name, ingredient name, and area name with pagination
 *     tags: [Recipes]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category name (case-insensitive)
 *       - in: query
 *         name: ingredient
 *         schema:
 *           type: string
 *         description: Filter by ingredient name (case-insensitive)
 *       - in: query
 *         name: area
 *         schema:
 *           type: string
 *         description: Filter by area name (case-insensitive)
*       - in: query
 *         name: owner
 *         schema:
 *           type: string
 *           default: ""
 *         description: Filter by owner ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Paginated list of recipes matching filters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total number of matching recipes
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 recipes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recipe'
 */
router.get("/", getAllRecipes);


/**
 * @swagger
 * /api/recipes/popular:
 *   get:
 *     summary: Get popular recipes
 *     tags: [Recipes]
 *     responses:
 *       200:
 *         description: A list of popular recipes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recipe'
 *       500:
 *         description: Internal server error
 */
router.get("/popular", getPopular);

/**
 * @swagger
 * /api/recipes/favorites:
 *   get:
 *     summary: Get recipes favorited by the current user
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of recipes favorited by the authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recipe'
 *       401:
 *         description: Unauthorized (no or invalid JWT)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.get("/favorites", auth, getFavorites);

/**
 * @swagger
 * /api/recipes/own:
 *   get:
 *     summary: Get recipes created by the current user
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of recipes created by the authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recipe'
 *       401:
 *         description: Unauthorized (no or invalid JWT)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.get("/own", auth, getOwnRecipes);

/**
 * @swagger
 * /api/recipes/{id}:
 *   get:
 *     summary: Get recipe by ID
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the recipe
 *     responses:
 *       200:
 *         description: Recipe found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: "a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6"
 *                 title:
 *                   type: string
 *                   example: "Chicken Curry"
 *                 description:
 *                   type: string
 *                   example: "Delicious spicy chicken curry recipe."
 *                 instructions:
 *                   type: string
 *                   example: "Mix spices, cook chicken, and simmer for 30 minutes."
 *                 thumb:
 *                   type: string
 *                   format: uri
 *                   example: "https://example.com/images/chicken-curry.jpg"
 *                 time:
 *                   type: string
 *                   example: "45 min"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-04-29T12:34:56.000Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-04-29T13:45:00.000Z"
 *                 area:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "b2a3c4d5-f6g7-8h9i-j0k1-l2m3n4o5p6q7"
 *                     name:
 *                       type: string
 *                       example: "Indian"
 *                 owner:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "john@example.com"
 *                 ingredients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: "789e0123-f456-789a-bcde-1234567890ab"
 *                       name:
 *                         type: string
 *                         example: "Chicken"
 *       404:
 *         description: Recipe not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Recipe not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Something went wrong"
 */
router.get("/:id", getRecipeById);

/**
 * @swagger
 * /api/recipes:
 *   post:
 *     summary: Create a new recipe
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - categoryId
 *               - ingredients
 *               - areaId
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Avocado Toast"
 *               description:
 *                 type: string
 *                 example: "Tasty and healthy toast with avocado and egg"
 *               instructions:
 *                 type: string
 *                 example: "Toast bread, mash avocado, poach egg, combine"
 *               time:
 *                 type: string
 *                 example: "10 min"
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 example: "1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6"
 *               areaId:
 *                 type: string
 *                 format: uuid
 *                 example: "d4c3b2a1-f6e5-d7c8-b9a0-j1k2l3m4n5o6"
 *               ingredients:
 *                 type: string
 *                 description: JSON.stringify array of ingredient objects with id and measure
 *                 example: '[{"id": "abc-123", "measure": "1 tsp"}, {"id": "def-456", "measure": "200g"}]'
 *               thumb:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Recipe created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Recipe created successfully"
 *                 recipeId:
 *                   type: string
 *                   format: uuid
 *                   example: "f1e2d3c4-b5a6-7890-1234-abcdefabcdef"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/", auth, upload.single("thumb"), createRecipe);

/**
 * @swagger
 * /api/recipes/{id}:
 *   delete:
 *     summary: Delete own recipe
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identifier of the recipe to delete
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Recipe successfully deleted
 *       403:
 *         description: Access denied. The user is not the owner of the recipe.
 *       404:
 *         description: Recipe not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", auth, deleteOwnRecipe);

/**
 * @swagger
 * /api/recipes/{id}/favorite:
 *   post:
 *     summary: Add a recipe to favorites
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the recipe to add to favorites
 *     responses:
 *       200:
 *         description: Recipe added to favorites
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Added recipe 123e4567-e89b-12d3-a456-426614174000 to favorites
 *       401:
 *         description: Unauthorized (no or invalid JWT)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Recipe not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.post("/:id/favorite", auth, addToFavorites);

/**
 * @swagger
 * /api/recipes/{id}/favorite:
 *   delete:
 *     summary: Remove a recipe from favorites
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the recipe to remove from favorites
 *     responses:
 *       200:
 *         description: Recipe removed from favorites
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Removed recipe 123e4567-e89b-12d3-a456-426614174000 from favorites
 *       401:
 *         description: Unauthorized (no or invalid JWT)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Recipe not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.delete("/:id/favorite", auth, removeFromFavorites);




export default router;
