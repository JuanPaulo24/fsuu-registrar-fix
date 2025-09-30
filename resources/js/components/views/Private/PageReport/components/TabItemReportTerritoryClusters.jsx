import { useState } from "react";
import { Card, Button, Table, Space, Popconfirm, Select, DatePicker } from "antd";
import { PrinterOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import PageReportContext from "./PageReportContext";

const { RangePicker } = DatePicker;
const { Option } = Select;

const REPORT_DATA = [
    { id: 1, clusterName: "St. Joseph Cluster",
        landArea: "17,405",
        zones: 8,
        BECs: 8,
        chapels: 6,
        familyGroupings: 11,
        households: 486
    },
    { id: 2, clusterName: "Sacred Heart Cluster", landArea: "17,192", zones: 5, BECs: 9, chapels: 3, familyGroupings: 11, households: 382 },
    { id: 3, clusterName: "Holy Cross Cluster", landArea: "16,155", zones: 8, BECs: 7, chapels: 2, familyGroupings: 7, households: 559 },
    { id: 4, clusterName: "St. Michael Cluster", landArea: "14,645", zones: 8, BECs: 11, chapels: 7, familyGroupings: 6, households: 359 },
    { id: 5, clusterName: "Our Lady Cluster", landArea: "12,894", zones: 4, BECs: 14, chapels: 4, familyGroupings: 11, households: 393 },
    { id: 6, clusterName: "St. Paul Cluster", landArea: "15,678", zones: 6, BECs: 12, chapels: 5, familyGroupings: 9, households: 420 },
    { id: 7, clusterName: "Divine Mercy Cluster", landArea: "18,245", zones: 7, BECs: 15, chapels: 6, familyGroupings: 15, households: 510 },
    { id: 8, clusterName: "San Lorenzo Cluster", landArea: "10,780", zones: 3, BECs: 8, chapels: 3, familyGroupings: 5, households: 290 },
    { id: 9, clusterName: "Christ the King Cluster", landArea: "19,320", zones: 8, BECs: 18, chapels: 7, familyGroupings: 12, households: 550 },
    { id: 10, clusterName: "Immaculate Conception Cluster", landArea: "13,690", zones: 5, BECs: 10, chapels: 4, familyGroupings: 8, households: 400 },
    { id: 11, clusterName: "San Pedro Cluster", landArea: "11,210", zones: 4, BECs: 7, chapels: 3, familyGroupings: 6, households: 350 },
    { id: 12, clusterName: "Our Lady of Fatima Cluster", landArea: "14,890", zones: 6, BECs: 13, chapels: 5, familyGroupings: 9, households: 480 }
];


export default function TabItemReportFinances() {
    const [toggleModalForm, setToggleModalForm] = useState({ open: false, data: null });

    const handlePrint = () => {
        window.print();
    };

    return (
        <PageReportContext.Provider value={{ toggleModalForm, setToggleModalForm }}>
            <Card>
                <div className="float-wrapper">

                    <RangePicker style={{width: 400, marginRight: 20}}/>

                    <Select
                        placeholder="Select an Option"
                        style={{ width: 250, marginRight: 20 }}
                    >
                        <Option value="1">Land Area</Option>
                        <Option value="2">Zones</Option>
                        <Option value="3">Chapels</Option>
                        <Option value="4">BECs</Option>
                        <Option value="5">Family Groupings</Option>
                        <Option value="6">Households</Option>
                    </Select>

                    <Button
                        type="primary"
                        onClick={handlePrint}
                        icon={<PrinterOutlined />}
                    >
                        Print
                    </Button>
                </div>
                <Table
                    className="ant-table-default ant-table-striped"
                    dataSource={REPORT_DATA}
                    rowKey={(record) => record.id}
                    pagination={false}
                    bordered={false}
                    scroll={{ x: "max-content" }}
                    sticky
                >
                    {/* <Table.Column
                        title="Action"
                        key="action"
                        dataIndex="action"
                        align="center"
                        render={(text, record) =>
                            !record.isHeader ? (
                                <Space size="middle">
                                    <Button
                                        type="link"
                                        onClick={() => alert(`Edit ${record.item}`)}
                                        icon={<EditOutlined />}
                                    />
                                    <Popconfirm
                                        title="Are you sure to delete this data?"
                                        onConfirm={() => alert(`Deleted ${record.item}`)}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button type="link" danger icon={<DeleteOutlined />} />
                                    </Popconfirm>
                                </Space>
                            ) : null
                        }
                        width={150}
                    /> */}
                    <Table.Column
                        title="Cluster Name"
                        key="clusterName"
                        dataIndex="clusterName"
                        sorter
                        width={220}
                    />
                    <Table.Column
                        title="Land Area (sq. meters)"
                        key="landArea"
                        dataIndex="landArea"
                        sorter
                        width={220}
                        render={(text, record) => (record.isHeader ? null : text)}
                    />
                    <Table.Column
                        title="Zones"
                        key="zones"
                        dataIndex="zones"
                        sorter
                        width={150}
                        render={(text, record) => (record.isHeader ? null : text)}
                    />
                    <Table.Column
                        title="BECs"
                        key="BECs"
                        dataIndex="BECs"
                        sorter
                        width={150}
                        render={(text, record) => (record.isHeader ? null : text)}
                    />
                    <Table.Column
                        title="Chapels"
                        key="chapels"
                        dataIndex="chapels"
                        sorter
                        width={150}
                        render={(text, record) => (record.isHeader ? null : text)}
                    />
                    <Table.Column
                        title="Family Groupings"
                        key="familyGroupings"
                        dataIndex="familyGroupings"
                        sorter
                        width={180}
                        render={(text, record) => (record.isHeader ? null : text)}
                    />
                    <Table.Column
                        title="Households"
                        key="households"
                        dataIndex="households"
                        sorter
                        width={150}
                        render={(text, record) => (record.isHeader ? null : text)}
                    />

                </Table>
            </Card>
        </PageReportContext.Provider>
    );
}
