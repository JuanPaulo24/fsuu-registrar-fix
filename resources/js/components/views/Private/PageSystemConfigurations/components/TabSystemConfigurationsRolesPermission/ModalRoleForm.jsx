import React, { useEffect } from "react";
import { Form, Input, Button, Row, Col, Select, Switch } from "antd";
import FloatSelect from "../../../../../providers/FloatSelect";
import FloatInput from "../../../../../providers/FloatInput";
import FloatTextArea from "../../../../../providers/FloatTextArea";

function ModalRoleForm({ onAdd, closeModal, initialData }) {
    const [form] = Form.useForm();
    
    // If editing an existing role, populate form fields
    useEffect(() => {
        if (initialData) {
            form.setFieldsValue({
                roleName: initialData.role_name,
                description: initialData.description,
            });
        }
    }, [initialData, form]);

    const handleSubmit = (values) => {
        const formattedValues = {
            role_name: values.roleName,
            description: values.description,

        };
        
        onAdd?.(formattedValues);
        form.resetFields();
        closeModal();
    };

    const roleTypes = [
        { value: "SUPER ADMIN", label: "Super Admin" },
        { value: "ADMIN", label: "Admin" },
        { value: "FACULTY", label: "Faculty" },
        { value: "STUDENT", label: "Student" }
    ];

    return (
        <div className="modal-container bg-white rounded-lg shadow-lg">
            <div style={{ padding: "20px" }}>
                <Form form={form} layout="vertical" onFinish={handleSubmit} className="w-full">
                    {/* Role Name */}
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Form.Item name="roleName" label="Role Name" rules={[{ required: true, message: "Please enter role name" }]}>
                                <FloatInput />
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    {/* Description */}
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Form.Item name="description" label="Description">
                                <FloatTextArea rows={3} />
                            </Form.Item>
                        </Col>
                    </Row>


                    {/* Permissions section could be added here if needed */}

                    <div className="flex justify-end gap-3 mt-4">
                        <Button onClick={closeModal} className="border border-green-500 text-green-500 px-4 py-2 rounded-lg">
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg">
                            Submit
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
}

export default ModalRoleForm;
