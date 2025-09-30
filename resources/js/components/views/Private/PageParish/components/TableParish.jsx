import React from "react";
import { Table, Button, Space, Popconfirm } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderArrowDown, faPenToSquare } from "@fortawesome/pro-regular-svg-icons";

const TableParish = ({ data, setTableFilter, handleSettings }) => {
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
        <Popconfirm title="Do you want to restore?">
          <Button
            type="link"
            className="custom-popconfirm-btn"
            onClick={() => handleSettings("restore", record)}
            icon={<FontAwesomeIcon icon={faPenToSquare} />}
          />
        </Popconfirm>
      );
    } else {
      return (
        <>
          <Popconfirm title="Are you sure you want to archive this item?">
            <Button
              type="link"
              className="custom-popconfirm-btn"
              onConfirm={() => handleSettings("archive", record)}
            >
              <FontAwesomeIcon icon={faFolderArrowDown} />
            </Button>
          </Popconfirm>
          <Popconfirm title="Do you want to edit this item? Changes will be saved automatically.">
            <Button
              type="link"
              className="custom-popconfirm-btn"
              onClick={() => handleSettings("edit", record)}
            >
              <FontAwesomeIcon icon={faPenToSquare} />
            </Button>
          </Popconfirm>
        </>
      );
    }
  };

  return (
    <Table
      id="tbl_parish"
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
        align="left"
        width={150}
        render={(_, record) => (
          <Space size="middle">{renderActions(record)}</Space>
        )}
      />
      <Table.Column
        title="Church"
        dataIndex="church"
        key="church"
        sorter={(a, b) => a.church.localeCompare(b.church)}
        sortDirections={["ascend", "descend"]}
        width={150}
      />
    </Table>
  );
};

export default TableParish;
