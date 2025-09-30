import { useContext, useEffect } from "react";
import { Modal, Button, Form, notification } from "antd";

import { POST } from "../../../../../providers/useAxiosQuery";
import validateRules from "../../../../../providers/validateRules";
import FloatInput from "../../../../../providers/FloatInput";
import FloatSelect from "../../../../../providers/FloatSelect";
import notificationErrors from "../../../../../providers/notificationErrors";
import PageCourseContext from "./PageCourseContext";

export default function ModalForm() {
    const { toggleModalForm, setToggleModalForm, dataDepartment } =
        useContext(PageCourseContext);

    const [form] = Form.useForm();

    const { mutate: mutateCourse, isLoading: isLoadingCouse } = POST(
        `api/course`,
        "course_list"
    );

    const onFinish = (values) => {
        let data = {
            ...values,
            id:
                toggleModalForm.data && toggleModalForm.data.id
                    ? toggleModalForm.data.id
                    : "",
        };

        mutateCourse(data, {
            onSuccess: (res) => {
                if (res.success) {
                    setToggleModalForm({
                        open: false,
                        data: null,
                    });
                    form.resetFields();
                    notification.success({
                        message: "Course",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Course",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    useEffect(() => {
        if (toggleModalForm.open) {
            form.setFieldsValue({
                ...toggleModalForm.data,
            });
        }

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toggleModalForm]);

    return (
        <Modal
            title={`${
                toggleModalForm.data && toggleModalForm.data.id ? "Edit" : "Add"
            } Room`}
            open={toggleModalForm.open}
            onCancel={() => {
                setToggleModalForm({
                    open: false,
                    data: null,
                });
                form.resetFields();
            }}
            forceRender
            footer={[
                <Button
                    key={1}
                    onClick={() => {
                        setToggleModalForm({
                            open: false,
                            data: null,
                        });
                        form.resetFields();
                    }}
                    disabled={isLoadingCouse}
                >
                    CANCEL
                </Button>,
                <Button
                    type="primary"
                    key={2}
                    onClick={() => form.submit()}
                    loading={isLoadingCouse}
                >
                    SUBMIT
                </Button>,
            ]}
        >
            <Form form={form} onFinish={onFinish}>
                <Form.Item
                    name="department_id"
                    rules={[validateRules.required()]}
                >
                    <FloatSelect
                        label="Department"
                        placeholder="Department"
                        showSearch
                        options={dataDepartment.map((item) => {
                            return {
                                label: item.department_name,
                                value: item.id,
                            };
                        })}
                        required={true}
                    />
                </Form.Item>

                <Form.Item
                    name="course_code"
                    rules={[validateRules.required()]}
                >
                    <FloatInput
                        label="Course Code"
                        placeholder="Course Code"
                        required={true}
                    />
                </Form.Item>

                <Form.Item
                    name="course_name"
                    rules={[validateRules.required()]}
                >
                    <FloatInput
                        label="Course Name"
                        placeholder="Course Name"
                        required={true}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
