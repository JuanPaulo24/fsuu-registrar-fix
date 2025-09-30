import { useEffect } from "react";
import { Modal, Button, Form, notification } from "antd";

import { POST } from "../../../../../providers/useAxiosQuery";
import validateRules from "../../../../../providers/validateRules";
import FloatInput from "../../../../../providers/FloatInput";
import notificationErrors from "../../../../../providers/notificationErrors";

export default function ModalForm(props) {
    const { toggleModalForm, setToggleModalForm } = props;

    const [form] = Form.useForm();

    const { mutate: mutateDepartment, isLoading: isLoadingDepartment } = POST(
        `api/department`,
        "department_list"
    );

    const onFinish = (values) => {
        console.log("onFinish", values);

        let data = {
            ...values,
            id:
                toggleModalForm.data && toggleModalForm.data.id
                    ? toggleModalForm.data.id
                    : "",
        };

        mutateDepartment(data, {
            onSuccess: (res) => {
                if (res.success) {
                    setToggleModalForm({
                        open: false,
                        data: null,
                    });
                    form.resetFields();
                    notification.success({
                        message: "Department",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Department",
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
    }, [toggleModalForm]);

    return (
        <Modal
            title={`${
                toggleModalForm.data && toggleModalForm.data.id ? "Edit" : "Add"
            } Department`}
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
                    onClick={() => {
                        setToggleModalForm({
                            open: false,
                            data: null,
                        });
                        form.resetFields();
                    }}
                    key={1}
                    disabled={isLoadingDepartment}
                >
                    CANCEL
                </Button>,
                <Button
                    onClick={() => form.submit()}
                    loading={isLoadingDepartment}
                    key={2}
                    type="primary"
                >
                    SUBMIT
                </Button>,
            ]}
        >
            <Form form={form} onFinish={onFinish}>
                <Form.Item name="abbr">
                    <FloatInput
                        label="Abbreviation"
                        placeholder="Abbreviation"
                    />
                </Form.Item>
                <Form.Item
                    name="department_name"
                    rules={[validateRules.required()]}
                >
                    <FloatInput
                        label="Department"
                        placeholder="Department"
                        required={true}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
