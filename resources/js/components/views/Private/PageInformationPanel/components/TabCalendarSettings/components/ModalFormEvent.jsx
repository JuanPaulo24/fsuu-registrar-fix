import { Modal, Form, Row, Col, Checkbox, message } from "antd";
import dayjs from "dayjs";
import FloatInput from "../../../../../../providers/FloatInput";
import FloatTextArea from "../../../../../../providers/FloatTextArea";
import FloatDatePicker from "../../../../../../providers/FloatDatePicker";
import FloatSelect from "../../../../../../providers/FloatSelect";
import validateRules from "../../../../../../providers/validateRules";

export default function ModalFormEvent({
    open,
    onCancel,
    onSubmit,
    form,
    editingEvent,
    noEndDate,
    setNoEndDate
}) {
    const typeOptions = [
        { value: 'Academic Events', label: 'Academic Events' },
        { value: 'Training and Development', label: 'Training and Development' },
        { value: 'Institutional & Program Events', label: 'Institutional & Program Events' },
        { value: 'Professional & Industry-Related', label: 'Professional & Industry-Related' },
        { value: 'Competitions', label: 'Competitions' },
        { value: 'Cultural Events', label: 'Cultural Events' },
        { value: 'Community Outreach Events', label: 'Community Outreach Events' }
    ];

    const handleCancel = () => {
        onCancel();
        form.resetFields();
        setNoEndDate(false);
    };

    return (
        <Modal
            title={editingEvent ? "Edit Event" : "Add New Event"}
            open={open}
            onCancel={handleCancel}
            onOk={onSubmit}
            width={600}
        >
            <Form form={form} layout="vertical">
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Form.Item
                            name="title"
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
                            name="description"
                            label="Description"
                            rules={[validateRules.required()]}
                        >
                            <FloatTextArea
                                label="Event Description"
                                placeholder="Enter event description"
                                rows={3}
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
                                label="Status"
                                placeholder="Select status"
                                options={[
                                    { value: 'active', label: 'Active' },
                                    { value: 'inactive', label: 'Inactive' }
                                ]}
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
                                format="YYYY-MM-DD"
                                disabledDate={(current) => {
                                    // Disable dates before today for new events
                                    return current && current < dayjs().startOf('day');
                                }}
                                onChange={(date) => {
                                    const endDate = form.getFieldValue('endDate');
                                    // If end date is already selected and it's before the new start date, clear it
                                    if (endDate && date && dayjs(endDate).isBefore(dayjs(date))) {
                                        form.setFieldValue('endDate', null);
                                        message.warning('End date has been cleared because it was before the new start date');
                                    }
                                }}
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