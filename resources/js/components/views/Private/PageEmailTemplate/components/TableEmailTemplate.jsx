import React, { useContext } from "react";
import { Table, Card, Flex, Button } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/pro-regular-svg-icons";
import PageEmailContext from "./PageEmailContext";

const TableEmailTemplate = () => {
  const { setToggleModalForm } = useContext(PageEmailContext); // Access context

  // Sample data
  const dataSource = {
    subject: "First Template", // Correct Subject
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", // Correct Body
  };

  const columns = [
    {
      title: "Field",
      dataIndex: "field",
      key: "field",
      width: "20%",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
    },
  ];

  // Convert object into a format suitable for Ant Design Table
  const tableData = [
    {
      key: "1",
      field: "SUBJECT",
      value: dataSource.subject, // Display Subject
    },
    {
      key: "2",
      field: "BODY",
      value: dataSource.body, // Display Body
    },
  ];

  return (
    <Card
      type="inner"
      title={
        <Flex justify="end">
          <Button
            type="link"
            icon={<FontAwesomeIcon icon={faEdit} />}
            onClick={() =>
              setToggleModalForm({
                open: true,
                data: dataSource, // Send correct Subject and Body
              })
            }
            style={{ fontSize: "16px" }}
          />
        </Flex>
      }
    >
      <Table
        dataSource={tableData}
        columns={columns}
        pagination={false}
        bordered
        showHeader={false} // Show headers now for clarity
      />
    </Card>
  );
};

export default TableEmailTemplate;
