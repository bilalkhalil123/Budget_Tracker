import React, { useState } from 'react';
import { Input, Button, Form, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import './ForgotPasswordPage.css';
import logo from '../../assets/app-logo.png';
import reset1 from '../../assets/password-reset-1.png';
import reset2 from '../../assets/password-reset-2.png';
import reset3 from '../../assets/password-reset-3.png';
import ApiService from '../../services/api';

const ForgotPasswordPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const response = await ApiService.forgotPassword({
        email: values.email
      });

      if (response.success) {
        message.success('Password reset functionality will be implemented soon!');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="forgot-password-page" role="main">
      <div className="content-container">
        <section className="form-section" aria-labelledby="forgot-password-title">
          <header className="logo-title-wrapper">
            <img src={logo} alt="Budget Tracker Logo" className="logo-img" />
            <h1 className="app-title">Budget Tracker</h1>
          </header>
          
          <div className="form-container">
            <h2 id="forgot-password-title" className="welcome-text">Reset Password</h2>
            <p className="subtitle">Enter your email for a reset link.</p>
            
            <Form
              form={form}
              name="forgot-password"
              onFinish={handleSubmit}
              className="forgot-password-form"
              layout="vertical"
              size="large"
              role="form"
              aria-labelledby="forgot-password-title"
            >
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

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="reset-button"
                  block
                >
                  Send Reset Password Link
                </Button>
              </Form.Item>
            </Form>

            <div className="signup-link">
              <p>Don't have an account? <Link to="/signup" className="signup-text">Sign Up</Link></p>
            </div>
          </div>
        </section>

        <aside className="illustration-section" aria-hidden="true">
          <div className="reset-images-container">
            <img src={reset1} alt="Reset Step 1" className="reset-image reset-image-1" />
            <img src={reset2} alt="Reset Step 2" className="reset-image reset-image-2" />
            <img src={reset3} alt="Reset Step 3" className="reset-image reset-image-3" />
          </div>
        </aside>
      </div>
    </main>
  );
};

export default ForgotPasswordPage;

