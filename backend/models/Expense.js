const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Expense title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Budget amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  spentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Spent amount cannot be negative']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    default: 'General'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure spentAmount never exceeds the budgeted amount
expenseSchema.pre('validate', function(next) {
  if (typeof this.amount === 'number' && typeof this.spentAmount === 'number') {
    if (this.spentAmount > this.amount) {
      this.invalidate('spentAmount', 'Spent amount cannot exceed the budget amount');
    }
  }
  next();
});

expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
