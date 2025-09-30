import { Card, Row, Col, Typography } from 'antd';

const { Title, Paragraph, Text } = Typography;

export default function About() {
    return (
        <div style={{ padding: '0 0 24px 0' }}>
            <Card style={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <Title level={2} style={{ color: '#1e40af', marginBottom: '24px' }}>
                    About Father Saturnino Urios University
                </Title>
                <Row gutter={[32, 32]}>
                    <Col xs={24} lg={16}>
                        <Paragraph style={{ fontSize: '18px', color: '#374151', lineHeight: '1.7', marginBottom: '20px' }}>
                            Father Saturnino Urios University (FSUU) is a distinguished institution of higher learning 
                            located in Butuan City, Philippines. Founded with the mission to provide quality education 
                            rooted in Christian values, FSUU has been serving the community for decades.
                        </Paragraph>
                        <Paragraph style={{ color: '#374151', lineHeight: '1.6', marginBottom: '24px' }}>
                            Our university is committed to academic excellence, character formation, and community service. 
                            We offer a wide range of undergraduate and graduate programs designed to prepare students 
                            for successful careers and meaningful lives.
                        </Paragraph>
                        <Title level={4} style={{ color: '#1e40af', marginTop: '24px', marginBottom: '12px' }}>
                            Our Mission
                        </Title>
                        <Paragraph style={{ color: '#374151', lineHeight: '1.6', marginBottom: '24px' }}>
                            To provide quality, accessible, and relevant education that promotes integral human development 
                            and contributes to the transformation of society through teaching, research, and community service.
                        </Paragraph>
                        <Title level={4} style={{ color: '#1e40af', marginTop: '24px', marginBottom: '12px' }}>
                            Our Vision
                        </Title>
                        <Paragraph style={{ color: '#374151', lineHeight: '1.6' }}>
                            A premier Catholic university in Mindanao, recognized for academic excellence, 
                            innovative research, and transformative community engagement.
                        </Paragraph>
                    </Col>
                    <Col xs={24} lg={8}>
                        <Card style={{ 
                            backgroundColor: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: '12px'
                        }}>
                            <Title level={4} style={{ color: '#1e40af', marginBottom: '16px' }}>
                                Quick Facts
                            </Title>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text strong style={{ color: '#374151' }}>Founded:</Text>
                                    <Text style={{ color: '#6b7280' }}>1947</Text>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text strong style={{ color: '#374151' }}>Location:</Text>
                                    <Text style={{ color: '#6b7280' }}>Butuan City</Text>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text strong style={{ color: '#374151' }}>Type:</Text>
                                    <Text style={{ color: '#6b7280' }}>Private Catholic</Text>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text strong style={{ color: '#374151' }}>Students:</Text>
                                    <Text style={{ color: '#6b7280' }}>10,000+</Text>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text strong style={{ color: '#374151' }}>Programs:</Text>
                                    <Text style={{ color: '#6b7280' }}>50+</Text>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Card>
        </div>
    );
}
