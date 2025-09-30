import { Modal, Descriptions, Tag, Typography, Row, Col, Card, Timeline, Button } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faTimes, faEdit } from "@fortawesome/pro-regular-svg-icons";
import { faUser, faCalendar, faClock } from "@fortawesome/pro-solid-svg-icons";

const { Title, Text, Paragraph } = Typography;

export default function ModalViewTicket({ toggleModal, setToggleModal }) {
    const ticket = toggleModal.data;

    if (!ticket) return null;

    const getPriorityColor = (priority) => {
        switch (priority.toLowerCase()) {
            case "critical": return "red";
            case "high": return "orange";
            case "medium": return "blue";
            case "low": return "green";
            default: return "default";
        }
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "open": return "processing";
            case "in progress": return "warning";
            case "resolved": return "success";
            case "closed": return "default";
            default: return "default";
        }
    };

    // Sample timeline data (in real app, this would come from API)
    const timelineItems = [
        {
            color: 'blue',
            children: (
                <div>
                    <Text strong>Ticket Created</Text>
                    <br />
                    <Text type="secondary">
                        <FontAwesomeIcon icon={faUser} className="mr-1" />
                        {ticket.reported_by}
                    </Text>
                    <br />
                    <Text type="secondary">
                        <FontAwesomeIcon icon={faCalendar} className="mr-1" />
                        {new Date(ticket.created_at).toLocaleString()}
                    </Text>
                </div>
            ),
        },
        {
            color: ticket.status === 'Open' ? 'blue' : 'green',
            children: (
                <div>
                    <Text strong>Status: {ticket.status}</Text>
                    <br />
                    <Text type="secondary">
                        <FontAwesomeIcon icon={faUser} className="mr-1" />
                        Assigned to {ticket.assigned_to}
                    </Text>
                    <br />
                    <Text type="secondary">
                        <FontAwesomeIcon icon={faCalendar} className="mr-1" />
                        {new Date(ticket.updated_at).toLocaleString()}
                    </Text>
                </div>
            ),
        },
    ];

    if (ticket.status === 'Resolved') {
        timelineItems.push({
            color: 'green',
            children: (
                <div>
                    <Text strong>Ticket Resolved</Text>
                    <br />
                    <Text type="secondary">
                        <FontAwesomeIcon icon={faUser} className="mr-1" />
                        {ticket.assigned_to}
                    </Text>
                    <br />
                    <Text type="secondary">
                        <FontAwesomeIcon icon={faCalendar} className="mr-1" />
                        {new Date(ticket.updated_at).toLocaleString()}
                    </Text>
                </div>
            ),
        });
    }

    const handleClose = () => {
        setToggleModal({ open: false, data: null });
    };

    return (
        <Modal
            title={
                <Title level={4} className="mb-0">
                    <FontAwesomeIcon icon={faEye} className="mr-2" />
                    Ticket Details
                </Title>
            }
            open={toggleModal.open}
            onCancel={handleClose}
            width={900}
            footer={[
                <Button key="close" onClick={handleClose} icon={<FontAwesomeIcon icon={faTimes} />}>
                    Close
                </Button>,
                <Button 
                    key="edit" 
                    type="primary" 
                    icon={<FontAwesomeIcon icon={faEdit} />}
                    onClick={() => {
                        // This would trigger edit mode - for now just close
                        handleClose();
                    }}
                >
                    Edit Ticket
                </Button>
            ]}
        >
            <div className="mt-4">
                <Row gutter={[16, 16]}>
                    {/* Ticket Information Card */}
                    <Col xs={24} lg={14}>
                        <Card title="Ticket Information" size="small">
                            <Descriptions column={{ xs: 1, sm: 1, md: 2 }} size="small">
                                <Descriptions.Item label="Ticket Number">
                                    <Text strong className="text-blue-600">
                                        {ticket.ticket_number}
                                    </Text>
                                </Descriptions.Item>
                                
                                <Descriptions.Item label="Status">
                                    <Tag color={getStatusColor(ticket.status)} className="text-xs">
                                        {ticket.status}
                                    </Tag>
                                </Descriptions.Item>
                                
                                <Descriptions.Item label="Category">
                                    <Tag color="blue" className="text-xs">
                                        {ticket.category}
                                    </Tag>
                                </Descriptions.Item>
                                
                                <Descriptions.Item label="Priority">
                                    <Tag color={getPriorityColor(ticket.priority)} className="text-xs">
                                        {ticket.priority}
                                    </Tag>
                                </Descriptions.Item>
                                
                                <Descriptions.Item label="Reported By">
                                    <Text>
                                        <FontAwesomeIcon icon={faUser} className="mr-1 text-gray-500" />
                                        {ticket.reported_by}
                                    </Text>
                                </Descriptions.Item>
                                
                                <Descriptions.Item label="Assigned To">
                                    <Text>
                                        <FontAwesomeIcon icon={faUser} className="mr-1 text-gray-500" />
                                        {ticket.assigned_to}
                                    </Text>
                                </Descriptions.Item>
                                
                                <Descriptions.Item label="Created">
                                    <Text>
                                        <FontAwesomeIcon icon={faCalendar} className="mr-1 text-gray-500" />
                                        {new Date(ticket.created_at).toLocaleString()}
                                    </Text>
                                </Descriptions.Item>
                                
                                <Descriptions.Item label="Last Updated">
                                    <Text>
                                        <FontAwesomeIcon icon={faClock} className="mr-1 text-gray-500" />
                                        {new Date(ticket.updated_at).toLocaleString()}
                                    </Text>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                        
                        {/* Description Card */}
                        <Card title="Description" size="small" className="mt-4">
                            <Title level={5} className="mb-2">
                                {ticket.title}
                            </Title>
                            <Paragraph className="text-gray-700 mb-0">
                                {ticket.description}
                            </Paragraph>
                        </Card>
                    </Col>
                    
                    {/* Timeline Card */}
                    <Col xs={24} lg={10}>
                        <Card title="Activity Timeline" size="small">
                            <Timeline
                                mode="left"
                                items={timelineItems}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
        </Modal>
    );
}
