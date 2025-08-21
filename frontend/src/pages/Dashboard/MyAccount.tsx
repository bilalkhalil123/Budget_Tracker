import React, { useEffect, useState } from 'react';
import { Button, Card, Col, DatePicker, Form, Input, Row, Select, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { LeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import ApiService from '../../services/api';

const { Title } = Typography;

const MyAccount: React.FC = () => {
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await ApiService.getProfile();
        if (mounted && res.success) {
          const u = res.user;
          form.setFieldsValue({
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            jobTitle: 'Simmons',
            street: '78 south 34 North',
            city: 'North Orange',
            state: 'New York',
            zip: '98768655',
            address: '',
            phone: '123-456-889',
            email: u.email || '',
            dob: dayjs('1999-09-03'),
            education: 'Masters',
            gender: 'Female',
            budget: `${u.budgetLimit || '1000-50000'}`,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [form]);

  const onFinish = async (values: any) => {
    try {
      setSubmitting(true);
      const payload: any = {};
      if (values.firstName) payload.firstName = values.firstName;
      if (values.lastName) payload.lastName = values.lastName;
      if (values.email) payload.email = values.email;
      if (values.budget) {
        const num = Number(values.budget.toString().replace(/[^0-9.]/g, ''));
        if (!Number.isNaN(num)) payload.budgetLimit = num;
      }

      const res = await ApiService.updateProfile(payload);
      if (res.success) {
        message.success('Profile updated');
      }
    } catch (e: any) {
      message.error(e?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button type="text" icon={<LeftOutlined />} onClick={() => navigate('/dashboard')} aria-label="Back to dashboard" />
          <Title level={3} style={{ margin: 0 }}>Profile</Title>
        </div>
        <div className="profile-tabs">
          <button className="tab" onClick={() => navigate('/profile')}>Profile</button>
          <button className="tab active" onClick={() => navigate('/my-account')}>My account</button>
        </div>
      </header>

      <Card className="account-card" bodyStyle={{ paddingTop: 0 }} loading={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Title level={5} className="section-title">Name & Job</Title>
          <Row gutter={16}>
            <Col xs={24} md={8}><Form.Item name="firstName" label="First Name"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="lastName" label="Last Name"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="jobTitle" label="Job Title"><Input /></Form.Item></Col>
          </Row>

          <Title level={5} className="section-title">Address</Title>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item name="street" label="Street Address"><Input /></Form.Item></Col>
            <Col xs={24} md={6}><Form.Item name="city" label="City"><Input /></Form.Item></Col>
            <Col xs={24} md={6}><Form.Item name="state" label="State"><Input /></Form.Item></Col>
            <Col xs={24} md={6}><Form.Item name="zip" label="Zip Code"><Input /></Form.Item></Col>
            <Col xs={24}><Form.Item name="address" label="Complete Address"><Input /></Form.Item></Col>
          </Row>

          <Title level={5} className="section-title">Contact Info</Title>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item name="phone" label="Phone Number"><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="email" label="Email"><Input /></Form.Item></Col>
          </Row>

          <Title level={5} className="section-title">Bio</Title>
          <Row gutter={16}>
            <Col xs={24} md={8}><Form.Item name="dob" label="Date of Birth"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="education" label="Education"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="gender" label="Gender"><Select options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }]} /></Form.Item></Col>
          </Row>

          <Title level={5} className="section-title">Financial Information</Title>
          <Row gutter={16}>
            <Col xs={24} md={8}><Form.Item name="budget" label="Budget(PKR)"><Input /></Form.Item></Col>
          </Row>

          <div className="form-actions">
            <Button type="primary" htmlType="submit" loading={submitting}>Update</Button>
            <Button onClick={() => form.resetFields()}>Cancel</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default MyAccount;
