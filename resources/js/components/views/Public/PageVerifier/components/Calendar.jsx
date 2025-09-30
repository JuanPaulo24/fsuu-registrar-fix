import { Card, Row, Col, Typography, Timeline, Badge } from 'antd';

const { Title, Paragraph, Text } = Typography;

export default function Calendar({ calendarEvents }) {
    // Default calendar events if none provided
    const defaultCalendarEvents = [
        { date: '2025-08-15', event: 'Enrollment Period Begins', type: 'academic' },
        { date: '2025-08-30', event: 'Faculty Development Training', type: 'training' },
        { date: '2025-09-15', event: 'Summer Graduation Ceremony', type: 'graduation' },
        { date: '2025-09-20', event: 'Research Symposium', type: 'research' }
    ];

    const displayEvents = calendarEvents || defaultCalendarEvents;

    const reminders = [
        {
            title: 'Enrollment Deadline',
            date: 'August 30, 2025',
            color: '#3b82f6'
        },
        {
            title: 'Graduation Application',
            date: 'July 15, 2025',
            color: '#10b981'
        },
        {
            title: 'Thesis Defense',
            date: 'September 1-30, 2025',
            color: '#f59e0b'
        }
    ];

    return (
        <div style={{ padding: '0 0 24px 0' }}>
            <Card style={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <Title level={2} style={{ color: '#1e40af', marginBottom: '16px' }}>
                    Academic Calendar
                </Title>
                <Paragraph style={{ fontSize: '18px', marginBottom: '32px', color: '#374151', lineHeight: '1.6' }}>
                    Stay updated with important dates and events throughout the academic year.
                </Paragraph>
                
                <Row gutter={[32, 32]}>
                    <Col xs={24} lg={16}>
                        <Card 
                            title="Academic Events Timeline"
                            style={{
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb'
                            }}
                        >
                            <Timeline
                                items={displayEvents.map(event => ({
                                    color: event.type === 'graduation' ? '#10b981' : 
                                           event.type === 'academic' ? '#3b82f6' : 
                                           event.type === 'training' ? '#f59e0b' : '#8b5cf6',
                                    children: (
                                        <div style={{ padding: '8px 0' }}>
                                            <Text strong style={{ color: '#1e40af', fontSize: '16px' }}>
                                                {event.date}
                                            </Text>
                                            <br />
                                            <Text style={{ color: '#374151', fontSize: '14px', marginTop: '4px' }}>
                                                {event.event}
                                            </Text>
                                            <br />
                                            <Badge 
                                                status={event.type === 'graduation' ? 'success' : 
                                                       event.type === 'academic' ? 'processing' : 
                                                       event.type === 'training' ? 'warning' : 'default'} 
                                                text={event.type.charAt(0).toUpperCase() + event.type.slice(1)} 
                                                style={{ marginTop: '8px', fontSize: '12px' }}
                                            />
                                        </div>
                                    )
                                }))}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} lg={8}>
                        <Card 
                            title="Important Reminders"
                            style={{ 
                                backgroundColor: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                borderRadius: '8px'
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {reminders.map((reminder, index) => (
                                    <div 
                                        key={index}
                                        style={{ 
                                            padding: '16px',
                                            backgroundColor: 'white',
                                            borderRadius: '8px',
                                            borderLeft: `4px solid ${reminder.color}`,
                                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                                        }}
                                    >
                                        <Text strong style={{ color: '#1e40af', fontSize: '14px' }}>
                                            {reminder.title}
                                        </Text>
                                        <br />
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            {reminder.date}
                                        </Text>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Card>
        </div>
    );
}
