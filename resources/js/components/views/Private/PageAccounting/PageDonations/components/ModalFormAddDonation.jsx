import { useEffect } from "react";
import FloatInput from "../../../../../providers/FloatInput";
import DatePicker from "../../../../../providers/FloatDatePicker";
import FloatSelect from "../../../../../providers/FloatSelect";

import {
    Modal,
    Form,
    Row,
    Col,
    Button,
    Divider,
    Typography,
    Flex
} from "antd";
import FloatDatePicker from "../../../../../providers/FloatDatePicker";

export default function ModalFormAddDonation({ toggleModalModule, setToggleModalModule }) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (toggleModalModule.open) {
            form.setFieldsValue(toggleModalModule.data || {});
        }
    }, [toggleModalModule, form]);

    const onFinish = (values) => {
        console.log("Form submitted:", values);
        setToggleModalModule({ open: false, data: null });
        form.resetFields();
    };

    return (
        <Modal
            title="ADD DOnation"
            open={toggleModalModule.open}
            onCancel={() => setToggleModalModule({ open: false, data: null })}
            footer={null}
            width={800}
        >
            <Form layout="vertical" form={form} onFinish={onFinish}>
                {/* Full Name & Date */}
                <Row gutter={[16, 16]}>
                    <Col span={8}>
                        <Form.Item name="full_name" label="Full Name" rules={[{ required: true, message: "Required" }]}>
                            <FloatInput placeholder="Enter full name" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="date" label="Date" rules={[{ required: true, message: "Required" }]}>
                            <DatePicker style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Services, Form of Donation & Amount */}
                <Row gutter={[16, 16]}>
                    <Col span={8}>
                        <Form.Item name="services" label="Services" rules={[{ required: true, message: "Required" }]}>
                            <FloatInput placeholder="Enter services" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="form_of_donation" label="Form of Donation" rules={[{ required: true, message: "Please select a form of donation." }]}>
                            <FloatSelect placeholder="Select form of donation" options={[
                                { value: "Cash", label: "Cash" },
                                { value: "Goods", label: "Goods" },
                                { value: "Others", label: "Others" }
                            ]} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="amount" label="Amount" rules={[{ required: true, message: "Required" }]}>
                            <FloatInput type="number" placeholder="Enter amount" />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider style={{borderTop: "1px solid black"}} />

                {/* Received by, Checked by, Approved by */}
                <Row gutter={[16, 16]}>
                    <Col span={8}>
                        <Form.Item name="received_by" label="Received by">
                            <FloatInput placeholder="Enter name" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="checked_by" label="Checked by">
                            <FloatInput placeholder="Enter name" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="approved_by" label="Approved by">
                            <FloatInput placeholder="Enter name" />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Submit Button */}
                <Row justify="end">
                    <Button type="primary" htmlType="submit" style={{ backgroundColor: "green", borderColor: "green" }}>
                        Submit
                    </Button>
                </Row>
            </Form>
        </Modal>
    );
}
