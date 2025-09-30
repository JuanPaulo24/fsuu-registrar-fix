import React from "react";
import { Form, Button, Row, Col} from "antd";
import  FloatInput from "../../../../../providers/FloatInput";
import FloatSelect from "../../../../../providers/FloatSelect";


const ModalPayroll= ({ onAdd, closeModal }) => {
    const [form] = Form.useForm();

    const handleSubmit = (values) => {
        onAdd(values);
        form.resetFields();
    };

    return (

        <div className="payroll-modal-container w-full">
            <div className=" bg-green-800 text-white !p-5 rounded-t-lg">
                <h2 className="text-lg font-bold">PAYROLL</h2>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="!p-5 w-full"
            >
                <h3 className="text-green-800 font-bold !mt-5">EMPLOYEE DETAILS</h3>
                <Row gutter={[16,16]}>
                    <Col  xs={24} sm={24} md={8} >
                        <Form.Item name="employee_name" label="Employee Name" rules={[{ required: true }]}>
                        <FloatSelect
                                options ={[
                                {value: "FakeDataJohn", label: "FakeDataJohn"},
                                {value: "FakeDataPhil", label: "FakeDataPhil"}
                            ]}
                            />
                        </Form.Item>
                    </Col>
                    <Col  xs={24} sm={24} md={8}>
                        <Form.Item name="monthly_payment" label="Monthly Payment">
                            <FloatInput  />
                        </Form.Item>
                    </Col>
                    <Col  xs={24} sm={24} md={8}>
                        <Form.Item name="basic_pay" label="Basic (bi-monthly)">
                            <FloatInput  />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[16,16]}>
                    <Col  xs={24} sm={24} md={8}>
                        <Form.Item name="holiday" label="Holiday">
                            <FloatInput  />
                        </Form.Item>
                    </Col>
                    <Col  xs={24} sm={24} md={8}>
                        <Form.Item name="total_gross_payment" label="Total Gross Payment">
                            <FloatInput  />
                        </Form.Item>
                    </Col>
                </Row>

                <h3 className="text-green-800 font-bold mt-4">DEDUCTIONS</h3>
                <Row gutter={[16,16]}>
                    <Col  xs={24} sm={24} md={8}>
                        <Form.Item name="cash_loan" label="Cash Loan">
                            <FloatInput />
                        </Form.Item>
                    </Col>
                    <Col  xs={24} sm={24} md={8}>
                        <Form.Item name="sss" label="SSS">
                            <FloatInput />
                        </Form.Item>
                    </Col>
                    <Col  xs={24} sm={24} md={8}>
                        <Form.Item name="insurance" label="Insurance">
                            <FloatSelect
                                placeholder="Select an option"
                                options ={[
                                {value: "HealthInsurance", label: "Health Insurance"},
                                {value: "PhilHealth", label: "PhilHealth"}
                            ]}
                             allowClear
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[16,16]}>
                    <Col  xs={24} sm={24} md={8}>
                        <Form.Item name="mpl" label="MPL">
                            <FloatInput/>
                        </Form.Item>
                    </Col>
                    <Col  xs={24} sm={24} md={8}>
                        <Form.Item name="others" label="Others">
                            <FloatInput  />
                        </Form.Item>
                    </Col>
                </Row>

                <h3 className="text-green-800 font-bold mt-4">COMPUTATION AND SUMMARY</h3>
                <Row gutter={[16,16]}>
                    <Col  xs={24} sm={24} md={8}>
                        <Form.Item name="total_deductions" label="Total Deductions">
                            <FloatInput  />
                        </Form.Item>
                    </Col>
                    <Col  xs={24} sm={24} md={8}>
                        <Form.Item name="net_pay" label="Net Pay">
                            <FloatInput  />
                        </Form.Item>
                    </Col>
                </Row>

                <div className="flex justify-end gap-3 mt-4">
                    <Button onClick={closeModal} className="bg-gray-300">Cancel</Button>
                    <Button type="secondary" htmlType="submit" className="bg-green-600">Submit</Button>
                </div>
            </Form>
        </div>

    );
};

export default ModalPayroll;
