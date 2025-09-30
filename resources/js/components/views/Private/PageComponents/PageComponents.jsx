import { Button, Col, Divider, Form, Row, Space } from "antd";

import validateRules from "../../../providers/validateRules";
import FloatInput from "../../../providers/FloatInput";
import FloatInputPassword from "../../../providers/FloatInputPassword";
import FloatInputMask from "../../../providers/FloatInputMask";
import FloatInputNumber from "../../../providers/FloatInputNumber";
import FloatInputPasswordStrength from "../../../providers/FloatInputPasswordStrength";
import FloatSelect from "../../../providers/FloatSelect";
import FloatTextArea from "../../../providers/FloatTextArea";
import FloatQuill from "../../../providers/FloatQuill";
import FloatDatePicker from "../../../providers/FloatDatePicker";

export default function PageComponents() {
    return (
        <Row gutter={[12, 12]}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}></Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Form>
                    <Row gutter={[12, 12]}>
                        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                            <Divider orientation="left">Float Input</Divider>
                        </Col>

                        <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                            <Form.Item
                                name="email"
                                rules={[validateRules.required()]}
                            >
                                <FloatInput
                                    label="Float Input"
                                    placeholder="Float Input"
                                    required
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                            <Form.Item
                                name="password"
                                rules={[validateRules.required()]}
                            >
                                <FloatInputPassword
                                    label="Float Password"
                                    placeholder="Float Password"
                                    required
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                            <Form.Item
                                name="contact_number"
                                rules={[
                                    validateRules.phone,
                                    validateRules.required(),
                                ]}
                            >
                                <FloatInputMask
                                    label="Float Input Mask"
                                    placeholder="Float Input Mask"
                                    maskLabel="contact_number"
                                    maskType="999-999-9999"
                                    required
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                            <Form.Item
                                name="contact_number2"
                                rules={[validateRules.required()]}
                            >
                                <FloatInputNumber
                                    label="Float Input Number / Rate (for rate add step='0.00')"
                                    placeholder="Float Input Number / Rate (for rate add step='0.00')"
                                    required
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                            <Form.Item
                                name="password_strength"
                                rules={[validateRules.required()]}
                            >
                                <FloatInputPasswordStrength
                                    label="Float Password Strength"
                                    placeholder="Float Password Strength"
                                    required
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                            <Form.Item
                                name="input_select"
                                rules={[validateRules.required()]}
                            >
                                <FloatSelect
                                    label="Float Select"
                                    placeholder="Float Select"
                                    required
                                    options={[
                                        {
                                            value: "Option 1",
                                            label: "Option 1",
                                        },
                                        {
                                            value: "Option 2",
                                            label: "Option 2",
                                        },
                                        {
                                            value: "Option 3",
                                            label: "Option 3",
                                        },
                                    ]}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                            <Form.Item
                                name="input_select_dropdown"
                                rules={[validateRules.required()]}
                            >
                                <FloatSelect
                                    label="Float Select Multi"
                                    placeholder="Float Select Multi"
                                    required
                                    multi="multiple"
                                    options={[
                                        {
                                            value: "Option 1",
                                            label: "Option 1",
                                        },
                                        {
                                            value: "Option 2",
                                            label: "Option 2",
                                        },
                                        {
                                            value: "Option 3",
                                            label: "Option 3",
                                        },
                                        {
                                            value: "Option 4",
                                            label: "Option 4",
                                        },
                                        {
                                            value: "Option 5",
                                            label: "Option 5",
                                        },
                                        {
                                            value: "Option 6",
                                            label: "Option 6",
                                        },
                                    ]}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                            <Form.Item
                                name="float_date_picker"
                                rules={[validateRules.required()]}
                            >
                                <FloatDatePicker
                                    label="Float Date Picker"
                                    placeholder="Float Date Picker"
                                    required
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                            <Form.Item
                                name="textarea"
                                rules={[validateRules.required()]}
                            >
                                <FloatTextArea
                                    label="Float Text Area"
                                    placeholder="Float Text Area"
                                    required
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                            <Form.Item
                                name="quill"
                                rules={[validateRules.required()]}
                            >
                                <FloatQuill
                                    label="Float Quill"
                                    placeholder="Float Quill"
                                    required
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                            <Divider orientation="left">
                                Buttons Default
                            </Divider>
                            <Space>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    className="btn-main-primary"
                                >
                                    Main Primary Default
                                </Button>

                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    className="btn-main-primary outlined"
                                >
                                    Main Primary Outlined
                                </Button>

                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    className="btn-main-primary active"
                                >
                                    Main Primary Active
                                </Button>

                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    className="btn-main-primary"
                                    disabled
                                >
                                    Main Primary Disabled
                                </Button>
                            </Space>
                        </Col>

                        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                            <Divider orientation="left">Buttons Size</Divider>
                            <Space>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    className="btn-main-primary"
                                    size="small"
                                >
                                    Small
                                </Button>

                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    className="btn-main-primary"
                                >
                                    Middle
                                </Button>

                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    className="btn-main-primary"
                                    size="large"
                                >
                                    Large
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Form>
            </Col>
        </Row>
    );
}
