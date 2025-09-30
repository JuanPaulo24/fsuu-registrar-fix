import { useState } from "react";
import {
  Card,
  Table,
  Input,
  Row,
  Col,
  Pagination,
  Select,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/pro-solid-svg-icons";

export default function HistoricalDataTable() {
  const [pageSize, setPageSize] = useState(50);
  const [activeData, setActiveData] = useState([
    {
      id: 1,
      timestamp: "2025-03-23 10:00 AM",
      edited_by: "John",
      subject_updated: "User Account",
      full_name: "Michael",
      field: "Email",
      old_value: "michael@gmail.com",
      new_value: "m.scott@gmail.com",
    },
    {
      id: 2,
      timestamp: "2025-03-23 10:15 AM",
      edited_by: "Jane",
      subject_updated: "Billing Info",
      full_name: "Pam",
      field: "Address",
      old_value: "123 Elm St",
      new_value: "456 Oak Ave",
    },
    {
      id: 3,
      timestamp: "2025-03-23 10:30 AM",
      edited_by: "Alice",
      subject_updated: "Subscription Plan",
      full_name: "Jim Halpert",
      field: "Status",
      old_value: "Inactive",
      new_value: "Active",
    },
    {
      id: 4,
      timestamp: "2025-03-23 10:45 AM",
      edited_by: "Robert",
      subject_updated: "User Settings",
      full_name: "Dwight",
      field: "Phone Number",
      old_value: "555-1234",
      new_value: "555-5678",
    },
    // Add more records as needed...
  ]);

  const columns = [
    {
      title: "Time Stamp",
      dataIndex: "timestamp",
      width: 180,
    },
    {
      title: "Edited By",
      dataIndex: "edited_by",
      width: 150,
    },
    {
      title: "Subject Updated",
      dataIndex: "subject_updated",
      width: 200,
    },
    {
      title: "Full Name",
      dataIndex: "full_name",
      width: 200,
    },
    {
      title: "Field",
      dataIndex: "field",
      width: 150,
    },
    {
      title: "Old Value",
      dataIndex: "old_value",
      width: 150,
    },
    {
      title: "New Value",
      dataIndex: "new_value",
      width: 150,
    },
  ];

  return (
    <Card
      style={{
        borderRadius: "16px",
        boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.08)",
        padding: "24px",
      }}
    >
      {/* Top Section */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          {/* Search Input */}
          <Input
            placeholder="Search..."
            prefix={<FontAwesomeIcon icon={faMagnifyingGlass} />}
            style={{
              width: 240,
              borderRadius: "20px",
              height: "36px",
            }}
          />
        </Col>

        <Col style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Select Page Size */}
          <Select
            defaultValue={pageSize.toString()}
            onChange={(value) => setPageSize(parseInt(value))}
            style={{
              width: 120,
              borderRadius: "20px",
            }}
            options={[
              { value: "10", label: "10 / Page" },
              { value: "25", label: "25 / Page" },
              { value: "50", label: "50 / Page" },
            ]}
          />
        </Col>
      </Row>

      {/* Top Pagination and Results */}
      <Row justify="end" align="middle" style={{ marginBottom: 12 }}>
        <Col style={{ fontWeight: "500" }}>
          Results 1 to {activeData.length} records
        </Col>
        <Col>
          <Pagination
            simple
            defaultCurrent={1}
            total={activeData.length}
            pageSize={pageSize}
            style={{ marginLeft: 16 }}
          />
        </Col>
      </Row>

      {/* Table */}
      <Table
        dataSource={activeData}
        columns={columns}
        rowKey="id"
        pagination={false}
        bordered={false}
        scroll={{ x: "max-content" }}
        style={{
          borderRadius: "12px",
          overflow: "hidden",
        }}
        locale={{
          emptyText: (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              No data
            </div>
          ),
        }}
      />

      {/* Bottom Pagination and Results */}
      <Row justify="end" align="middle" style={{ marginTop: 12 }}>
        <Col style={{ fontWeight: "500" }}>
          Results 1 to {activeData.length} records
        </Col>
        <Col>
          <Pagination
            simple
            defaultCurrent={1}
            total={activeData.length}
            pageSize={pageSize}
            style={{ marginLeft: 16 }}
          />
        </Col>
      </Row>
    </Card>
  );
}
