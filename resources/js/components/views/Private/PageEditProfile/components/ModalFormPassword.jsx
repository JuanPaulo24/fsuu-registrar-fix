import { Modal, Button, Form, notification } from "antd";

import { useEffect } from "react";
import { POST } from "../../../../providers/useAxiosQuery";
import FloatInputPassword from "../../../../providers/FloatInputPassword";
import validateRules from "../../../../providers/validateRules";

export default function ModalFormPassword(props) {
    const { toggleModalFormPassword, setToggleModalFormPassword } = props;
    const [form] = Form.useForm();

    const { mutate: mutatePassword, loading: loadingPassword } = POST(
        `api/users_update_password`,
        "users_info"
    );

    const onFinish = (values) => {
        console.log("onFinish", values);

        let data = {
            ...values,

            id:
                toggleModalFormPassword.data && toggleModalFormPassword.data.id
                    ? toggleModalFormPassword.data.id
                    : "",
        };

        mutatePassword(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Password",
                        description: res.message,
                    });

                    setToggleModalFormPassword({
                        open: false,
                        data: null,
                    });

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
                    message: "Password Update",
                    description: "Something went wrong",
                });
            },
        });
    };

    useEffect(() => {
        if (toggleModalFormPassword.open) {
            form.setFieldsValue({
                ...toggleModalFormPassword.data,
            });
        }

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toggleModalFormPassword]);

    return (
        <Modal
            title="Change Password"
            open={toggleModalFormPassword.open}
            onCancel={() => {
                setToggleModalFormPassword({
                    open: false,
                    data: null,
                });
                form.resetFields();
            }}
            forceRender
            footer={[
                <Button
                    className="btn-main-primary outlined"
                    size="large"
                    key={1}
                    onClick={() => {
                        setToggleModalFormPassword({
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
                    loading={loadingPassword}
                >
                    SUBMIT
                </Button>,
            ]}
        >
            <Form form={form} onFinish={onFinish}>
                <Form.Item
                    name="new_password"
                    rules={[validateRules.required(), validateRules.password]}
                >
                    <FloatInputPassword
                        label="New Password"
                        placeholder="New Password"
                        required={true}
                    />
                </Form.Item>
                <Form.Item
                    name="confirm_password"
                    rules={[
                        validateRules.password_validate,
                        validateRules.required(),
                    ]}
                >
                    <FloatInputPassword
                        label="Confirm Password"
                        placeholder="Confirm Password"
                        required={true}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
