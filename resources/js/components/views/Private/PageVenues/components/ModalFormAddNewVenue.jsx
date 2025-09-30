import React from "react";
import { Modal, Form, Input, Button, Row, Col } from "antd";

export default function ModalFormAddNewVenue({ visible, onClose, onSubmit }) {
    const [form] = Form.useForm();

    const handleOk = () => {
        form.validateFields().then((values) => {
            onSubmit(values);
            form.resetFields();
        });
    };

    return (
        <Modal
            title={<span className="modal-title">NEW VENUE</span>}
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose} className="cancel-btn">
                    Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={handleOk} className="submit-btn">
                    Submit
                </Button>,
            ]}
            className="custom-modal"
        >
            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="venue" label="Venue Name" rules={[{ 
                            required: true, 
                            message: "Please enter the venue name" 
                            }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="capacity" label="Capacity" rules={[{ 
                            required: true, 
                            message: "Please enter the capacity" 
                            }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="description" label="Description" rules={[{ 
                            required: true, 
                            message: "Please enter the description" 
                            }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="address" label="Address" rules={[{ 
                            required: true, 
                            message: "Please enter the address" 
                            }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}
