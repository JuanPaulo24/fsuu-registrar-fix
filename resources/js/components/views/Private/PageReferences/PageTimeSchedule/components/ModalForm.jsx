import { useEffect } from "react";
import { Modal, Button, Form, notification, Col, Row } from "antd";

import { POST } from "../../../../../providers/useAxiosQuery";
import validateRules from "../../../../../providers/validateRules";
import FloatSelect from "../../../../../providers/FloatSelect";
import FloatInputMask from "../../../../../providers/FloatInputMask";
import notificationErrors from "../../../../../providers/notificationErrors";

export default function ModalForm(props) {
    const { toggleModalForm, setToggleModalForm } = props;

    const [form] = Form.useForm();

    const { mutate: mutateTimeSchedule, isLoading: isLoadingTimeSchedule } =
        POST(`api/ref_time_schedule`, "time_schedule_list");

    const onFinish = (values) => {
        let data = {
            ...values,
            id:
                toggleModalForm.data && toggleModalForm.data.id
                    ? toggleModalForm.data.id
                    : "",
        };

        mutateTimeSchedule(data, {
            onSuccess: (res) => {
                if (res.success) {
                    setToggleModalForm({
                        open: false,
                        data: null,
                    });
                    form.resetFields();
                    notification.success({
                        message: "Time Schedule",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Time Schedule",
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
            } Time Schedule`}
            className="form-modal-time-schedule"
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
                    disabled={isLoadingTimeSchedule}
                >
                    CANCEL
                </Button>,
                <Button
                    type="primary"
                    key={2}
                    onClick={() => form.submit()}
                    loading={isLoadingTimeSchedule}
                >
                    SUBMIT
                </Button>,
            ]}
        >
            <Form form={form} onFinish={onFinish}>
                <Row>
                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Form.Item
                            name="time_in"
                            rules={[
                                validateRules.required(),
                                {
                                    validator: (_, value) => {
                                        if (!value) {
                                            return Promise.resolve();
                                        } else {
                                            if (
                                                value === "00:00:00" ||
                                                value.includes("_")
                                            ) {
                                                return Promise.reject(
                                                    new Error(
                                                        "Invalid time format!"
                                                    )
                                                );
                                            }
                                            let hours = value
                                                ? value.split(":")[0]
                                                : 0;
                                            let minutes = value
                                                ? value.split(":")[1]
                                                : 0;
                                            let seconds = value
                                                ? value.split(":")[2]
                                                : 0;
                                            if (parseInt(hours, 10) >= 24) {
                                                return Promise.reject(
                                                    new Error(
                                                        "Time cannot exceed 24 hours!"
                                                    )
                                                );
                                            } else if (
                                                parseInt(minutes, 10) >= 60
                                            ) {
                                                return Promise.reject(
                                                    new Error(
                                                        "Time cannot exceed 60 minutes!"
                                                    )
                                                );
                                            } else if (
                                                parseInt(seconds, 10) >= 60
                                            ) {
                                                return Promise.reject(
                                                    new Error(
                                                        "Time cannot exceed 60 seconds!"
                                                    )
                                                );
                                            }
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <FloatInputMask
                                label="Time In"
                                placeholder="Time In"
                                required={true}
                                maskType="99:99"
                                maskLabel="time_in"
                            />
                        </Form.Item>
                        <Form.Item
                            name="time_in_meridiem"
                            rules={[validateRules.required()]}
                        >
                            <FloatSelect
                                label="Meridiem"
                                placeholder="Meridiem"
                                required={true}
                                options={[
                                    {
                                        label: "AM",
                                        value: "AM",
                                    },
                                    {
                                        label: "PM",
                                        value: "PM",
                                    },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row>
                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Form.Item
                            name="time_out"
                            rules={[
                                validateRules.required(),
                                {
                                    validator: (_, value) => {
                                        if (!value) {
                                            return Promise.resolve();
                                        } else {
                                            if (
                                                value === "00:00:00" ||
                                                value.includes("_")
                                            ) {
                                                return Promise.reject(
                                                    new Error(
                                                        "Invalid time format!"
                                                    )
                                                );
                                            }
                                            let hours = value
                                                ? value.split(":")[0]
                                                : 0;
                                            let minutes = value
                                                ? value.split(":")[1]
                                                : 0;
                                            let seconds = value
                                                ? value.split(":")[2]
                                                : 0;
                                            if (parseInt(hours, 10) >= 24) {
                                                return Promise.reject(
                                                    new Error(
                                                        "Time cannot exceed 24 hours!"
                                                    )
                                                );
                                            } else if (
                                                parseInt(minutes, 10) >= 60
                                            ) {
                                                return Promise.reject(
                                                    new Error(
                                                        "Time cannot exceed 60 minutes!"
                                                    )
                                                );
                                            } else if (
                                                parseInt(seconds, 10) >= 60
                                            ) {
                                                return Promise.reject(
                                                    new Error(
                                                        "Time cannot exceed 60 seconds!"
                                                    )
                                                );
                                            }
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <FloatInputMask
                                label="Time Out"
                                placeholder="Time Out"
                                required={true}
                                maskType="99:99"
                                maskLabel="time_out"
                            />
                        </Form.Item>
                        <Form.Item
                            name="time_out_meridiem"
                            rules={[validateRules.required()]}
                        >
                            <FloatSelect
                                label="Meridiem"
                                placeholder="Meridiem"
                                required={true}
                                options={[
                                    {
                                        label: "AM",
                                        value: "AM",
                                    },
                                    {
                                        label: "PM",
                                        value: "PM",
                                    },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}
