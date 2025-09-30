import React from "react";
import { Table, Button, Space, Popconfirm } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faNewspaper,
  faUserPen,
} from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";

const TablePayment = ({ data, setTableFilter, handleSettings }) => {
  const onChangeTable = (pagination, filters, sorter) => {
    setTableFilter((prev) => ({
      ...prev,
      sort_field: sorter.columnKey,
      sort_order: sorter.order ? sorter.order.replace("end", "") : null,
      page: 1,
      page_size: "50",
    }));
  };

  const archivedStatuses = ["Archived", "Cancelled", "Expired"];

  const renderActions = (record) => {
    if (archivedStatuses.includes(record.status)) {
      return (
        <Popconfirm
        title="Restore?"
        onClick={() => handleSettings("restore", record)}
        >
        <Button
          type="link"
          className="custom-popconfirm-btn"
          icon={<FontAwesomeIcon icon={faUserPen} />}
        />
        </Popconfirm>
      );
    } else {
      return (
        <>
          <Popconfirm
            title="Confirm archive?"
            onConfirm={() => handleSettings("archive", record)}
          >
            <Button 
            type="link"
            className="custom-popconfirm-btn" 
            icon={<FontAwesomeIcon icon={faNewspaper} />} />
          </Popconfirm>
          
        </>
      );
    }
  };

  return (
    <Table
      id="tbl_payment"
      className="ant-table-default ant-table-striped"
      dataSource={data}
      rowKey={(record) => record.id}
      pagination={false}
      bordered={false}
      onChange={onChangeTable}
      scroll={{ x: "max-content" }}
    >
    <Table.Column
        title="Actions"
        key="action"
        dataIndex="action"
        align="center"
        width={150}
        render={(_, record) => (
          <Space size="middle">{renderActions(record)}</Space>
        )}
      />
      <Table.Column
        title="Reference No."
        dataIndex="referenceNo"
        key="referenceNo"
        sorter={true}
        width={150}
      />
      <Table.Column
        title="Date"
        dataIndex="date"
        key="date"
        sorter={true}
        width={130}
        render={(text) => (text ? dayjs(text).format("YYYY-MM-DD") : "")}
      />
      <Table.Column
        title="Services"
        dataIndex="services"
        key="services"
        sorter={true}
        width={200}
      />
      <Table.Column
        title="Record From"
        dataIndex="recordFrom"
        key="recordFrom"
        sorter={true}
        width={200}
      />
      <Table.Column
        title="Form of Payment"
        dataIndex="formOfPayment"
        key="formOfPayment"
        sorter={true}
        width={150}
      />
      <Table.Column
        title="Total Amount"
        dataIndex="totalAmount"
        key="totalAmount"
        sorter={true}
        width={140}
      />
      
      
    </Table>
  );
};

export default TablePayment;
