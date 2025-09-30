import { Modal, Button, Form, notification } from "antd";

import { useEffect } from "react";
import FloatInput from "../../../../providers/FloatInput";
import { POST, GET } from "../../../../providers/useAxiosQuery";
import validateRules from "../../../../providers/validateRules";

export default function ModalFormEmail(props) {
    const { toggleModalFormEmail, setToggleModalFormEmail } = props;
    const [form] = Form.useForm();

    const { mutate: mutateEmail, loading: loadingEmail } = POST(
        `api/users_update_email`,
        "users_info"
    );

    const onFinish = (values) => {
        console.log("onFinish", values);

        let data = {
            ...values,

            id:
                toggleModalFormEmail.data && toggleModalFormEmail.data.id
                    ? toggleModalFormEmail.data.id
                    : "",
        };

        mutateEmail(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Email Update",
                        description: res.message,
                    });

                    setToggleModalFormEmail({ open: false, data: null });

                    form.resetFields();
                } else {
                    notification.error({
                        message: "Something went wrong",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notification.error({
                    message: "Email Update",
                    description: "Something went Wrong",
                });
            },
        });
    };

    useEffect(() => {
        if (toggleModalFormEmail.open) {
            form.setFieldsValue({
                ...toggleModalFormEmail.data,
            });
        }

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toggleModalFormEmail]);

    return (
        <Modal
            title="Change Email"
            open={toggleModalFormEmail.open}
            onCancel={() => {
                setToggleModalFormEmail({
                    open: false,
                    data: null,
                });
            }}
            footer={[
                <Button
                    className="btn-main-primary outlined"
                    size="large"
                    key={1}
                    onClick={() => {
                        setToggleModalFormEmail({
                            open: false,
                            data: null,
                        });
                        form.resetFields();
                    }}
                >
                    CANCEL
                </Button>,
                <Button
                    className="btn-main-primary"
                    type="primary"
                    size="large"
                    key={2}
                    onClick={(values) => form.submit(values)}
                    loading={loadingEmail}
                >
                    SUBMIT
                </Button>,
            ]}
        >
            <Form form={form} onFinish={onFinish}>
                <Form.Item
                    name="email"
                    rules={[validateRules.email, validateRules.required()]}
                >
                    <FloatInput
                        label="New email"
                        placeholder="New Email"
                        required
                    />
                </Form.Item>
                <Form.Item
                    name="confirm_email"
                    rules={[
                        validateRules.email_validate,
                        validateRules.required(),
                    ]}
                >
                    <FloatInput
                        label="Confirm email"
                        placeholder="Confirm Email"
                        required
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
