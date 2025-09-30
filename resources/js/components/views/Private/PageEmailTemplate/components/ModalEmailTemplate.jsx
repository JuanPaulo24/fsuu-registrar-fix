import React, { useContext, useEffect } from "react";
import { Modal, Form, Button, Typography, Row, Col } from "antd";
import { faClose } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FloatInput from "../../../../providers/FloatInput";
import FloatQuill from "../../../../providers/FloatQuill";
import PageEmailContext from "./PageEmailContext";

export default function ModalEmailTemplate() {
    const { toggleModalForm, setToggleModalForm } = useContext(PageEmailContext);
    const [form] = Form.useForm();

    useEffect(() => {
        if (toggleModalForm.open) {
            form.setFieldsValue(toggleModalForm.data || {});
        } else {
            form.resetFields();
        }
    }, [toggleModalForm.open, form]);

    const handleSubmit = (values) => {
        console.log("Form Values:", values);
        setToggleModalForm({ open: false, data: null });
    };

    return (
        <Modal open={toggleModalForm.open} onCancel={() => setToggleModalForm({ open: false, data: null })} footer={null} width={700} closeIcon={<FontAwesomeIcon icon={faClose} />} className="modal-form-email-template" title={<Typography.Text>EMAIL TEMPLATE FORM</Typography.Text>}>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item name="title" rules={[{ required: true, message: "Title is required" }]}>
                    <FloatInput placeholder="Title" label="Title" />
                </Form.Item>
                <Form.Item name="subject" rules={[{ required: true, message: "Subject is required" }]}>
                    <FloatInput placeholder="Subject" label="Subject" />
                </Form.Item>
                <Form.Item name="body" rules={[{ required: true, message: "Body is required" }]}>
                    <FloatQuill placeholder="Body" />
                </Form.Item>
                <Row justify="end" gutter={10}>
                    <Col><Button onClick={() => setToggleModalForm({ open: false, data: null })}>Cancel</Button></Col>
                    <Col><Button type="primary" htmlType="submit">Submit</Button></Col>
                </Row>
            </Form>
        </Modal>
    );
}