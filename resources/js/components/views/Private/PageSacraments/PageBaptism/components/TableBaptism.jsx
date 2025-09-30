import React from "react";
import { useContext } from "react";
import { Table, Space } from "antd";
import PageBaptismContext from "./PageBaptismContext";

export default function TableBaptism() {
    const { baptismData, setBaptismData, toggleModalForm, setToggleModalForm } =
        useContext(PageBaptismContext);

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: (text) => <a>{text}</a>,
        },
        {
            title: "Age",
            dataIndex: "age",
            key: "age",
        },
        {
            title: "Address",
            dataIndex: "address",
            key: "address",
        },
        {
            title: "Action",
            key: "action",
            render: (text, record) => (
                <Space size="middle">
                    <a
                        onClick={() => {
                            setToggleModalForm({
                                open: true,
                                data: record,
                            });
                        }}
                    >
                        Edit
                    </a>
                    <a>Delete</a>
                </Space>
            ),
        },
    ];
}
return <Table columns={columns} dataSource={baptismData} pagination={false} />;
