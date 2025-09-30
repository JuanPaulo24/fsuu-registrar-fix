import React, { useState, useEffect } from "react";
import { Form, Input, Button, Row, Col, Collapse, DatePicker, message } from "antd";
import DataPrivacyActTxt from "../../../../providers/DataPrivacyActTxt";
import { RollbackOutlined } from "@ant-design/icons";
import FloatInput from "../../../../providers/FloatInput";
import FloatDatePicker from "../../../../providers/FloatDatePicker";
import { faPlus } from "@fortawesome/pro-duotone-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const { Panel } = Collapse;

function ParishionerInfo({ onAdd, closeModal, tabActive }) {
    const [form] = Form.useForm();
    const [activeKeys, setActiveKeys] = useState(["1", "2"]);
    const [activities, setActivities] = useState([{ id: 1 }]);


    const handleAddActivity = () => {
        setActivities((prev) => [...prev, { id: prev.length + 1 }]);
    };


    const handleCancel = () => {
        form.resetFields();
        setActivities([{ id: 1 }]);
        closeModal();

    };

    const handleSubmit = (values) => {
        const combinedValues = {
            worshipHead: values.worshipHead,
            activities: activities.map((activity, index) => ({
                activity: values[`activity_${index}`],
                dateOfActivity: values[`dateOfActivity_${index}`],
                volunteerName: values[`volunteerName_${index}`],
            })),
        };

        onAdd(combinedValues);
        message.success("Submitted Successfully!");
        form.resetFields();
        setActivities([{ id: 1 }]);
    };

    return (
        <div className="parishioner-container">
            <div className="back-button-container">
                <Button onClick={closeModal} className="back-button" icon={<RollbackOutlined />}>
                    Back
                </Button>
            </div>

            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Collapse
                    activeKey={activeKeys}
                    onChange={(keys) => setActiveKeys(keys)}
                    className="parishioner-collapse"
                >
                    {/* Panel 1 */}
                    <Panel header={<span>PARISH VOLUNTEER INFORMATION</span>} key="1" className="parishioner-panel">
                        <Row gutter={16} align="middle">
                            <Col span={8}>
                                <Form.Item name="worshipHead" label="Worship Head" rules={[{ required: true }]}>
                                    <FloatInput placeholder="Enter worship head" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Panel>

                    {/* Panel 2 */}

                    <Panel header={<span>{tabActive} DETAILS</span>} key="2" className="worship-volunteer-panel">
                        {activities.map((activity, index) => (
                            <Row gutter={16} key={activity.id}>
                                <Col span={8}>
                                    <Form.Item
                                        name={`activity_${index}`}
                                        label="Activity"
                                        rules={[{ required: true }]}
                                    >
                                        <FloatInput placeholder="Enter activity" />
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item
                                        name={`dateOfActivity_${index}`}
                                        label="Date of Activity"
                                        rules={[{ required: true }]}
                                    >
                                        <FloatDatePicker format="DD/MM/YYYY" placeholder="Select date" />
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item
                                        name={`volunteerName_${index}`}
                                        label="Volunteer Name"
                                        rules={[{ required: true }]}
                                    >
                                        <FloatInput placeholder="Enter volunteer name" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        ))}

                        <div className="flex justify-end mb-4">
                            <Button
                                type="secondary"
                                className="add-activity-button"
                                icon={<FontAwesomeIcon icon={faPlus} />}
                                onClick={handleAddActivity}
                            >
                                Add Activity
                            </Button>
                        </div>
                    </Panel>
                </Collapse>

                <div className="data-privacy-button-container">
                    <DataPrivacyActTxt />
                    <div className="button-container">
                        <Button onClick={handleCancel} className="cancel-button">
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" className="submit-button">
                            Submit
                        </Button>
                    </div>
                </div>
            </Form>
        </div>
    );
}

export default ParishionerInfo;
