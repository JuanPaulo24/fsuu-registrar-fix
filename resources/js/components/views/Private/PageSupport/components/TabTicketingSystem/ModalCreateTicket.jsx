import { useEffect, useState } from "react";
import { Modal, Form, Row, Col, Button, notification, Typography } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTimes } from "@fortawesome/pro-regular-svg-icons";
import FloatInput from "../../../../../providers/FloatInput";
import FloatSelect from "../../../../../providers/FloatSelect";
import FloatTextArea from "../../../../../providers/FloatTextArea";

const { Title } = Typography;

export default function ModalCreateTicket({ 
    toggleModal, 
    setToggleModal, 
    tickets, 
    setTickets 
}) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const categoryOptions = [
        { label: "Authentication", value: "Authentication" },
        { label: "Technical", value: "Technical" },
        { label: "Bug", value: "Bug" },
        { label: "Enhancement", value: "Enhancement" },
        { label: "Feature Request", value: "Feature Request" },
        { label: "Performance", value: "Performance" },
        { label: "Security", value: "Security" },
        { label: "Other", value: "Other" },
    ];

    const priorityOptions = [
        { label: "Low", value: "Low" },
        { label: "Medium", value: "Medium" },
        { label: "High", value: "High" },
        { label: "Critical", value: "Critical" },
    ];

    const statusOptions = [
        { label: "Open", value: "Open" },
        { label: "In Progress", value: "In Progress" },
        { label: "Resolved", value: "Resolved" },
        { label: "Closed", value: "Closed" },
    ];

    // Reset form when modal opens
    useEffect(() => {
        if (toggleModal.open) {
            if (toggleModal.data) {
                // Edit mode - populate form with existing data
                form.setFieldsValue({
                    title: toggleModal.data.title,
                    category: toggleModal.data.category,
                    priority: toggleModal.data.priority,
                    status: toggleModal.data.status,
                    description: toggleModal.data.description,
                });
            } else {
                // Create mode - reset form
                form.resetFields();
                form.setFieldsValue({
                    priority: "Medium",
                    status: "Open",
                });
            }
        }
    }, [toggleModal.open, toggleModal.data, form]);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            
            // Generate ticket number for new tickets
            const now = new Date();
            const year = now.getFullYear();
            const nextNumber = tickets.length + 1;
            const ticketNumber = `TKT-${year}-${String(nextNumber).padStart(3, '0')}`;
            
            if (toggleModal.data) {
                // Edit existing ticket
                const updatedTickets = tickets.map(ticket => 
                    ticket.id === toggleModal.data.id 
                        ? {
                            ...ticket,
                            ...values,
                            updated_at: now.toISOString(),
                        }
                        : ticket
                );
                setTickets(updatedTickets);
                
                notification.success({
                    message: "Success",
                    description: "Ticket updated successfully!",
                });
            } else {
                // Create new ticket
                const newTicket = {
                    id: tickets.length + 1,
                    ticket_number: ticketNumber,
                    ...values,
                    reported_by: "Current User", // In real app, get from auth context
                    assigned_to: "IT Support Team",
                    created_at: now.toISOString(),
                    updated_at: now.toISOString(),
                };
                
                setTickets([...tickets, newTicket]);
                
                notification.success({
                    message: "Success",
                    description: `Ticket ${ticketNumber} created successfully!`,
                });
            }
            
            setToggleModal({ open: false });
            form.resetFields();
            
        } catch (error) {
            console.error("Form validation failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setToggleModal({ open: false });
        form.resetFields();
    };

    return (
        <Modal
            title={
                <Title level={4} className="mb-0">
                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                    {toggleModal.data ? "Edit Ticket" : "Create New Ticket"}
                </Title>
            }
            open={toggleModal.open}
            onCancel={handleCancel}
            footer={null}
            width={800}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="mt-4"
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24}>
                        <FloatInput
                            label="Ticket Title"
                            placeholder="Enter a descriptive title for the issue"
                            name="title"
                            rules={[
                                { required: true, message: "Please enter ticket title" },
                                { min: 10, message: "Title must be at least 10 characters" },
                                { max: 100, message: "Title cannot exceed 100 characters" }
                            ]}
                        />
                    </Col>
                </Row>

                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <FloatSelect
                            label="Category"
                            placeholder="Select issue category"
                            name="category"
                            options={categoryOptions}
                            rules={[
                                { required: true, message: "Please select a category" }
                            ]}
                        />
                    </Col>
                    <Col xs={24} md={12}>
                        <FloatSelect
                            label="Priority"
                            placeholder="Select priority level"
                            name="priority"
                            options={priorityOptions}
                            rules={[
                                { required: true, message: "Please select priority" }
                            ]}
                        />
                    </Col>
                </Row>

                {toggleModal.data && (
                    <Row gutter={[16, 16]}>
                        <Col xs={24}>
                            <FloatSelect
                                label="Status"
                                placeholder="Select ticket status"
                                name="status"
                                options={statusOptions}
                                rules={[
                                    { required: true, message: "Please select status" }
                                ]}
                            />
                        </Col>
                    </Row>
                )}

                <Row gutter={[16, 16]}>
                    <Col xs={24}>
                        <FloatTextArea
                            label="Description"
                            placeholder="Provide detailed description of the issue, including steps to reproduce if applicable"
                            name="description"
                            rows={6}
                            rules={[
                                { required: true, message: "Please provide description" },
                                { min: 20, message: "Description must be at least 20 characters" },
                                { max: 1000, message: "Description cannot exceed 1000 characters" }
                            ]}
                        />
                    </Col>
                </Row>

                <Row gutter={[16, 16]} className="mt-6">
                    <Col xs={24}>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="default"
                                onClick={handleCancel}
                                icon={<FontAwesomeIcon icon={faTimes} />}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                icon={<FontAwesomeIcon icon={faSave} />}
                            >
                                {toggleModal.data ? "Update Ticket" : "Create Ticket"}
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}
