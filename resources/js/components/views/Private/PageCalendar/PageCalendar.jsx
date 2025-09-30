import React, { useState } from "react";
import { Card, Row, Col, Flex, Button, Typography, Space } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faList,
  faCalendar,
  faCheck,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/pro-regular-svg-icons";
import CalendarFilter from "./components/CalendarFilter";
import CalendarContent from "./components/CalendarContent";
import ListViewContent from "./components/ListViewContent";
import CompletedContent from "./components/CompletedContent";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const PageCalendar = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [activeView, setActiveView] = useState("calendar"); // Default active view

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setCurrentDate(currentDate.subtract(1, "month"));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setCurrentDate(currentDate.add(1, "month"));
  };

  const handleToday = () => {
    setCurrentDate(dayjs());
  };

  return (
    <Card id="PageCalendar" className="p-6">
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div className="module-header">
          <Title level={3} className="module-title">
            Calendar Management
          </Title>
          <Text type="secondary" className="module-description">
            Schedule and manage academic events, activities, and deadlines
          </Text>
        </div>
        
        <Row gutter={[20, 20]}>
        {/* Filter Sidebar */}
        <Col xs={24} sm={6} md={6} lg={6}>
          <CalendarFilter />
        </Col>

        {/* Right Section */}
        <Col xs={24} sm={18} md={18} lg={18}>
          {/* View Switcher */}
          <Flex justify="start" align="center" className="gap-6 mb-2">
            <Button
              type="text"
              className={`shadow-none border-none flex items-center gap-2 font-semibold ${
                activeView === "calendar"
                  ? "bg-[var(--color-primary)] text-white rounded-full px-3 py-1"
                  : "text-black"
              }`}
              onClick={() => setActiveView("calendar")}
            >
              Calendar
            </Button>
            <Button
              type="text"
              className={`shadow-none border-none flex items-center gap-2 font-semibold ${
                activeView === "list"
                  ? "bg-[var(--color-primary)] text-white rounded-full px-3 py-1"
                  : "text-black"
              }`}
              onClick={() => setActiveView("list")}
            >
              List View
            </Button>
            <Button
              type="text"
              className={`shadow-none border-none flex items-center gap-2 font-semibold ${
                activeView === "completed"
                  ? "bg-[var(--color-primary)] text-white rounded-full px-3 py-1"
                  : "text-black"
              }`}
              onClick={() => setActiveView("completed")}
            >
              Completed
            </Button>
          </Flex>

          {/* Today Button + Date Label */}
          <Flex justify="start" align="center" className="mb-4 gap-4">
            <Button
              onClick={handleToday}
              className="px-5 py-2 border border-green-700 text-green-700 rounded-full flex items-center"
            >
              <FontAwesomeIcon
                icon={faChevronLeft}
                onClick={handlePrevMonth}
                className="mr-2 cursor-pointer"
              />
              Today
              <FontAwesomeIcon
                icon={faChevronRight}
                onClick={handleNextMonth}
                className="ml-2 cursor-pointer"
              />
            </Button>

            {/* Date Label - Bold */}
            <Typography.Title
              level={3}
              className="m-0 text-center flex-1 font-bold"
            >
              {currentDate.format("MMMM YYYY")}
            </Typography.Title>
          </Flex>

          {/* Main Content */}
          {activeView === "calendar" && (
            <CalendarContent currentDate={currentDate} />
          )}
          {activeView === "list" && <ListViewContent />}
          {activeView === "completed" && <CompletedContent />}
        </Col>
        </Row>
      </Space>
    </Card>
  );
};

export default PageCalendar;
