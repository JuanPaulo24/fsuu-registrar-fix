import React, { useContext } from "react";
import { Form, Button, Table } from "antd";
import { MINISTRY_DATA } from "./TableMinistry";
import PageMinistryContext from "./PageMinistryContext";
import FloatSelect from "../../../../providers/FloatSelect";
import FloatInput from "../../../../providers/FloatInput";
import { TableGlobalSearchAnimated } from "../../../../providers/CustomTableFilter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/pro-regular-svg-icons";

function ModalArchiveMinistry({ onAdd, closeModal }) {
    const [form] = Form.useForm();
    const { tabActive } = useContext(PageMinistryContext);

    const handleSubmit = (values) => {
        onAdd(values);
        form.resetFields();
    };

    const archivedData = MINISTRY_DATA[tabActive]?.filter(item => item.status === "archive") || [];

    return (
        <div>
            <div style={{ padding: "10px" }}>
                <Form form={form} layout="vertical" onFinish={handleSubmit} className="w-full">

                    <div className="flex gap-5" style={{ paddingBottom: "20px" }}>

                        <Button
                            type=""
                            className="border border-green-500 text-green-500 px-4 py-2 rounded-lg"
                            icon={<FontAwesomeIcon icon={faFilter} /> }

                        >
                            Filter
                        </Button>
                        <TableGlobalSearchAnimated />
                    </div>

                    <Table
                        dataSource={archivedData}
                        columns={[
                            { title: "Full Name", dataIndex: "fullname", key: "fullname" },
                            { title: "Activities", dataIndex: "activities", key: "activities" },
                            { title: "Date Scheduled", dataIndex: "date_scheduled", key: "date_scheduled" },
                            { title: "Date Deleted", dataIndex: "date_deleted", key: "date_deleted" }
                        ]}
                        rowKey="id"
                        pagination={false}
                    />



                    <div className="flex justify-between items-center gap-3 mt-4" style={{ paddingTop: "20px" }}>

                        <Button
                            type="primary"
                            htmlType="button"
                            className="bg-green-600 text-white px-4 py-2 rounded-lg"
                        >
                            Clear all
                        </Button>

                        <div className="flex gap-3">
                            <Button
                                type="primary"
                                className="bg-green-600 text-white px-4 py-2 rounded-lg"
                            >
                                Restore
                            </Button>
                            <Button
                                onClick={closeModal}
                                className="border border-green-500 text-green-500 px-4 py-2 rounded-lg"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>

                </Form>
            </div>
        </div>
    );
}

export default ModalArchiveMinistry;
