import React from "react";
import { Table } from "antd";

const TableHistoricalData = ({ data, setTableFilter }) => {
  const onChangeTable = (pagination, filters, sorter) => {
    setTableFilter?.((prev) => ({
      ...prev,
      sort_field: sorter.columnKey,
      sort_order: sorter.order ? sorter.order.replace("end", "") : null,
      page: 1,
      page_size: "50",
    }));
  };

  return (
    <Table
      id="tbl_historical_data"
      className="ant-table-default ant-table-striped"
      dataSource={data}
      rowKey={(record) => record.id}
      pagination={false}
      bordered={false}
      size="middle"
      onChange={onChangeTable}
      scroll={{ x: "max-content" }}
    >
      <Table.Column
        title="Time Stamp"
        dataIndex="time_stamp"
        key="time_stamp"
        sorter={(a, b) => new Date(a.time_stamp) - new Date(b.time_stamp)}
        sortDirections={["ascend", "descend"]}
        width={180}
      />
      <Table.Column
        title="Edited By"
        dataIndex="edited_by"
        key="edited_by"
        sorter={(a, b) => a.edited_by.localeCompare(b.edited_by)}
        sortDirections={["ascend", "descend"]}
        width={180}
      />
      <Table.Column
        title="Subject Updated"
        dataIndex="subject_updated"
        key="subject_updated"
        sorter={(a, b) => a.subject_updated.localeCompare(b.subject_updated)}
        sortDirections={["ascend", "descend"]}
        width={180}
      />
      <Table.Column
        title="Field"
        dataIndex="field"
        key="field"
        sorter={(a, b) => a.field.localeCompare(b.field)}
        sortDirections={["ascend", "descend"]}
        width={150}
      />
      <Table.Column
        title="Old Value"
        dataIndex="old_value"
        key="old_value"
        sorter={(a, b) => a.old_value.localeCompare(b.old_value)}
        sortDirections={["ascend", "descend"]}
        width={200}
      />
      <Table.Column
        title="New Value"
        dataIndex="new_value"
        key="new_value"
        sorter={(a, b) => a.new_value.localeCompare(b.new_value)}
        sortDirections={["ascend", "descend"]}
        width={200}
      />
    </Table>
  );
};

export default TableHistoricalData;
