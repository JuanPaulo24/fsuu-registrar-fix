import { useEffect, useState } from "react";
import { Modal, Form, Row, Col, Button, message, Checkbox } from "antd";
import FloatInput from "../../../../providers/FloatInput";
import FloatTextArea from "../../../../providers/FloatTextArea";
import FloatSelect from "../../../../providers/FloatSelect";
import FloatDatePicker from "../../../../providers/FloatDatePicker";
import validateRules from "../../../../providers/validateRules";
import dayjs from "dayjs";

export default function ModalCalendarForm({ visible, onClose, onSubmit, editingData }) {
    const [form] = Form.useForm();
    const [noEndDate, setNoEndDate] = useState(false);

    useEffect(() => {
        if (visible) {
            if (editingData) {
                // Convert database fields to form fields for editing
                const formData = {
                    event_title: editingData.event_title,
                    event_description: editingData.event_description,
                    type: editingData.type,
                    status: editingData.status,
                    startDate: editingData.start_date ? dayjs(editingData.start_date) : null,
                    endDate: editingData.end_date ? dayjs(editingData.end_date) : null,
                };
                form.setFieldsValue(formData);
                setNoEndDate(!editingData.end_date);
            } else {
                // Creation mode: set default values
                form.resetFields();
                form.setFieldsValue({
                    status: 'active' // Default to active
                });
                setNoEndDate(false);
            }
        }
    }, [visible, editingData, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            
            // Send data in the format the backend controller expects
            const formattedValues = {
                id: editingData?.id || null, // Include ID for updates
                event_title: values.event_title,
                event_description: values.event_description,
                type: values.type,
                status: values.status,
                start_date: values.startDate ? values.startDate.format('YYYY-MM-DD HH:mm:ss') : null,
                end_date: (!noEndDate && values.endDate) ? values.endDate.format('YYYY-MM-DD HH:mm:ss') : null
            };
            
            onSubmit(formattedValues);
            form.resetFields();
            form.setFieldsValue({
                status: 'active'
            });
            setNoEndDate(false);
        } catch (error) {
            console.error('Form validation failed:', error);
            message.error('Please fill in all required fields');
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setNoEndDate(false);
        onClose();
    };

    const typeOptions = [
        { value: 'Academic Events', label: 'Academic Events' },
        { value: 'Training and Development', label: 'Training and Development' },
        { value: 'Institutional & Program Events', label: 'Institutional & Program Events' },
        { value: 'Professional & Industry-Related', label: 'Professional & Industry-Related' },
        { value: 'Competitions', label: 'Competitions' },
        { value: 'Cultural Events', label: 'Cultural Events' },
        { value: 'Community Outreach Events', label: 'Community Outreach Events' }
    ];

    const statusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
    ];

    // Handle start date change to update end date validation
    const handleStartDateChange = (date) => {
        const endDate = form.getFieldValue('endDate');
        // If end date is already selected and it's before the new start date, clear it
        if (endDate && date && dayjs(endDate).isBefore(dayjs(date))) {
            form.setFieldValue('endDate', null);
            message.warning('End date has been cleared because it was before the new start date');
        }
    };

    return (
        <Modal
            title={editingData ? "Edit Event" : "Create New Event"}
            open={visible}
            onCancel={handleCancel}
            width={800}
            footer={[
                <Button key="cancel" onClick={handleCancel}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={handleSubmit}>
                    {editingData ? "Update Event" : "Create Event"}
                </Button>,
            ]}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                requiredMark={false}
            >
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Form.Item
                            name="event_title"
                            label="Event Title"
                            rules={[validateRules.required()]}
                        >
                            <FloatInput
                                label="Event Title"
                                placeholder="Enter event title"
                                required
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Form.Item
                            name="event_description"
                            label="Event Description"
                            rules={[validateRules.required()]}
                        >
                            <FloatTextArea
                                label="Event Description"
                                placeholder="Enter event description"
                                rows={4}
                                required
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="type"
                            label="Event Type"
                            rules={[validateRules.required()]}
                        >
                            <FloatSelect
                                label="Event Type"
                                placeholder="Select event type"
                                options={typeOptions}
                                required
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="status"
                            label="Status"
                            rules={[validateRules.required()]}
                        >
                            <FloatSelect
                                label="Event Status"
                                placeholder="Select status"
                                options={statusOptions}
                                required
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="startDate"
                            label="Start Date"
                            rules={[validateRules.required()]}
                        >
                            <FloatDatePicker
                                label="Start Date"
                                placeholder="Select start date"
                                format="YYYY-MM-DD HH:mm"
                                showTime={{ format: 'HH:mm' }}
                                disabledDate={(current) => {
                                    // Disable dates before today for new events
                                    return current && current < dayjs().startOf('day');
                                }}
                                onChange={handleStartDateChange}
                                required
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="endDate"
                            label="End Date"
                            rules={noEndDate ? [] : [validateRules.required()]}
                        >
                            <FloatDatePicker
                                label="End Date"
                                placeholder="Select end date"
                                format="YYYY-MM-DD HH:mm"
                                showTime={{ format: 'HH:mm' }}
                                disabled={noEndDate}
                                disabledDate={(current) => {
                                    // Get the selected start date
                                    const startDate = form.getFieldValue('startDate');
                                    if (!startDate) {
                                        // If no start date selected, disable past dates
                                        return current && current < dayjs().startOf('day');
                                    }
                                    // Disable dates before start date
                                    return current && current < dayjs(startDate).startOf('day');
                                }}
                                required={!noEndDate}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Checkbox
                            checked={noEndDate}
                            onChange={(e) => {
                                setNoEndDate(e.target.checked);
                                if (e.target.checked) {
                                    form.setFieldValue('endDate', null);
                                }
                            }}
                        >
                            No End Date
                        </Checkbox>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}