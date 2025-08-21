import React, { useEffect, useRef, useState } from 'react';
import { Card, Row, Col, Avatar, Typography, Divider, Button, message } from 'antd';
import { MailOutlined, EnvironmentOutlined, LinkOutlined, PhoneOutlined, LeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './Profile.css';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/api';

const { Title, Text, Paragraph } = Typography;

const Profile: React.FC = () => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await ApiService.getProfile();
        if (mounted && res.success) {
          const u = res.user;
          setUser({
            firstName: u.firstName,
            lastName: u.lastName,
            avatarUrl: u.avatarUrl,
            jobTitle: 'Project Manager',
            phone: '(684) 555-0102',
            email: u.email,
            city: 'New York',
            website: 'www.websitename.com',
            about:
              'Passionate UI/UX designer with over 5 years of experience in creating user-friendly and visually appealing digital experiences. Skilled in wireframing, prototyping, and user research to deliver intuitive designs. Committed to enhancing user satisfaction through innovative and effective design solutions.',
            details: {
              fullName: `${u.firstName} ${u.lastName}`.trim(),
              city: 'New York',
              gender: 'Male',
              dob: '2019-10-26',
              email: u.email,
              education: 'Master',
              phone: '(684) 555-0102',
              zip: '123455',
              budget: `${u.budgetLimit || 30000} PKR`,
              address: '4140 parker Rd. Allentown, New Mexico 31134'
            }
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    const handler = (e: any) => {
      const updated = e?.detail;
      if (updated) {
        setUser((prev: any) => ({
          ...prev,
          firstName: updated.firstName,
          lastName: updated.lastName,
          email: updated.email,
          avatarUrl: updated.avatarUrl,
          details: {
            ...prev?.details,
            fullName: `${updated.firstName || ''} ${updated.lastName || ''}`.trim(),
            email: updated.email,
            budget: `${updated.budgetLimit || prev?.details?.budget || 0} PKR`
          }
        }));
      }
    };
    if (typeof window !== 'undefined') window.addEventListener('userUpdated', handler as any);
    return () => { mounted = false; if (typeof window !== 'undefined') window.removeEventListener('userUpdated', handler as any); };
  }, []);

  const onClickChangeAvatar = () => fileInputRef.current?.click();
  const onAvatarSelected: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const res = await ApiService.uploadAvatar(file);
      if (res.success && res.user) {
        message.success('Avatar updated');
        setUser((prev: any) => ({ ...prev, avatarUrl: res.user.avatarUrl }));
      }
    } catch (err: any) {
      message.error(err?.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
          <button className="tab active" onClick={() => navigate('/profile')}>Profile</button>
          <button className="tab" onClick={() => navigate('/my-account')}>My account</button>
        </div>
      </header>

      <Row gutter={24}>
        <Col xs={24} md={7}>
          <Card className="profile-card">
            <div className="profile-card-header">
              <Avatar
                size={84}
                src={user?.avatarUrl}
              />
              <div>
                <Title level={4} className="name">{user?.firstName} {user?.lastName}</Title>
                <Text type="secondary">{user?.jobTitle}</Text>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={onAvatarSelected} style={{ display: 'none' }} />
              <Button onClick={onClickChangeAvatar} loading={uploading}>Change Avatar</Button>
            </div>
            <Divider />
            <ul className="contact-list">
              <li><PhoneOutlined /> <Text type="secondary">{user?.phone}</Text></li>
              <li><MailOutlined /> <Text type="secondary">{user?.email}</Text></li>
              <li><EnvironmentOutlined /> <Text type="secondary">{user?.city}</Text></li>
              <li><LinkOutlined /> <a href={`https://${user?.website}`} target="_blank" rel="noreferrer">{user?.website}</a></li>
            </ul>
          </Card>
        </Col>

        <Col xs={24} md={17}>
          <Card className="about-card" title={<Text strong>About Me</Text>}>
            <Paragraph className="about-text">{user?.about}</Paragraph>
          </Card>

          <Card className="details-card" title={<Text strong>Personal Details</Text>}>
            <Row gutter={[24, 12]}>
              <Col xs={24} md={12}>
                <div className="detail-item">
                  <Text type="secondary">Full Name</Text>
                  <Text className="value">{user?.details?.fullName}</Text>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="detail-item">
                  <Text type="secondary">City</Text>
                  <Text className="value">{user?.details?.city}</Text>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className="detail-item">
                  <Text type="secondary">Gender</Text>
                  <Text className="value">{user?.details?.gender}</Text>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="detail-item">
                  <Text type="secondary">Phone</Text>
                  <Text className="value">{user?.details?.phone}</Text>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className="detail-item">
                  <Text type="secondary">Email</Text>
                  <Text className="value">{user?.details?.email}</Text>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="detail-item">
                  <Text type="secondary">Zip Code</Text>
                  <Text className="value">{user?.details?.zip}</Text>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className="detail-item">
                  <Text type="secondary">Education</Text>
                  <Text className="value">{user?.details?.education}</Text>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="detail-item">
                  <Text type="secondary">Date of Birth</Text>
                  <Text className="value">{user?.details?.dob ? dayjs(user.details.dob).format('DD MMM YYYY') : '-'}</Text>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className="detail-item">
                  <Text type="secondary">Address</Text>
                  <Text className="value">{user?.details?.address}</Text>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="detail-item">
                  <Text type="secondary">Budget Limit</Text>
                  <Text className="value">{user?.details?.budget}</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
