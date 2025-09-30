import { useState } from "react";
import { Card, Button, Table, Space, Popconfirm, Select, DatePicker } from "antd";
import { PrinterOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import PageReportContext from "./PageReportContext";

const { RangePicker } = DatePicker;
const { Option } = Select;

const REPORT_DATA = [
    { id: "header-1", item: "Land Area (sq. meters)", isHeader: true },
    { id: 1, item: "Land Area (sq. meters)", figure: "10,500" },
    { id: 2, item: "Zones", figure: "5" },
    { id: 3, item: "BECs (Basic Ecclesial Communities)", figure: "12" },
    { id: 4, item: "Chapels", figure: "4" },
    { id: 5, item: "Family Groupings", figure: "8" },
    { id: 6, item: "Households", figure: "350" },

    { id: "header-2", item: "Population", isHeader: true },
    { id: 7, item: "Total Population", figure: "15,000" },
    { id: 8, item: "Catholics", figure: "10,500" },
    { id: 9, item: "Non-Catholic Christian Denominations", figure: "2,500" },
    { id: 10, item: "Other Religions (Muslims, Buddhists, etc.)", figure: "800" },

    { id: "header-3", item: "Finances", isHeader: true },
    { id: 11, item: "Total Collections", figure: "₱2,500,000" },
    { id: 12, item: "Total Expenses", figure: "₱1,800,000" },
    { id: 13, item: "Total Surplus (Deficit)", figure: "₱700,000" },
    { id: 14, item: "Outstanding Parish Liability", figure: "₱500,000" },
    { id: 15, item: "Outstanding Parish Fund", figure: "₱1,200,000" }
];

export default function TabItemReportAll() {
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
                    scroll={{ y: 400, x: "max-content" }}
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
                        title="Items"
                        key="item"
                        dataIndex="item"
                        render={(text, record) =>
                            record.isHeader ? (
                                <strong style={{ fontSize: "16px" }}>{text.toUpperCase()}</strong>
                            ) : (
                                text
                            )
                        }
                        sorter
                        width={180}
                    />
                    <Table.Column
                        title="Figures"
                        key="figure"
                        dataIndex="figure"
                        sorter
                        width={150}
                        render={(text, record) => (record.isHeader ? null : text)}
                    />
                </Table>
            </Card>
        </PageReportContext.Provider>
    );
}
