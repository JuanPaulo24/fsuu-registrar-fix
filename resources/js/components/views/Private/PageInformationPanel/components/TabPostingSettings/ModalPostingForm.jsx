import { useEffect, useState } from "react";
import { Modal, Form, Row, Col, Button, message, Checkbox } from "antd";
import FloatInput from "../../../../../providers/FloatInput";
import FloatTextArea from "../../../../../providers/FloatTextArea";
import FloatSelect from "../../../../../providers/FloatSelect";
import FloatDatePicker from "../../../../../providers/FloatDatePicker";
import validateRules from "../../../../../providers/validateRules";
import { GET } from "../../../../../providers/useAxiosQuery";
import dayjs from "dayjs";

export default function ModalPostingForm({ visible, onClose, onSubmit, editingData }) {
    const [form] = Form.useForm();
    const [noEndDate, setNoEndDate] = useState(false);
    const [isPublic, setIsPublic] = useState(true); // Default to public
    const [selectedType, setSelectedType] = useState(null); // Track selected type

    // Fetch user roles (excluding role id 1)
    const { data: userRoles } = GET("api/user_role", "user_roles_for_posting");

    useEffect(() => {
        if (visible) {
            if (editingData) {
                // Convert database fields to form fields for editing
                const isEditingPublic = !editingData.target_audience_id || editingData.target_audience_id === '';
                const formData = {
                    title: editingData.title,
                    content: editingData.content,
                    type: editingData.type,
                    priority: editingData.priority_level, // Map backend field to form field
                    status: editingData.status,
                    targetAudience: isEditingPublic ? 'public' : editingData.target_audience_id, // Map backend field to form field
                    startDate: editingData.start_date ? dayjs(editingData.start_date) : null,
                    endDate: editingData.end_date ? dayjs(editingData.end_date) : null,
                };
                form.setFieldsValue(formData);
                setNoEndDate(!editingData.end_date);
                setIsPublic(isEditingPublic);
                setSelectedType(editingData.type);
            } else {
                // Creation mode: set default values including Public as default target audience
                form.resetFields();
                form.setFieldsValue({
                    targetAudience: 'public', // Default to public
                    status: 'active' // Default to active
                });
                setNoEndDate(false);
                setIsPublic(true); // Default to public
                setSelectedType(null);
            }
        }
    }, [visible, editingData, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            
            // Send data in the format the backend controller expects
            const formattedValues = {
                id: editingData?.id || null, // Include ID for updates
                title: values.title,
                content: values.content,
                type: values.type,
                priority_level: values.type === 'notification' ? 'medium' : values.priority, // For notifications, set default priority
                status: values.status,
                targetAudience: (values.targetAudience === 'public') ? null : values.targetAudience, // If Public selected, set to null, otherwise use selected audience
                startDate: values.type === 'notification' ? dayjs().format('YYYY-MM-DD') : (values.startDate ? values.startDate.format('YYYY-MM-DD') : null), // For notifications, use current date
                endDate: values.type === 'notification' ? null : ((!noEndDate && values.endDate) ? values.endDate.format('YYYY-MM-DD') : null) // For notifications, no end date
            };
            
            onSubmit(formattedValues);
            form.resetFields();
            // Reset to defaults for next use
            form.setFieldsValue({
                targetAudience: 'public',
                status: 'active'
            });
            setNoEndDate(false);
            setIsPublic(true);
            setSelectedType(null);
        } catch (error) {
            console.error('Form validation failed:', error);
            message.error('Please fill in all required fields');
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setNoEndDate(false);
        setIsPublic(true); // Reset to default public
        setSelectedType(null); // Reset selected type
        onClose();
    };

    const typeOptions = [
        { value: 'notification', label: 'Notification' },
        { value: 'announcement', label: 'Announcement' },
        { value: 'news', label: 'News' }
    ];

    const priorityOptions = [
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' }
    ];

    const statusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
    ];

    // Generate audience options from user roles (excluding role id 1) and add Public option
    const roleBasedOptions = userRoles?.data?.filter(role => role.id !== 1)?.map(role => ({
        value: role.id,
        label: role.user_role
    })) || [];
    
    const audienceOptions = selectedType === 'notification' 
        ? roleBasedOptions // For notifications, exclude Public option
        : [{ value: 'public', label: 'Public (All Users)' }, ...roleBasedOptions]; // For others, include Public

    // Handle target audience change to toggle public mode
    const handleTargetAudienceChange = (value) => {
        setIsPublic(value === 'public');
    };

    // Handle type change to set special notification logic
    const handleTypeChange = (type) => {
        setSelectedType(type);
        
        if (type === 'notification') {
            // For notifications, clear public audience and set defaults
            form.setFieldsValue({
                targetAudience: undefined, // Clear target audience
                startDate: dayjs(), // Set to current date
                endDate: null // Clear end date
            });
            setNoEndDate(true); // Notifications have no end date
            setIsPublic(false);
        } else {
            // For other types, set defaults
            form.setFieldsValue({
                targetAudience: 'public' // Default to public for announcements/news
            });
            setNoEndDate(false);
            setIsPublic(true);
        }
    };

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
            title={editingData ? "Edit Posting" : "Create New Posting"}
            open={visible}
            onCancel={handleCancel}
            width={800}
            footer={[
                <Button key="cancel" onClick={handleCancel}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={handleSubmit}>
                    {editingData ? "Update Posting" : "Create Posting"}
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
                            name="title"
                            label="Title"
                            rules={[validateRules.required()]}
                        >
                            <FloatInput
                                label="Posting Title"
                                placeholder="Enter posting title"
                                required
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Form.Item
                            name="content"
                            label="Content"
                            rules={[validateRules.required()]}
                        >
                            <FloatTextArea
                                label="Posting Content"
                                placeholder="Enter posting content"
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
                            label="Type"
                            rules={[validateRules.required()]}
                        >
                            <FloatSelect
                                label="Posting Type"
                                placeholder="Select posting type"
                                options={typeOptions}
                                onChange={handleTypeChange}
                                required
                            />
                        </Form.Item>
                    </Col>
                    {selectedType !== 'notification' && (
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="priority"
                                label="Priority"
                                rules={[validateRules.required()]}
                            >
                                <FloatSelect
                                    label="Priority Level"
                                    placeholder="Select priority"
                                    options={priorityOptions}
                                    required
                                />
                            </Form.Item>
                        </Col>
                    )}
                </Row>

                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="status"
                            label="Status"
                            rules={[validateRules.required()]}
                        >
                            <FloatSelect
                                label="Publishing Status"
                                placeholder="Select status"
                                options={statusOptions}
                                required
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="targetAudience"
                            label="Target Audience"
                            rules={selectedType === 'notification' ? [validateRules.required()] : []} // Required for notifications
                        >
                            <FloatSelect
                                label="Target Audience"
                                placeholder="Select target audience"
                                options={audienceOptions}
                                onChange={handleTargetAudienceChange}
                                required={selectedType === 'notification'}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="startDate"
                            label={selectedType === 'notification' ? "Published Date" : "Start Date"}
                            rules={[validateRules.required()]}
                        >
                            <FloatDatePicker
                                label={selectedType === 'notification' ? "Published Date" : "Start Date"}
                                placeholder={selectedType === 'notification' ? "Current date (auto-set)" : "Select start date"}
                                format="YYYY-MM-DD"
                                disabled={selectedType === 'notification'} // Disabled for notifications
                                disabledDate={(current) => {
                                    // Disable dates before today for new postings
                                    return current && current < dayjs().startOf('day');
                                }}
                                onChange={handleStartDateChange}
                                required
                            />
                        </Form.Item>
                    </Col>
                    {selectedType !== 'notification' && (
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="endDate"
                                label="End Date"
                                rules={noEndDate ? [] : [validateRules.required()]}
                            >
                                <FloatDatePicker
                                    label="End Date"
                                    placeholder="Select end date"
                                    format="YYYY-MM-DD"
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
                    )}
                </Row>

                {selectedType !== 'notification' && (
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
                )}
            </Form>
        </Modal>
    );
}
