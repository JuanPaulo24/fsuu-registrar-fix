import React, { useContext, useEffect } from "react";
import { Modal, Form, Button, Row, Col, message } from "antd";
import { POST } from "../../../../../../providers/useAxiosQuery";
import FloatInput from "../../../../../../providers/FloatInput";
import validateRules from "../../../../../../providers/validateRules";
import PageSystemConfigurationsContext from "../../TabSystemsConfigurationsContext";

export default function ModalCourseForm() {
    const { toggleModalForm, setToggleModalForm } = useContext(PageSystemConfigurationsContext);
    const [form] = Form.useForm();

    // Create/Update course mutation
    const saveCourse = POST(
        "api/courses",
        "courses_list",
        true,
        () => {
            if (import.meta.env.MODE !== 'production') {
                // eslint-disable-next-line no-console
                console.log('COURSES: saved', form.getFieldsValue());
            }
            message.success(toggleModalForm.data ? "Title updated successfully" : "Title created successfully");
            handleCancel();
        }
    );

    // Populate form when editing
    useEffect(() => {
        if (toggleModalForm.open && toggleModalForm.data) {
            form.setFieldsValue({
                course_code: toggleModalForm.data.course_code,
                course_name: toggleModalForm.data.course_name,
            });
        }
    }, [toggleModalForm, form]);

    const handleCancel = () => {
        setToggleModalForm({ open: false, data: null });
        form.resetFields();
    };

    const onFinish = (values) => {
        const data = {
            course_code: values.course_code?.toUpperCase(),
            course_name: values.course_name?.toUpperCase(),
        };

        if (toggleModalForm.data?.id) {
            data.id = toggleModalForm.data.id;
        }

        saveCourse.mutate(data, {
            onError: (err) => {
                if (import.meta.env.MODE !== 'production') {
                    // eslint-disable-next-line no-console
                    console.log('COURSES: save error', err?.response?.data || err?.message || err);
                }
            }
        });
    };

    return (
        <Modal
            title={`${toggleModalForm.data ? "Edit" : "Add"} Title`}
            open={toggleModalForm.open}
            onCancel={handleCancel}
            footer={[
                <Button
                    key="cancel"
                    onClick={handleCancel}
                    disabled={saveCourse.isLoading}
                >
                    CANCEL
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={() => form.submit()}
                    loading={saveCourse.isLoading}
                >
                    SUBMIT
                </Button>,
            ]}
            destroyOnClose
            width={600}
        >
            <Form form={form} onFinish={onFinish} layout="vertical">
                <Row gutter={[16, 16]}>

                    <Col span={24}>
                        <Form.Item 
                            name="course_name" 
                            label="Title"
                            rules={[validateRules.required()]}
                        >
                                                         <FloatInput
                                 label="Title"
                                 placeholder="e.g., Masters in Information Technology"
                                 required={true}
                                 style={{ textTransform: 'uppercase' }}
                                 onChange={(e) => {
                                     const upperValue = e.target.value.toUpperCase();
                                     form.setFieldsValue({ course_name: upperValue });
                                 }}
                             />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item 
                            name="course_code" 
                            label="Initial Title"
                            rules={[validateRules.required()]}
                        >
                                                         <FloatInput
                                 label="Initial Title"
                                 placeholder="MIT"
                                 required={true}
                                 style={{ textTransform: 'uppercase' }}
                                 onChange={(e) => {
                                     const upperValue = e.target.value.toUpperCase();
                                     form.setFieldsValue({ course_code: upperValue });
                                 }}
                             />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}