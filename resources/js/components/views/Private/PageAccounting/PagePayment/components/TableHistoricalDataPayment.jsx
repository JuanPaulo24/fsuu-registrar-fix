import React from "react";
import { Table } from "antd";
import dayjs from "dayjs";


export default function TableHistoricalDataPayment({ data, setTableFilter }) {
  // Optional: table change handler if you need to update sorting/pagination state
  const onChangeTable = (pagination, filters, sorter) => {
    if (!setTableFilter) return;
    setTableFilter((prev) => ({
      ...prev,
      sort_field: sorter.columnKey,
      sort_order: sorter.order ? sorter.order.replace("end", "") : null,
      page: 1,
      page_size: 10,
    }));
  };

  return (
    <Table
      id="tbl_historical_payment"
      className="ant-table-default ant-table-striped"
      dataSource={data}
      rowKey={(record) => record.id}
      pagination={false}
      bordered={false}
      onChange={onChangeTable}
      scroll={{ x: "max-content" }}
    >
      <Table.Column
        title="Time Stamp"
        dataIndex="timeStamp"
        key="timeStamp"
        sorter={true}
        width={180}
        // Example: parse & format if your timeStamp is a valid date
        render={(text) =>
          text ? dayjs(text).format("YYYY-MM-DD hh:mm A") : ""
        }
      />
      <Table.Column
        title="Edited By"
        dataIndex="editedBy"
        key="editedBy"
        sorter={true}
        width={120}
      />
      <Table.Column
        title="Subject Updated"
        dataIndex="subjectUpdated"
        key="subjectUpdated"
        sorter={true}
        width={160}
      />
      <Table.Column
        title="Full Name"
        dataIndex="fullName"
        key="fullName"
        sorter={true}
        width={180}
      />
      <Table.Column
        title="Field"
        dataIndex="field"
        key="field"
        sorter={true}
        width={180}
      />
      <Table.Column
        title="Old Value"
        dataIndex="oldValue"
        key="oldValue"
        sorter={true}
        width={160}
      />
      <Table.Column
        title="New Value"
        dataIndex="newValue"
        key="newValue"
        sorter={true}
        width={160}
      />
    </Table>
  );
}
