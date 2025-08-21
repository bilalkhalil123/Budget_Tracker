import React, { useState } from 'react';
import { Input, Button, Form, message } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone, MailOutlined, DollarOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import './SignupPage.css';
import logo from '../../assets/app-logo.png';
import signupIllustration from '../../assets/signup-illustration.png';
import ApiService from '../../services/api';

const SignupPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const response = await ApiService.signup({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        budgetLimit: parseFloat(values.budgetLimit)
      });

      if (response.success) {
        message.success('Account created successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (error: any) {
      message.error(error.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="signup-page" role="main">
      <div className="content-container">
        <section className="form-section" aria-labelledby="signup-title">
          <header className="logo-title-wrapper">
            <img src={logo} alt="Budget Tracker Logo" className="logo-img" />
            <h1 className="app-title">Budget Tracker</h1>
          </header>
          
          <div className="form-container">
            <h2 id="signup-title" className="welcome-text">Sign Up</h2>
            <p className="subtitle">Welcome to our community</p>
            
            <Form
              form={form}
              name="signup"
              onFinish={handleSubmit}
              className="signup-form"
              layout="vertical"
              size="large"
              role="form"
              aria-labelledby="signup-title"
            >
              <div className="name-row">
                <Form.Item
                  name="firstName"
                  label="First Name"
                  rules={[
                    { required: true, message: 'Please enter your first name!' }
                  ]}
                  className="ant-form-item-custom name-field"
                >
                  <Input
                    placeholder="Cameron"
                    className="ant-input-custom"
                  />
                </Form.Item>

                <Form.Item
                  name="lastName"
                  label="Last Name"
                  rules={[
                    { required: true, message: 'Please enter your last name!' }
                  ]}
                  className="ant-form-item-custom name-field"
                >
                  <Input
                    placeholder="Williamson"
                    className="ant-input-custom"
                  />
                </Form.Item>
              </div>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter your email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
                className="ant-form-item-custom"
              >
                <Input
                  prefix={<MailOutlined className="site-form-item-icon" />}
                  placeholder="test@gmail.com"
                  className="ant-input-custom"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: 'Please enter your password!' },
                  { min: 6, message: 'Password must be at least 6 characters!' }
                ]}
                className="ant-form-item-custom"
              >
                <Input.Password
                  placeholder="Enter your password"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  className="ant-input-custom"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Please confirm your password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The two passwords do not match!'));
                    },
                  }),
                ]}
                className="ant-form-item-custom"
              >
                <Input.Password
                  placeholder="Enter your password"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  className="ant-input-custom"
                />
              </Form.Item>

              <Form.Item
                name="budgetLimit"
                label="Budget Limit"
                rules={[
                  { required: true, message: 'Please enter your budget limit!' }
                ]}
                className="ant-form-item-custom"
              >
                <Input
                  placeholder="Enter Amount"
                  className="ant-input-custom"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="signup-button"
                  block
                >
                  SIGN UP
                </Button>
              </Form.Item>
            </Form>

            <div className="login-link">
              <p>Already have an account? <Link to="/login" className="login-text">Log in</Link></p>
            </div>
          </div>
        </section>

        <aside className="illustration-section" aria-hidden="true">
          <img src={signupIllustration} alt="Signup Illustration" className="signup-illustration" />
        </aside>
      </div>
    </main>
  );
};

export default SignupPage;

