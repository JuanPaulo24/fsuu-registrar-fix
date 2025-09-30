import { Card, Row, Col, Typography } from "antd";

const { Text } = Typography;

export default function CalendarLegend({ getEventColor, isArchived = false }) {
    const eventTypes = [
        { type: 'Academic Events', label: 'Academic Events' },
        { type: 'Training and Development', label: 'Training & Development' },
        { type: 'Institutional & Program Events', label: 'Institutional & Program' },
        { type: 'Professional & Industry-Related', label: 'Professional & Industry' },
        { type: 'Competitions', label: 'Competitions' },
        { type: 'Cultural Events', label: 'Cultural Events' },
        { type: 'Community Outreach Events', label: 'Community Outreach' }
    ];

    return (
        <Card 
            size="small" 
            style={{ marginTop: 16 }}
            title={
                <Text strong style={{ fontSize: '14px' }}>
                    Event Type Legend
                </Text>
            }
            styles={{
                header: {
                    backgroundColor: '#1890ff',
                    color: '#ffffff'
                }
            }}
        >
            <Row gutter={[16, 8]}>
                {eventTypes.map((item, index) => (
                    <Col xs={24} sm={12} md={8} lg={6} xl={6} key={index}>
                        <div className="flex items-center gap-2">
                            <div 
                                style={{
                                    width: '16px',
                                    height: '12px',
                                    backgroundColor: getEventColor(item.type, isArchived ? 'inactive' : 'active'),
                                    borderRadius: '3px',
                                    border: '1px solid #e0e0e0'
                                }}
                            />
                            <Text 
                                style={{ 
                                    fontSize: '12px',
                                    color: isArchived ? '#9ca3af' : '#333'
                                }}
                            >
                                {item.label}
                            </Text>
                        </div>
                    </Col>
                ))}
                
                {/* Add status indicators */}
                <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                    <div className="flex items-center gap-2">
                        <div 
                            style={{
                                width: '16px',
                                height: '12px',
                                backgroundColor: '#9ca3af',
                                borderRadius: '3px',
                                border: '1px solid #e0e0e0'
                            }}
                        />
                        <Text style={{ fontSize: '12px', color: '#9ca3af' }}>
                            Inactive
                        </Text>
                    </div>
                </Col>
            </Row>
        </Card>
    );
}