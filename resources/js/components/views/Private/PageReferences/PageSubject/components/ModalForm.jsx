import { useEffect } from "react";
import { Modal, Button, Form, notification } from "antd";

import { POST } from "../../../../../providers/useAxiosQuery";
import validateRules from "../../../../../providers/validateRules";
import FloatInput from "../../../../../providers/FloatInput";
import notificationErrors from "../../../../../providers/notificationErrors";

export default function ModalForm(props) {
    const { toggleModalForm, setToggleModalForm } = props;

    const [form] = Form.useForm();

    const { mutate: mutateSubject, isLoading: isLoadingSubject } = POST(
        `api/subject`,
        "subject_list"
    );

    const onFinish = (values) => {
        let data = {
            ...values,
            id:
                toggleModalForm.data && toggleModalForm.data.id
                    ? toggleModalForm.data.id
                    : "",
        };

        mutateSubject(data, {
            onSuccess: (res) => {
                if (res.success) {
                    setToggleModalForm({
                        open: false,
                        data: null,
                    });
                    form.resetFields();
                    notification.success({
                        message: "Subject",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Subject",
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
            } Subject`}
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
                    disabled={isLoadingSubject}
                >
                    CANCEL
                </Button>,
                <Button
                    type="primary"
                    key={2}
                    onClick={() => form.submit()}
                    loading={isLoadingSubject}
                >
                    SUBMIT
                </Button>,
            ]}
        >
            <Form form={form} onFinish={onFinish}>
                <Form.Item name="code" rules={[validateRules.required()]}>
                    <FloatInput
                        label="Subject Code"
                        placeholder="Subject Code"
                        required={true}
                    />
                </Form.Item>
                <Form.Item name="name" rules={[validateRules.required()]}>
                    <FloatInput
                        label="Subject Name"
                        placeholder="Subject Name"
                        required={true}
                    />
                </Form.Item>
                <Form.Item
                    name="description"
                    rules={[validateRules.required()]}
                >
                    <FloatInput label="description" placeholder="description" />
                </Form.Item>
            </Form>
        </Modal>
    );
}
