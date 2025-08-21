import React, { useState } from 'react';
import { App, Input, Button, Checkbox, Form } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';
import logo from '../../assets/app-logo.png';
import illustration from '../../assets/login-illustration.png';
import ApiService from '../../services/api';

const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { message } = App.useApp();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const response = await ApiService.login({
        email: values.email,
        password: values.password
      });

      if (response.success) {
        message.success('Login successful!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (error: any) {
      message.error(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login" aria-label="Login page">
      <div className="login__bg" aria-hidden="true"></div>
      <div className="login__content">
        <section className="login__form-section" aria-labelledby="login-title">
          <header className="login__brand">
            <div className="login__brand-left">
              <img src={logo} alt="Budget Tracker Logo" className="login__logo" />
              <h1 id="login-title" className="login__title">Budget Tracker</h1>
            </div>
            <div className="login__brand-actions" />
          </header>
          <div className="login__form">
            <h2 className="login__welcome">Welcome Back!</h2>
            <p className="login__subtitle">Sign in to continue to Budget Tracker</p>

            <Form
              form={form}
              name="login"
              onFinish={handleSubmit}
              className="login__form-fields"
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter your email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
                className="login__form-item"
              >
                <Input
                  prefix={<UserOutlined className="site-form-item-icon" />}
                  placeholder="Enter your email"
                  className="login__input"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: 'Please enter your password!' },
                  { min: 6, message: 'Password must be at least 6 characters!' }
                ]}
                className="login__form-item"
              >
                <Input.Password
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  placeholder="Enter your password"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  className="login__input"
                />
              </Form.Item>

              <Form.Item className="login__options">
                <div className="login__options-row">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox className="login__checkbox">Remember me</Checkbox>
                  </Form.Item>
                  <Link to="/forgot-password" className="login__forgot">Forgot Password?</Link>
                </div>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="login__submit"
                  block
                >
                  LOG IN
                </Button>
              </Form.Item>
            </Form>

            <div className="login__signup">
              <p>Don't have an account? <Link to="/signup" className="login__signup-link">Sign Up</Link></p>
            </div>
          </div>
        </section>
        <aside className="login__illustration" aria-hidden="true">
          <img src={illustration} alt="" className="login__illustration-img" />
        </aside>
      </div>
    </section>
  );
};

export default LoginPage;

