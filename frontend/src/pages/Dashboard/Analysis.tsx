import React, { useState, useEffect } from 'react';
import { Card, Select, DatePicker, Row, Col } from 'antd';
import { Line } from '@ant-design/charts';
import dayjs from 'dayjs';
import ApiService, { Expense } from '../../services/api';
import './Analysis.css';

const { Option } = Select;
const { RangePicker } = DatePicker;

const Analysis: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    filterExpensesByTimeRange();
  }, [expenses, timeRange, dateRange]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getExpenses();
      setExpenses(response.data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterExpensesByTimeRange = () => {
    let filtered = [...expenses];
    const now = dayjs();

    if (dateRange) {
      // Custom date range
      filtered = filtered.filter(expense => {
        const expenseDate = dayjs(expense.date);
        return expenseDate.isAfter(dateRange[0]) && expenseDate.isBefore(dateRange[1]);
      });
    } else {
      // Predefined time ranges
      switch (timeRange) {
        case 'week':
          filtered = filtered.filter(expense => 
            dayjs(expense.date).isAfter(now.subtract(1, 'week'))
          );
          break;
        case 'month':
          filtered = filtered.filter(expense => 
            dayjs(expense.date).isAfter(now.subtract(1, 'month'))
          );
          break;
        case 'year':
          filtered = filtered.filter(expense => 
            dayjs(expense.date).isAfter(now.subtract(1, 'year'))
          );
          break;
      }
    }

    setFilteredExpenses(filtered);
  };

  const getChartData = () => {
    const groupedData: { [key: string]: number } = {};
    
    filteredExpenses.forEach(expense => {
      const date = dayjs(expense.date).format('MMM DD');
      groupedData[date] = (groupedData[date] || 0) + expense.amount;
    });

    return Object.entries(groupedData).map(([date, amount]) => ({
      date,
      amount,
    })).sort((a, b) => dayjs(a.date, 'MMM DD').valueOf() - dayjs(b.date, 'MMM DD').valueOf());
  };

 

 
  

  const chartConfig = {
    data: getChartData(),
    xField: 'date',
    yField: 'amount',
    smooth: true,
    color: '#8b5cf6',
    point: {
      size: 4,
      shape: 'circle',
      style: {
        fill: '#8b5cf6',
        stroke: '#8b5cf6',
        lineWidth: 1,
      },
    },
    line: {
      size: 2,
      style: {
        stroke: '#8b5cf6',
        lineCap: 'round',
        lineJoin: 'round',
      },
    },
    tooltip: {
      formatter: (datum: any) => {
        return { name: 'Amount', value: `${datum.amount.toLocaleString()} PKR` };
      },
    },
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    interactions: [
      {
        type: 'marker-active',
      },
    ],
  };

  return (
    <article className="analysis-container" role="main" aria-labelledby="analysis-title">
      <header className="analysis-header">
        <h2 id="analysis-title">Expense Trend</h2>
        <div className="analysis-controls" role="toolbar" aria-label="Analysis filters">
          <Select
            value={timeRange}
            onChange={(value) => {
              setTimeRange(value);
              setDateRange(null);
            }}
            style={{ width: 120, marginRight: 16 }}
            aria-label="Select time range for analysis"
          >
            <Option value="week">Last Week</Option>
            <Option value="month">Last Month</Option>
            <Option value="year">Last Year</Option>
          </Select>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
            placeholder={['Start Date', 'End Date']}
            getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
            disabledDate={(current) => !!current && current > dayjs().endOf('day')}
            aria-label="Select custom date range"
          />
        </div>
      </header>

      <section className="analysis-chart-only" aria-labelledby="chart-section-title">
        <Card loading={loading} className="chart-card" aria-label="Expense trend chart">
          <div className="chart-container" role="img" aria-label="Line chart showing expense trends over time">
            {getChartData().length > 0 ? (
              <Line {...chartConfig} />
            ) : (
              <div className="no-data" role="status" aria-live="polite">No data available for the selected period</div>
            )}
          </div>
        </Card>
      </section>
    </article>
  );
};

export default Analysis;
