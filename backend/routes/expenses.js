const express = require('express');
const router = express.Router();
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  addSpending
} = require('../controllers/expenseController');
const authMiddleware = require('../middleware/auth');
const { validateExpense } = require('../middleware/validation');

router.use(authMiddleware);

router.route('/')
  .get(getExpenses)
  .post(validateExpense, createExpense);

router.route('/stats')
  .get(getExpenseStats);

router.route('/:id')
  .get(getExpense)
  .put(validateExpense, updateExpense)
  .delete(deleteExpense);

router.route('/:id/spending')
  .post(addSpending);

module.exports = router;
