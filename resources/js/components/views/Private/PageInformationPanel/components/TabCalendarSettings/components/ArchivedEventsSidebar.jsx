import { Card, List, Button, Badge, Typography, Row, Col } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateLeft, faTrash } from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";
import { hasButtonPermission } from "@/hooks/useButtonPermissions";

const { Text } = Typography;

export default function ArchivedEventsSidebar({ 
    events, 
    onRestoreEvent, 
    onDeleteEvent, 
    getEventColor 
}) {
    // Check button permission for restore
    const canRestore = hasButtonPermission('M-07-EVENTS-RESTORE');
    // All events are archived, so we just need to display them
    const archivedEvents = events
        .sort((a, b) => dayjs(b.deleted_at || b.updated_at).diff(dayjs(a.deleted_at || a.updated_at)))
        .slice(0, 20); // Show up to 20 archived events

    return (
        <Row gutter={[20, 20]}>
            <Col span={24}>
                <Card 
                    title={
                        <span style={{ color: '#ffffff', fontWeight: 'bold' }}>
                            Archived Events
                        </span>
                    }
                    size="small"
                    styles={{ 
                        header: {
                            backgroundColor: '#6b7280', // Gray header for archived
                            color: '#ffffff',
                            borderBottom: '1px solid #9ca3af'
                        }
                    }}
                >
                    {archivedEvents.length > 0 ? (
                        <List
                            size="small"
                            dataSource={archivedEvents}
                            renderItem={(item) => (
                                <List.Item
                                    className="archived-events-item pl-4 mb-2 rounded opacity-75"
                                    actions={canRestore ? [
                                        <Button 
                                            type="text" 
                                            size="small"
                                            icon={<FontAwesomeIcon icon={faRotateLeft} />}
                                            onClick={() => onRestoreEvent(item.id)}
                                            style={{ color: '#10b981' }}
                                            title="Restore Event"
                                        />,
                                        <Button 
                                            type="text" 
                                            size="small"
                                            icon={<FontAwesomeIcon icon={faTrash} />}
                                            onClick={() => onDeleteEvent(item.id)}
                                            style={{ color: '#ff4d4f' }}
                                            title="Permanently Delete"
                                        />
                                    ] : []}
                                >
                                    <List.Item.Meta
                                        title={
                                            <div className="flex items-center gap-4">
                                                <Badge 
                                                    color={getEventColor(item.event_type || item.type, 'inactive')} 
                                                />
                                                <Text strong className="text-xs text-gray-500">
                                                    {item.event_title || item.title}
                                                </Text>
                                            </div>
                                        }
                                        description={
                                            <div className="ml-8">
                                                <Text className="text-xs text-gray-400">
                                                    {item.event_description || item.description}
                                                </Text>
                                                <br />
                                                <Text type="secondary" className="text-xs">
                                                    Archived: {dayjs(item.deleted_at || item.updated_at).format('MMM DD, YYYY')}
                                                </Text>
                                                {(item.start_date) && (
                                                    <>
                                                        <br />
                                                        <Text type="secondary" className="text-xs">
                                                            Event Date: {dayjs(item.start_date).format('MMM DD, YYYY')}
                                                            {item.end_date && !dayjs(item.start_date).isSame(dayjs(item.end_date), 'day') 
                                                                ? ` - ${dayjs(item.end_date).format('MMM DD, YYYY')}` 
                                                                : ''
                                                            }
                                                        </Text>
                                                    </>
                                                )}
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    ) : (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            No archived events
                        </Text>
                    )}
                </Card>
            </Col>
        </Row>
    );
}