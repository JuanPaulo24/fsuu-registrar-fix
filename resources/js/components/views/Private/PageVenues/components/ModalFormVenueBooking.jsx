import React from "react";
import { Modal, Form, Input, Button, Row, Col, DatePicker, Select } from "antd";

export default function VenueBookingForm({ visible, onCancel }) {
    const [form] = Form.useForm();

    const handleOk = () => {
        form.validateFields().then((values) => {
            onCancel(values);
            form.resetFields();
        });
    };

    return (
        <Modal
            title={<span className="modal-title">VENUE BOOKING</span>}
            open={visible}
            onCancel={onCancel}
            footer={[
              <Button onClick={onCancel} style={{ marginRight: 8 }}>Cancel</Button>,
              <Button type="primary" onClick={handleOk}>Submit</Button>
            ]}
            className="custom-modal"
        >
            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="date_of_booking" 
                                label="Date of Booking" 
                                rules={[{ required: true, message: "Please select a date" }]}> 
                            <DatePicker style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="time_start" 
                                label="Time Start" 
                                rules={[{ required: true, message: "Please enter start time" }]}> 
                            <Input placeholder="e.g. 10:00 AM" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="time_end" 
                                label="Time End" 
                                rules={[{ required: true, message: "Please enter end time" }]}> 
                            <Input placeholder="e.g. 12:00 PM" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="participants" 
                                label="Number of Participants" 
                                rules={[{ required: true, message: "Please enter number of participants" }]}> 
                            <Input type="number" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="venue" 
                                label="Venue" 
                                rules={[{ required: true, message: "Please select a venue" }]}> 
                            <Select placeholder="Select a venue">
                                <Select.Option value="St. Joseph Cathedral">St. Joseph Cathedral</Select.Option>
                                <Select.Option value="Our Lady of Lourdes Parish">Our Lady of Lourdes Parish</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="capacity"
                                label="Capacity" 
                                rules={[{ required: true, message: "Please enter capacity" }]}> 
                            <Input type="number"/>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item name="requester" 
                                label="Person(s)/Organization(s)" 
                                rules={[{ required: true, message: "Please enter requesting person/organization" }]}> 
                            <Input />
                        </Form.Item>
                        <p style={{ fontStyle: "italic", fontWeight: "regular", marginBottom: "10px", marginTop: "-20px" }}>
                            We wish to use the venue above.
                        </p>    
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="requesting_person" 
                                label="Name of Requesting Person/Organization" 
                                rules={[{ required: true, message: "Please enter name" }]}> 
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="contact_no" 
                                label="Contact No." 
                                rules={[{ required: true, message: "Please enter contact number" }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <div className="commitment-box" style={{ padding: "12px", border: "1px solid #ccc", borderRadius: "8px", marginBottom: "16px" }}>
                    <strong>AS RESPONSIBLE PARISHIONERS WE COMMIT TO:</strong>
                    <ul>
                        <li>Clean the venue after use.</li>
                        <li>Arrange the tables and chairs.</li>
                        <li>Put OFF the air-conditioning units after use.</li>
                    </ul>
                    <p>All these we shall do as a gesture of courtesy to others.</p>
                </div>
                <Row justify="end">
                </Row>
            </Form>
        </Modal>
    );
}
