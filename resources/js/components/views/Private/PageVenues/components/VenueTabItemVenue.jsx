import { useState } from "react";
import {
  Card,
  Button,
  Table,
  Input,
  Space,
  Row,
  Col,
  Pagination,
  Select,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInboxIn,
  faPenToSquare, 
  faInboxOut,
  faPlus,
  faMagnifyingGlass,
} from "@fortawesome/pro-regular-svg-icons";
import ModalFormAddNewVenue from "./ModalFormAddNewVenue";

export default function VenueTable() {
  const [venues, setVenues] = useState([
    {
      id: 1,
      date_of_booking: "2024-03-10",
      time_start: "10:00 AM",
      time_end: "12:00 PM",
      participants: 50,
      venue: "St. Joseph Cathedral",
      capacity: 100,
      requester: "Maria Santos (Wedding)",
    },
    {
      id: 2,
      date_of_booking: "2024-03-12",
      time_start: "02:00 PM",
      time_end: "04:00 PM",
      participants: 30,
      venue: "Our Lady of Lourdes Parish",
      capacity: 80,
      requester: "Carlos Dela Cruz (Baptism)",
    },
    {
      id: 3,
      date_of_booking: "2024-03-15",
      time_start: "09:00 AM",
      time_end: "11:30 AM",
      participants: 70,
      venue: "Holy Trinity Church",
      capacity: 120,
      requester: "St. Anne Choir (Practice)",
    },
    {
      id: 4,
      date_of_booking: "2024-03-18",
      time_start: "01:00 PM",
      time_end: "03:30 PM",
      participants: 40,
      venue: "Sacred Heart Parish",
      capacity: 90,
      requester: "Rev. Fr. Andres Lopez (Mass)",
    },
    {
      id: 5,
      date_of_booking: "2024-03-20",
      time_start: "06:00 PM",
      time_end: "08:00 PM",
      participants: 100,
      venue: "St. Michael Parish",
      capacity: 150,
      requester: "Youth Ministry (Fellowship)",
    },
    {
      id: 6,
      date_of_booking: "2024-03-25",
      time_start: "08:00 AM",
      time_end: "10:00 AM",
      participants: 60,
      venue: "St. Peter Chapel",
      capacity: 90,
      requester: "Miguel Torres (Funeral Mass)",
    },
  ]);

  const [archivedVenues, setArchivedVenues] = useState([]);
  const [visible, setVisible] = useState(false);
  const [activeView, setActiveView] = useState("active");

  const handleOpenModal = () => setVisible(true);
  const handleCloseModal = () => setVisible(false);

  const handleSubmit = (newVenue) => {
    setVenues([...venues, { id: venues.length + 1, ...newVenue }]);
    handleCloseModal();
  };

  const handleArchive = (venueId) => {
    const venueToArchive = venues.find((v) => v.id === venueId);
    if (venueToArchive) {
      setVenues(venues.filter((v) => v.id !== venueId));
      setArchivedVenues([...archivedVenues, venueToArchive]);
    }
  };

  const handleUnarchive = (venueId) => {
    const venueToUnarchive = archivedVenues.find((v) => v.id === venueId);
    if (venueToUnarchive) {
      setArchivedVenues(archivedVenues.filter((v) => v.id !== venueId));
      setVenues([...venues, venueToUnarchive]);
    }
  };

  const tableColumns = (isArchived = false) => [
    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: 100,
      render: (_, record) => (
        <Space size="middle">
          {!isArchived ? (
            <>
              <Button
                type="text"
                icon={<FontAwesomeIcon icon={faInboxIn} />}
                style={{
                  color: "#388e3c",
                  fontSize: "16px",
                }}
              />
              <Button
                type="text"
                icon={<FontAwesomeIcon icon={faPenToSquare} />}
                style={{
                  color: "#388e3c",
                  fontSize: "16px",
                }}
                onClick={() => handleArchive(record.id)}
              />
            </>
          ) : (
            <Button
              type="text"
              icon={<FontAwesomeIcon icon={faInboxOut} />}
              style={{
                color: "#388e3c",
                fontSize: "16px",
              }}
              onClick={() => handleUnarchive(record.id)}
            />
          )}
        </Space>
      ),

    },
    {
      title: "Date of Booking",
      dataIndex: "date_of_booking",
      width: 140,
    },
    {
      title: "Time Start",
      dataIndex: "time_start",
      width: 120,
    },
    {
      title: "Time End",
      dataIndex: "time_end",
      width: 120,
    },
    {
      title: "Number of Participants",
      dataIndex: "participants",
      width: 180,
    },
    {
      title: "Venue",
      dataIndex: "venue",
      width: 200,
    },
    {
      title: "Capacity",
      dataIndex: "capacity",
      width: 120,
    },
    {
      title: "Requesting Person/Organization",
      dataIndex: "requester",
      width: 250,
    },
  ];

  const currentData = activeView === "active" ? venues : archivedVenues;

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
          {activeView === "active" && (
            <Button
              type="primary"
              icon={<FontAwesomeIcon icon={faPlus} />}
              style={{
                backgroundColor: "#1b5e20",
                borderColor: "#1b5e20",
                borderRadius: "20px",
                padding: "4px 16px",
                fontSize: "14px",
                fontWeight: "500",
                height: "36px",
              }}
              onClick={handleOpenModal}
            >
              Add Venue
            </Button>
          )}
        </Col>
        <Col style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Select
            defaultValue="50"
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

      {/* Toggle Buttons */}
      <Row style={{ marginBottom: 16 }}>
        <Space size="middle">
          <Button
            type="primary"
            style={{
              backgroundColor:
                activeView === "active" ? "#7cb342" : "transparent",
              color: activeView === "active" ? "#ffffff" : "#7cb342",
              borderColor: "#7cb342",
              borderRadius: "20px",
              width: "100px",
              height: "36px",
            }}
            onClick={() => setActiveView("active")}
          >
            Active
          </Button>
          <Button
            type="default"
            style={{
              backgroundColor:
                activeView === "archived" ? "#7cb342" : "transparent",
              color: activeView === "archived" ? "#ffffff" : "#7cb342",
              borderColor: "#7cb342",
              borderRadius: "20px",
              width: "100px",
              height: "36px",
            }}
            onClick={() => setActiveView("archived")}
          >
            Archive
          </Button>
        </Space>
      </Row>

      {/* Search */}
      <Row style={{ marginBottom: 20 }}>
        <Col>
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
      </Row>

      {/* Top Pagination and Results */}
      <Row justify="end" align="middle" style={{ marginBottom: 12 }}>
        <Col style={{ fontWeight: "500" }}>
          Results 1 to {currentData.length} records
        </Col>
        <Col>
          <Pagination
            simple
            defaultCurrent={1}
            total={currentData.length}
            pageSize={10}
            style={{ marginLeft: 16 }}
          />
        </Col>
      </Row>

      {/* Table */}
      <Table
        dataSource={currentData}
        rowKey="id"
        pagination={false}
        bordered={false}
        scroll={{ x: "max-content" }}
        columns={tableColumns(activeView === "archived")}
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
          Results 1 to {currentData.length} records
        </Col>
        <Col>
          <Pagination
            simple
            defaultCurrent={1}
            total={currentData.length}
            pageSize={10}
            style={{ marginLeft: 16 }}
          />
        </Col>
      </Row>

      {/* Add Venue Modal */}
      <ModalFormAddNewVenue
        visible={visible}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </Card>
  );
}
