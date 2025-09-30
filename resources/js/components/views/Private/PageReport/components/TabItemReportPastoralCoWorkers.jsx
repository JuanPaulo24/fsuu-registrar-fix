import { useState } from "react";
import { Card, Button, Table, Space, Popconfirm, Select, DatePicker } from "antd";
import { PrinterOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import PageReportContext from "./PageReportContext";

const { RangePicker } = DatePicker;
const { Option } = Select;

const REPORT_DATA = [
    { id: "header-1", blank: "Infant Baptisms:", isHeader: true },
    { id: 1, blank: "a. 0-1 yr. old", stMichael: "22", ourLady: "32" },
    { id: 2, blank: "b. 1-7 yr. old", stMichael: "4", ourLady: "5" },
    { id: 3, blank: "Adult Baptisms (8above)", stMichael: "51", ourLady: "12" },
    { id: 4, blank: "", stMichael: "1", ourLady: "4" },
    { id: 5, blank: "", stMichael: "34", ourLady: "8" },
    { id: 6, blank: "", stMichael: "6", ourLady: "35" },

    { id: 7, blank: "", stMichael: "5", ourLady: "15" },
    { id: 8, blank: "", stMichael: "51", ourLady: "10" },
    { id: 9, blank: "", stMichael: "31", ourLady: "2" },
    { id: 10, blank: "", stMichael: "78", ourLady: "80" },
    { id: 11, blank: "", stMichael: "87", ourLady: "7" },
    { id: 12, blank: "", stMichael: "8", ourLady: "8" },
    { id: 13, blank: "", stMichael: "8", ourLady: "6" },
    { id: 14, blank: "", stMichael: "12", ourLady: "32" },
    { id: 15, blank: "", stMichael: "3", ourLady: "6" }
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
                        placeholder="Extraordinary Ministers of Communion"
                        style={{ width: 300, marginRight: 20 }}
                    >
                        <Option value="1">Extraordinary Ministers of Communion</Option>
                        <Option value="2">Lectors</Option>
                        <Option value="3">Altar Servers</Option>
                        <Option value="4">Liturgical Ushers</Option>
                    </Select>

                    {/* <Button
                        type="primary"
                        onClick={handlePrint}
                        icon={<PrinterOutlined />}
                    >
                        Print
                    </Button> */}
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
                        title=" "
                        key="blank"
                        dataIndex="blank"
                        sorter
                        width={220}
                    />
                    <Table.Column
                        title="St. Michael"
                        key="stMichael"
                        dataIndex="stMichael"
                        sorter
                        width={220}
                        render={(text, record) => (record.isHeader ? null : text)}
                    />
                    <Table.Column
                        title="Our Lady"
                        key="ourLady"
                        dataIndex="ourLady"
                        sorter
                        width={150}
                        render={(text, record) => (record.isHeader ? null : text)}
                    />
                    <Table.Column
                        title="St. Paul"
                        key="stPaul"
                        dataIndex="stPaul"
                        sorter
                        width={150}
                        render={(text, record) => (record.isHeader ? null : text)}
                    />
                    <Table.Column
                        title="Divine Mercy"
                        key="divineMercy"
                        dataIndex="divineMercy"
                        sorter
                        width={150}
                        render={(text, record) => (record.isHeader ? null : text)}
                    />
                    <Table.Column
                        title="San Lorenzo"
                        key="sanLorenzo"
                        dataIndex="sanLorenzo"
                        sorter
                        width={180}
                        render={(text, record) => (record.isHeader ? null : text)}
                    />
                    <Table.Column
                        title="Christ The King"
                        key="ChristTheKing"
                        dataIndex="ChristTheKing"
                        sorter
                        width={150}
                        render={(text, record) => (record.isHeader ? null : text)}
                    />
                    <Table.Column
                        title="Immaculate Conception"
                        key="immaculateConception"
                        dataIndex="immaculateConception"
                        sorter
                        width={220}
                        render={(text, record) => (record.isHeader ? null : text)}
                    />
                    <Table.Column
                        title="San Pedro"
                        key="sanPedro"
                        dataIndex="sanPedro"
                        sorter
                        width={220}
                        render={(text, record) => (record.isHeader ? null : text)}
                    />
                    <Table.Column
                        title="Our Lady of Fatima"
                        key="ladyFatima"
                        dataIndex="ladyFatima"
                        sorter
                        width={220}
                        render={(text, record) => (record.isHeader ? null : text)}
                    />

                </Table>
            </Card>
        </PageReportContext.Provider>
    );
}
