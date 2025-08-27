import React, { useState, useEffect, useCallback } from 'react';
import { Button, Table, Modal, Form, Input, DatePicker, message, Progress, Select, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import ApiService, { Expense, ExpenseData } from '../../services/api';
import './Expenses.css';

const { Search } = Input;
const { Option } = Select;

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);
  const [total, setTotal] = useState<number>(0);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [addSpendingModalVisible, setAddSpendingModalVisible] = useState(false);
  const [currentSpendingExpense, setCurrentSpendingExpense] = useState<Expense | null>(null);
  const [spendingForm] = Form.useForm();
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const user = ApiService.getCurrentUser();

  useEffect(() => {
    fetchExpenses({ page: 1 });
  }, []);

  useEffect(() => {
    // Server-driven, keep filteredExpenses in sync with expenses array
    setFilteredExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExpenses({ page: 1 });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, sortOrder]);


  const fetchExpenses = async ({ page: nextPage }: { page?: number } = {}) => {
    setLoading(true);
    try {
      const response: any = await ApiService.getExpenses({
        page: nextPage || page,
        limit: pageSize,
        search: searchTerm,
        sortBy: 'date',
        sortOrder: sortOrder,
      });
      if (response.success) {
        setExpenses(response.data || []);
        setTotal(response.total || 0);
        setPage(response.page || nextPage || 1);
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };



  const validateBudgetLimit = (newAmount: number): boolean => {
    if (!user?.budgetLimit) return true;
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    return (totalExpenses + newAmount) <= user.budgetLimit;
  };

  const handleAddExpense = async (values: any) => {
    try {
      const amount = parseFloat(values.amount);
      const currentTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const newTotal = currentTotal + amount;

      if (!validateBudgetLimit(amount)) {
        Modal.confirm({
          title: 'Budget Limit Exceeded!',
          content: (
            <div style={{ padding: '20px 0' }}>
              <p>Adding this expense will exceed your budget limit.</p>
              <div style={{ margin: '16px 0', padding: '12px', background: '#fff2f0', borderRadius: '6px', border: '1px solid #ffccc7' }}>
                <div><strong>Current Total:</strong> {currentTotal.toLocaleString()} PKR</div>
                <div><strong>New Expense:</strong> {amount.toLocaleString()} PKR</div>
                <div><strong>New Total:</strong> {newTotal.toLocaleString()} PKR</div>
                <div><strong>Budget Limit:</strong> {user.budgetLimit.toLocaleString()} PKR</div>
                <div style={{ color: '#ff4d4f', fontWeight: 'bold', marginTop: '8px' }}>
                  <strong>Exceeded by:</strong> {(newTotal - user.budgetLimit).toLocaleString()} PKR
                </div>
              </div>
              <p>Do you want to continue anyway?</p>
            </div>
          ),
          okText: 'Continue Anyway',
          cancelText: 'Cancel',
          okType: 'danger',
          onOk: async () => {
            const expenseData: ExpenseData = {
              title: values.title,
              amount: amount,
              date: values.date.format('YYYY-MM-DD'),
              category: values.category || 'General'
            };

            try {
              const response = await ApiService.createExpense(expenseData);
              if (response.success) {
                message.success('Expense added successfully!');
                setAddModalVisible(false);
                form.resetFields();
                fetchExpenses();
              }
            } catch (error: any) {
              message.error(error.message || 'Failed to add expense');
            }
          }
        });
        return;
      }

      const expenseData: ExpenseData = {
        title: values.title,
        amount: amount,
        date: values.date.format('YYYY-MM-DD'),
        category: values.category || 'General'
      };

      const response = await ApiService.createExpense(expenseData);
      if (response.success) {
        message.success('Expense added successfully!');
        setAddModalVisible(false);
        form.resetFields();
        fetchExpenses();
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to add expense');
    }
  };

  const handleEditExpense = async (values: any) => {
    if (!currentExpense) return;

    try {
      const amount = parseFloat(values.amount);
      const currentSpent = currentExpense.spentAmount || 0;

      if (!validateBudgetLimit(amount)) {
        message.error(`Expense amount (${amount.toLocaleString()} PKR) exceeds your budget limit of ${user.budgetLimit.toLocaleString()} PKR`);
        return;
      }

      if (amount < currentSpent) {
        message.error(`Budget amount cannot be less than already spent amount (${currentSpent.toLocaleString()} PKR). Current budget must be at least ${currentSpent.toLocaleString()} PKR`);
        return;
      }

      const expenseData: ExpenseData = {
        title: values.title,
        amount: amount,
        date: values.date.format('YYYY-MM-DD'),
        category: values.category || 'General'
      };

      const response = await ApiService.updateExpense(currentExpense._id, expenseData);
      if (response.success) {
        message.success('Expense updated successfully!');
        setEditModalVisible(false);
        editForm.resetFields();
        setCurrentExpense(null);
        fetchExpenses();
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to update expense');
    }
  };

  const handleDeleteExpense = async () => {
    if (!currentExpense) return;

    try {
      const response = await ApiService.deleteExpense(currentExpense._id);
      if (response.success) {
        message.success('Expense deleted successfully!');
        setDeleteModalVisible(false);
        setCurrentExpense(null);
        fetchExpenses();
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to delete expense');
    }
  };



  const openEditModal = (expense: Expense) => {
    setCurrentExpense(expense);
    editForm.setFieldsValue({
      title: expense.title,
      amount: expense.amount,
      date: dayjs(expense.date),
      category: expense.category
    });
    setEditModalVisible(true);
  };

  const openDeleteModal = (expense: Expense) => {
    setCurrentExpense(expense);
    setDeleteModalVisible(true);
  };

  const openAddSpendingModal = (expense: Expense) => {
    setCurrentSpendingExpense(expense);
    spendingForm.setFieldsValue({
      currentSpent: expense.spentAmount || 0
    });
    setAddSpendingModalVisible(true);
  };

  const handleAddSpending = async (values: any) => {
    if (!currentSpendingExpense) return;

    try {
      const spendingAmount = parseFloat(values.spendingAmount);
      const currentSpent = currentSpendingExpense.spentAmount || 0;
      const budget = currentSpendingExpense.amount;
      const newTotalSpent = currentSpent + spendingAmount;

      if (spendingAmount <= 0) {
        message.error('Spending amount must be greater than 0');
        return;
      }

      if (newTotalSpent > budget) {
        message.error(`Cannot spend ${spendingAmount.toLocaleString()} PKR. This would exceed the budget of ${budget.toLocaleString()} PKR. Maximum you can spend: ${(budget - currentSpent).toLocaleString()} PKR`);
        return;
      }

      const response = await ApiService.addSpending(currentSpendingExpense._id, spendingAmount);
      if (response.success) {
        message.success(`Added ${spendingAmount.toLocaleString()} PKR to ${currentSpendingExpense.title}`);
        setAddSpendingModalVisible(false);
        spendingForm.resetFields();
        setCurrentSpendingExpense(null);
        fetchExpenses();
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to add spending');
    }
  };

  const columns = [
    {
      title: 'Expense',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <span className="expenses__expense-name">{text}</span>
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (_: any, record: Expense) => {
        const percentage = record.amount > 0 ? Math.round(((record.spentAmount || 0) / record.amount) * 100) : 0;
        return (
          <div className="expenses__progress-container">
            <Progress
              percent={Math.min(percentage, 100)}
              size="small"
              strokeColor={percentage > 100 ? "#ef4444" : "#7C3AED"}
              showInfo={false}
            />
            <span className="expenses__percentage">{percentage}%</span>
          </div>
        );
      }
    },
    {
      title: 'Budget(PKR)',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => <span className="expenses__budget">{amount.toLocaleString()}</span>
    },
    {
      title: 'Spent(PKR)',
      dataIndex: 'spentAmount',
      key: 'spentAmount',
      render: (spentAmount: number, record: Expense) => (
        <div className="expenses__spent-container">
          <span className="expenses__spent">{(spentAmount || 0).toLocaleString()}</span>
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openAddSpendingModal(record)}
            className="expenses__add-spending-btn"
          />
        </div>
      )
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => <span className="expenses__date">{dayjs(date).format('DD MMM YYYY')}</span>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Expense) => (
        <div className="expenses__actions">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            className="expenses__action-btn expenses__action-btn--edit"
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => openDeleteModal(record)}
            className="expenses__action-btn expenses__action-btn--delete"
          />
        </div>
      )
    }
  ];

  return (
    <article className="expenses" role="main" aria-labelledby="expenses-title">
      <header className="expenses__page-header">
        <h2 id="expenses-title" className="expenses__page-title">Expenses</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setAddModalVisible(true)}
          className="expenses__add-btn"
          aria-label="Add new expense"
        >
          Add Expenses
        </Button>
      </header>

      <section className="expenses__table-container" aria-labelledby="expenses-table-title">
        <header className="expenses__table-header">
          <h3 id="expenses-table-title" className="expenses__table-title">Expenses</h3>
          <div className="expenses__controls" role="search" aria-label="Expense filters">
            <Search
              placeholder="Search expenses..."
              allowClear
              enterButton={<SearchOutlined />}
              size="middle"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 300, marginRight: 16 }}
              aria-label="Search expenses by name or category"
            />
            <Select
              value={sortOrder}
              onChange={setSortOrder}
              style={{ width: 150 }}
              placeholder="Sort by Date"
              aria-label="Sort expenses by date"
            >
              <Option value="desc">Newest First</Option>
              <Option value="asc">Oldest First</Option>
            </Select>
          </div>
        </header>

        <Table
          columns={columns}
          dataSource={filteredExpenses}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: false,
            showQuickJumper: false,
            showTotal: (t, range) => `Showing ${range[0]}-${range[1]} of ${t}`,
            onChange: (p) => {
              setPage(p);
              fetchExpenses({ page: p });
            },
          }}
          className="expenses__table"
        />
      </section>

      {/* Add Expense Modal */}
      <Modal
        title="Add Expense"
        open={addModalVisible}
        onCancel={() => {
          setAddModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        className="expenses__modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddExpense}
          className="expenses__form"
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter expense title!' }]}
          >
            <Input placeholder="Prestigious Clientele Segment" />
          </Form.Item>

          <div className="expenses__form-row">
            <Form.Item
              name="amount"
              label="Budget Amount(PKR)"
              rules={[
                { required: true, message: 'Please enter budget amount!' },
                {
                  validator: (_, value) => {
                    const minAllowed = currentExpense ? (currentExpense.spentAmount || 0) : 0;
                    if (value === undefined || value === null || value === '') return Promise.resolve();
                    const num = typeof value === 'number' ? value : parseFloat(value);
                    if (!isNaN(num) && num < minAllowed) {
                      return Promise.reject(new Error(`Budget cannot be less than already spent amount (${minAllowed.toLocaleString()} PKR)`));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
              className="expenses__form-item--half"
            >
              <InputNumber
                placeholder="3000"
                style={{ width: '100%' }}
                min={currentExpense ? (currentExpense.spentAmount || 0) : 0}
                precision={2}
              />
            </Form.Item>

            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true, message: 'Please select date!' }]}
              className="expenses__form-item--half"
            >
              <DatePicker
                format="DD/MM/YYYY"
                placeholder="16/09/2022"
                style={{ width: '100%' }}
                getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
              />
            </Form.Item>
          </div>

          <div className="expenses__modal-actions">
            <Button onClick={() => {
              setAddModalVisible(false);
              form.resetFields();
            }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Add
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Expense Modal */}
      <Modal
        title="Edit Expense"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
          setCurrentExpense(null);
        }}
        footer={null}
        className="expenses__modal"
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditExpense}
          className="expenses__form"
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter expense title!' }]}
          >
            <Input placeholder="Prestigious Clientele Segment" />
          </Form.Item>

          <div className="expenses__form-row">
            <Form.Item
              name="amount"
              label="Budget Amount(PKR)"
              rules={[{ required: true, message: 'Please enter budget amount!' }]}
              className="expenses__form-item--half"
            >
              <InputNumber placeholder="3000" style={{ width: '100%' }} min={0} precision={2} />
            </Form.Item>

            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true, message: 'Please select date!' }]}
              className="expenses__form-item--half"
            >
              <DatePicker
                format="DD/MM/YYYY"
                placeholder="16/09/2022"
                style={{ width: '100%' }}
                getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
              />
            </Form.Item>
          </div>

          <div className="expenses__modal-actions">
            <Button onClick={() => {
              setEditModalVisible(false);
              editForm.resetFields();
              setCurrentExpense(null);
            }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Add Spending Modal */}
      <Modal
        title="Add Spending"
        open={addSpendingModalVisible}
        onCancel={() => {
          setAddSpendingModalVisible(false);
          spendingForm.resetFields();
          setCurrentSpendingExpense(null);
        }}
        footer={null}
        className="expenses__modal"
      >
        <Form
          form={spendingForm}
          layout="vertical"
          onFinish={handleAddSpending}
          className="expenses__form"
        >
          <div className="expenses__spending-info">
            <div className="expenses__spending-field">
              <span className="expenses__spending-label">Expense</span>
              <span className="expenses__spending-value">{currentSpendingExpense?.title}</span>
            </div>
            <div className="expenses__spending-row">
              <div className="expenses__spending-field">
                <span className="expenses__spending-label">Budget</span>
                <span className="expenses__spending-value">{currentSpendingExpense?.amount.toLocaleString()} PKR</span>
              </div>
              <div className="expenses__spending-field">
                <span className="expenses__spending-label">Already Spent</span>
                <span className="expenses__spending-value">{(currentSpendingExpense?.spentAmount || 0).toLocaleString()} PKR</span>
              </div>
            </div>
          </div>

          <Form.Item
            name="spendingAmount"
            label="Add Spending Amount (PKR)"
            rules={[
              { required: true, message: 'Please enter spending amount!' },
              { type: 'number', min: 0.01, message: 'Amount must be greater than 0!' }
            ]}
          >
            <InputNumber
              placeholder="Enter amount spent"
              style={{ width: '100%' }}
              min={0}
              max={currentSpendingExpense ? currentSpendingExpense.amount - (currentSpendingExpense.spentAmount || 0) : undefined}
              precision={2}
            />
          </Form.Item>

          <div className="expenses__modal-actions">
            <Button onClick={() => {
              setAddSpendingModalVisible(false);
              spendingForm.resetFields();
              setCurrentSpendingExpense(null);
            }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Add Spending
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Delete Expense Modal */}
      <Modal
        title="Delete Expense"
        open={deleteModalVisible}
        onCancel={() => {
          setDeleteModalVisible(false);
          setCurrentExpense(null);
        }}
        footer={null}
        className="expenses__modal expenses__modal--delete"
      >
        <div className="expenses__delete-content">
          <div className="expenses__delete-info">
            <div className="expenses__delete-field">
              <span className="expenses__delete-label">Title</span>
              <span className="expenses__delete-value">{currentExpense?.title}</span>
            </div>
            <div className="expenses__delete-row">
              <div className="expenses__delete-field">
                <span className="expenses__delete-label">Budget(PKR)</span>
                <span className="expenses__delete-value">{currentExpense?.amount}</span>
              </div>
              <div className="expenses__delete-field">
                <span className="expenses__delete-label">Date</span>
                <span className="expenses__delete-value">
                  {currentExpense ? dayjs(currentExpense.date).format('DD/MM/YYYY') : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="expenses__modal-actions">
            <Button onClick={() => {
              setDeleteModalVisible(false);
              setCurrentExpense(null);
            }}>
              Cancel
            </Button>
            <Button type="primary" danger onClick={handleDeleteExpense}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </article>
  );
};

export default Expenses;
