import { Card, Typography, Badge, Button, Spin, Empty } from 'antd';
import { GET_PUBLIC } from '../../../../providers/useAxiosQuery';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;

export default function Announcements() {
    // Fetch public postings from API (only announcements and news, not notifications)
    const { data: postingsResponse, isLoading, error } = GET_PUBLIC(
        'api/public/postings?type=announcement,news',
        'public_announcements',
        null,
        false // Disable global loading for public page
    );

    // Process and format the data
    const processedAnnouncements = () => {
        if (!postingsResponse?.data) return [];
        
        // Extract data array (handle both paginated and non-paginated responses)
        const announcements = Array.isArray(postingsResponse.data) 
            ? postingsResponse.data 
            : postingsResponse.data.data || [];

        // Format and sort announcements by priority
        return announcements.map(announcement => ({
            id: announcement.id,
            title: announcement.title,
            start_date: announcement.start_date ? dayjs(announcement.start_date).format('MMMM DD, YYYY') : null,
            content: announcement.content,
            type: announcement.type,
            priority_level: announcement.priority_level,
            // For priority ordering: high = 1, medium = 2, low = 3
            priorityOrder: announcement.priority_level === 'high' ? 1 : 
                          announcement.priority_level === 'medium' ? 2 : 3
        })).sort((a, b) => a.priorityOrder - b.priorityOrder);
    };

    const displayAnnouncements = processedAnnouncements();

    const getBadgeStatus = (priorityLevel) => {
        switch (priorityLevel) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'processing';
            default: return 'default';
        }
    };

    const getBadgeColor = (priorityLevel) => {
        switch (priorityLevel) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#3b82f6';
            default: return '#6b7280';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'announcement': return '#10b981';
            case 'notification': return '#3b82f6';
            case 'news': return '#8b5cf6';
            default: return '#6b7280';
        }
    };

    // Handle loading state
    if (isLoading) {
        return (
            <div style={{ padding: '0 0 24px 0' }}>
                <Card style={{
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center',
                    padding: '48px 24px'
                }}>
                    <Spin size="large" />
                    <div style={{ marginTop: '16px', color: '#6b7280' }}>
                        Loading announcements...
                    </div>
                </Card>
            </div>
        );
    }

    // Handle error state
    if (error) {
        return (
            <div style={{ padding: '0 0 24px 0' }}>
                <Card style={{
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                    <Empty 
                        description="Failed to load announcements"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                </Card>
            </div>
        );
    }

    return (
        <div style={{ padding: '0 0 24px 0' }}>
            <Card style={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <Title level={2} style={{ color: '#1e40af', marginBottom: '16px' }}>
                    University Announcements
                </Title>
                <Paragraph style={{ fontSize: '18px', marginBottom: '32px', color: '#374151', lineHeight: '1.6' }}>
                    Stay informed with the latest news and updates from FSUU.
                </Paragraph>
                
                {displayAnnouncements.length === 0 ? (
                    <Empty 
                        description="No announcements available at the moment"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {displayAnnouncements.map(announcement => (
                            <div 
                                key={announcement.id}
                                style={{ 
                                    borderLeft: `6px solid ${getBadgeColor(announcement.priority_level)}`,
                                    borderRadius: '12px',
                                    border: '1px solid #e5e7eb',
                                    borderLeftWidth: '6px',
                                    borderLeftColor: getBadgeColor(announcement.priority_level),
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    transition: 'all 0.3s ease',
                                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                    cursor: 'pointer',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 25px -5px rgba(0, 0, 0, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                }}
                            >
                                <div style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                                    <Title level={4} style={{ margin: '0', color: '#1e40af', fontSize: '18px' }}>
                                        {announcement.title}
                                    </Title>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        <Badge 
                                            color={getTypeColor(announcement.type)}
                                            text={announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)} 
                                            style={{ fontSize: '12px' }}
                                        />
                                    </div>
                                </div>
                                {announcement.start_date && (
                                    <div style={{ 
                                        padding: '6px 12px', 
                                        display: 'inline-block',
                                    }}>
                                        <Text type="secondary" style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>
                                            {announcement.start_date}
                                        </Text>
                                    </div>
                                )}
                                <Paragraph style={{ 
                                    color: '#374151', 
                                    fontSize: '15px',
                                    padding: '16px',
                                    borderRadius: '8px',
                                }}>
                                    {announcement.content}
                                </Paragraph>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
