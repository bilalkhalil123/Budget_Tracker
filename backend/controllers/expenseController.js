const Expense = require('../models/Expense');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Get all expenses for a user with pagination and filtering
exports.getExpenses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 8,
      search = '',
      sortBy = 'date',
      sortOrder = 'desc',
      category,
      dateFrom,
      dateTo,
    } = req.query;

    
    const filter = { user: req.user.id };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
       
      ];
    }
    
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    // Sorting
    const sortField = ['title', 'amount', 'date', 'category', 'createdAt', 'updatedAt'].includes(String(sortBy))
      ? String(sortBy)
      : 'date';
    const sortDirection = String(sortOrder).toLowerCase() === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortDirection };

    // Pagination
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNum - 1) * limitNum;

    // Total count for pagination
    const total = await Expense.countDocuments(filter);

    // Query expenses
    const expenses = await Expense.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'firstName lastName budgetLimit');

    // Response data
    const data = expenses.map((e) => e.toObject());

    const response = {
      success: true,
      count: expenses.length,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum) || 1,
      data,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching expenses',
    });
  }
};

exports.getExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    }).populate('user', 'firstName lastName budgetLimit');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching expense'
    });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, amount, date, category } = req.body;

    const expense = await Expense.create({
      title,
      amount,
      spentAmount: 0, // Initialize with 0 spent
      date: date || new Date(),
      category: category || 'General',
      user: req.user.id
    });

    const populatedExpense = await Expense.findById(expense._id)
      .populate('user', 'firstName lastName budgetLimit');

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: populatedExpense
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating expense'
    });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, amount, date, category } = req.body;

    let expense = await Expense.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Do not allow reducing budget below already spent
    if (typeof amount === 'number' && amount < (expense.spentAmount || 0)) {
      return res.status(400).json({
        success: false,
        message: `Budget amount cannot be less than already spent amount (${(expense.spentAmount || 0)}).`
      });
    }

    expense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        title,
        amount,
        date,
        category,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName budgetLimit');

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: expense
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating expense'
    });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    await Expense.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting expense'
    });
  }
};

// Add spending to an expense
exports.addSpending = async (req, res) => {
  try {
    const { spendingAmount } = req.body;
    
    if (spendingAmount === undefined || spendingAmount === null || Number(spendingAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid spending amount is required'
      });
    }

    let expense = await Expense.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Prevent spending over the budget
    const currentSpent = expense.spentAmount || 0;
    const budget = expense.amount || 0;
    const nextSpent = currentSpent + Number(spendingAmount);

    if (nextSpent > budget) {
      return res.status(400).json({
        success: false,
        message: `This spending would exceed the budget. Remaining you can spend: ${Math.max(0, budget - currentSpent)}`
      });
    }

    // Add to the current spent amount
    expense.spentAmount = nextSpent;
    expense.updatedAt = Date.now();
    
    await expense.save();

    const populatedExpense = await Expense.findById(expense._id)
      .populate('user', 'firstName lastName budgetLimit');

    res.status(200).json({
      success: true,
      message: 'Spending added successfully',
      data: populatedExpense
    });
  } catch (error) {
    console.error('Add spending error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding spending'
    });
  }
};

// Get expense statistics
exports.getExpenseStats = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id });
    const user = await User.findById(req.user.id);

    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const expensesByCategory = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    const monthlyExpenses = expenses.reduce((acc, expense) => {
      const month = expense.date.toISOString().slice(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + expense.amount;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        totalSpent,
        budgetLimit: user.budgetLimit,
        remainingBudget: user.budgetLimit - totalSpent,
        budgetUsedPercentage: user.budgetLimit > 0 ? Math.round((totalSpent / user.budgetLimit) * 100) : 0,
        expensesByCategory,
        monthlyExpenses,
        totalExpenses: expenses.length
      }
    });
  } catch (error) {
    console.error('Get expense stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching expense statistics'
    });
  }
};
