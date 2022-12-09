const express = require('express');
const mealsController = require('../controllers/meals');
const { body } = require('express-validator/check');
const router = express.Router();
const isAdmin = require('../middleware/is-admin');

const addMealValidator = [
  body('title')
    .isString()
    .isLength({ min: 3, max: 150 })
    .withMessage('Please enter a valid title.')
    .trim(),

  body('price')
    .isNumeric()
    .withMessage('Please enter a valid price')
    .custom((value) => {
      if (value < 0) {
        return Promise.reject('price can not be less than 1');
      }
      return true;
    }),

  body('description')
    .isString()
    .withMessage('Please enter a valid price')
    .trim(),
];

// GET /feed/posts
router.get('/fetch-meals', mealsController.fetchMeals);


// POST /meals/add-meal
router.post(
  '/add-meal',
  addMealValidator,
  isAdmin,
  mealsController.postAddMeal
);

// PUT /meals/update-meal/:mealId

router.put('/update-meal/:mealId', isAdmin, mealsController.updateMeal);

router.put('/delete-meal/:mealId', mealsController.postDeleteMeal);

module.exports = router;
