import { Card, List, Button, Badge, Typography, Row, Col } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash } from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";
import { hasMultipleButtonPermissions } from "@/hooks/useButtonPermissions";

const { Text } = Typography;

export default function EventsSidebar({ 
    events, 
    onEditEvent, 
    onDeleteEvent, 
    getEventColor 
}) {
    // Check button permissions
    const buttonPermissions = hasMultipleButtonPermissions([
        'M-07-EVENTS-ADD',
        'M-07-EVENTS-EDIT',
        'M-07-EVENTS-ARCHIVE'
    ]);
    
    const getEventsByDate = (date) => {
        return events.filter(event => {
            const eventStart = dayjs(event.start_date);
            const eventEnd = event.end_date ? dayjs(event.end_date) : eventStart;
            
            // Check if the date falls within the event's date range
            return date.isSame(eventStart, 'day') || 
                   date.isSame(eventEnd, 'day') || 
                   (date.isAfter(eventStart, 'day') && date.isBefore(eventEnd, 'day'));
        });
    };

    const todayEvents = getEventsByDate(dayjs());
    const upcomingEvents = events
        .filter(event => dayjs(event.start_date).isAfter(dayjs(), 'day'))
        .sort((a, b) => dayjs(a.start_date).diff(dayjs(b.start_date)))
        .slice(0, 5);

    return (
        <Row gutter={[20, 20]}>
            <Col span={24}>
                <Card 
                    title={
                        <span style={{ color: '#ffffff', fontWeight: 'bold' }}>
                            Today's Events
                        </span>
                    }
                    size="small"
                    style={{ marginBottom: 16 }}
                    styles={{ 
                        header: {
                            backgroundColor: '#1890ff', 
                            color: '#ffffff',
                            borderBottom: '1px solid #40a9ff'
                        }
                    }}
                >
                    {todayEvents.length > 0 ? (
                        <List
                            size="small"
                            dataSource={todayEvents}
                            renderItem={(item) => (
                                <List.Item
                                    className="todays-events-item pl-4 mb-2  rounded"
                                    actions={[
                                        buttonPermissions['M-07-EVENTS-EDIT'] && (
                                            <Button 
                                                type="text" 
                                                size="small"
                                                icon={<FontAwesomeIcon icon={faPencil} />}
                                                onClick={() => onEditEvent(item)}
                                                style={{ color: '#1890ff' }}
                                            />
                                        ),
                                        buttonPermissions['M-07-EVENTS-ARCHIVE'] && (
                                            <Button 
                                                type="text" 
                                                size="small"
                                                icon={<FontAwesomeIcon icon={faTrash} />}
                                                onClick={() => onDeleteEvent(item.id)}
                                                style={{ color: '#ff4d4f' }}
                                            />
                                        )
                                    ].filter(Boolean)}
                                >
                                    <List.Item.Meta
                                        title={
                                            <div className="flex items-center gap-4">
                                                <Badge 
                                                    color={getEventColor(item.event_type || item.type, item.status)} 
                                                />
                                                <Text strong className="text-xs">
                                                    {item.event_title || item.title}
                                                </Text>
                                            </div>
                                        }
                                        description={
                                            <Text className="text-xs ml-8">
                                                {item.event_description || item.description}
                                            </Text>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    ) : (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            No events scheduled for today
                        </Text>
                    )}
                </Card>
            </Col>

            <Col span={24}>
                <Card 
                    title={
                        <span style={{ color: '#ffffff', fontWeight: 'bold' }}>
                            Upcoming Events
                        </span>
                    }
                    size="small"
                    styles={{ 
                        header: {
                            backgroundColor: '#1890ff', 
                            color: '#ffffff',
                            borderBottom: '1px solid #40a9ff'
                        }
                    }}
                >
                    {upcomingEvents.length > 0 ? (
                        <List
                            size="small"
                            dataSource={upcomingEvents}
                            renderItem={(item) => (
                                <List.Item
                                    className="upcoming-events-item"
                                    actions={[
                                        buttonPermissions['M-07-EVENTS-EDIT'] && (
                                            <Button 
                                                type="text" 
                                                size="small"
                                                icon={<FontAwesomeIcon icon={faPencil} />}
                                                onClick={() => onEditEvent(item)}
                                                style={{ color: '#1890ff' }}
                                            />
                                        ),
                                        buttonPermissions['M-07-EVENTS-ARCHIVE'] && (
                                            <Button 
                                                type="text" 
                                                size="small"
                                                icon={<FontAwesomeIcon icon={faTrash} />}
                                                onClick={() => onDeleteEvent(item.id)}
                                                style={{ color: '#ff4d4f' }}
                                            />
                                        )
                                    ].filter(Boolean)}
                                >
                                    <List.Item.Meta
                                        title={
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Badge 
                                                        color={getEventColor(item.event_type || item.type, item.status)} 
                                                    />
                                                    <Text strong className="text-xs">
                                                        {item.event_title || item.title}
                                                    </Text>
                                                </div>
                                                <Text type="secondary" className="text-xs">
                                                    {dayjs(item.start_date).format('MMM DD')}
                                                </Text>
                                            </div>
                                        }
                                        description={
                                            <Text className="text-xs pl-10">
                                                {item.event_description || item.description}
                                            </Text>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    ) : (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            No upcoming events
                        </Text>
                    )}
                </Card>
            </Col>
        </Row>
    );
}