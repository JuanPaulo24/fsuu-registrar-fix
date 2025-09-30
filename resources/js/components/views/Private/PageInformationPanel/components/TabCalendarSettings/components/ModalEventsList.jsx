import { Modal, List, Button, Badge, Typography } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck, faPencil, faTrash } from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";

const { Text } = Typography;

export default function ModalEventsList({
    open,
    onCancel,
    selectedDateLabel,
    selectedDateEvents,
    onEditEvent,
    onDeleteEvent,
    getEventColor
}) {
    const handleEditEvent = (event) => {
        onCancel();
        onEditEvent(event);
    };

    const handleDeleteEvent = (eventId) => {
        onCancel();
        onDeleteEvent(eventId);
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faCalendarCheck} className="text-blue-500" />
                    <span>{selectedDateLabel}</span>
                </div>
            }
            open={open}
            onCancel={onCancel}
            footer={[
                <Button key="close" onClick={onCancel}>
                    Close
                </Button>
            ]}
            width={600}
        >
            <div className="mb-4">
                <Text type="secondary" className="text-sm">
                    List of events:
                </Text>
            </div>
            
            <List
                dataSource={selectedDateEvents}
                renderItem={(event, index) => (
                    <List.Item
                        className="modal-events-item border-l-4 pl-4 mb-2"
                        key={event.id}
                        actions={[
                            <Button
                                key="edit"
                                type="link"
                                size="small"
                                icon={<FontAwesomeIcon icon={faPencil} />}
                                onClick={() => handleEditEvent(event)}
                            >
                                Edit
                            </Button>,
                            <Button
                                key="delete"
                                type="link"
                                size="small"
                                danger
                                icon={<FontAwesomeIcon icon={faTrash} />}
                                onClick={() => handleDeleteEvent(event.id)}
                            >
                                Archive
                            </Button>
                        ]}
                        style={{
                            borderLeftColor: getEventColor(event.event_type || event.type, event.status)
                        }}
                    >
                        <List.Item.Meta
                            title={
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Badge 
                                            color={getEventColor(event.event_type || event.type, event.status)} 
                                        />
                                        <Text strong className="text-sm">
                                            {event.event_title || event.title}
                                        </Text>
                                    </div>
                                    <div className="flex flex-col items-end text-xs text-gray-500">
                                        <span>{event.event_type || event.type}</span>
                                        <span>
                                            {dayjs(event.start_date).format('MMM DD')}
                                            {event.end_date && !dayjs(event.start_date).isSame(dayjs(event.end_date), 'day') 
                                                ? ` - ${dayjs(event.end_date).format('MMM DD')}` 
                                                : ''
                                            }
                                        </span>
                                    </div>
                                </div>
                            }
                        />
                    </List.Item>
                )}
            />
        </Modal>
    );
}