import { useEffect, useState } from "react";
import { Row, Button, Col, Flex, Card } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-regular-svg-icons";

import { GET } from "../../../../../providers/useAxiosQuery";
import TableDonations from "../components/TableDonations";
import ModalFormAddDonation from "../components/ModalFormAddDonation";
import PageDonationsData from "../components/PageDonationsData.json";

import {
  TableGlobalSearchAnimated,
  TablePageSize,
  TablePagination,
  TableShowingEntriesV2,
  useTableScrollOnTop,
} from "../../../../../providers/CustomTableFilter";

export default function TabItemDonations({ activeStatus, setActiveStatus }) {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [toggleModalModule, setToggleModalModule] = useState({
    open: false,
    data: null,
  });

  const [tableFilter, setTableFilter] = useState({
    page: 1,
    page_size: 10,
    search: "",
    sort_field: "created_at",
    sort_order: "desc",
    status: [activeStatus],
    from: "donations",
  });

  // 🔁 Update status in tableFilter whenever activeStatus changes
  useEffect(() => {
    setTableFilter((prev) => ({
      ...prev,
      status: [activeStatus],
      page: 1,
    }));
  }, [activeStatus]);

  const { data: apiData, refetch: refetchSource } = GET(
    `api/donations?${new URLSearchParams(tableFilter)}`,
    "donations_active_list"
  );

  useEffect(() => {
    refetchSource();
  }, [tableFilter]);

  useTableScrollOnTop("tbl_user");

  const filteredDataSource = (apiData?.data || PageDonationsData)
    .filter((item) => item.status === activeStatus)
    .filter((item) =>
      item.referenceNo.toLowerCase().includes(tableFilter.search.toLowerCase())
    );

  const paginatedData = filteredDataSource.slice(
    (tableFilter.page - 1) * tableFilter.page_size,
    tableFilter.page * tableFilter.page_size
  );

  const handleStatusChange = (status) => {
    setActiveStatus(status); // Passed down from parent
  };

  const handleSearchChange = (search) => {
    setTableFilter((prev) => ({
      ...prev,
      search,
      page: 1,
    }));
  };

  return (
    <Card id="PageDonations">
      <Row gutter={[20, 20]} id="tbl_wrapper">
        <Col xs={24}>
          <Button
            type="primary"
            icon={<FontAwesomeIcon icon={faPlus} />}
            onClick={() =>
              setToggleModalModule({
                open: true,
                data: null,
              })
            }
            name="btn_add"
          >
            Add Donation
          </Button>
        </Col>

        {/* Status Buttons & Page Size */}
        <Col xs={24}>
          <Flex justify="space-between" align="center">
            <Flex gap={10}>
              <Button
                type={activeStatus === "Active" ? "secondary" : "default"}
                onClick={() => handleStatusChange("Active")}
              >
                Active
              </Button>
              <Button
                type={activeStatus === "Archive" ? "secondary" : "default"}
                onClick={() => handleStatusChange("Archive")}
              >
                Archive
              </Button>
            </Flex>

            <TablePageSize tableFilter={tableFilter} setTableFilter={setTableFilter} />
          </Flex>
        </Col>

        {/* Search & Pagination */}
        <Col xs={24}>
          <Flex justify="space-between" align="center" className="tbl-top-filter">
            <TableGlobalSearchAnimated
              tableFilter={tableFilter}
              setTableFilter={setTableFilter}
              onSearchChange={handleSearchChange}
            />
            <Flex align="center">
              <div>
              <strong>Results</strong> {(tableFilter.page - 1) * tableFilter.page_size + 1} to{" "}
                            
              {filteredDataSource.length} records
              </div>
              <TablePagination
                tableFilter={tableFilter}
                setTableFilter={setTableFilter}
                total={filteredDataSource.length}
                showLessItems
                showSizeChanger={false}
                tblIdWrapper="tbl_wrapper"
              />
            </Flex>
          </Flex>
        </Col>

        {/* Table Content */}
        <Col xs={24}>
          <TableDonations
            dataSource={paginatedData}
            tableFilter={tableFilter}
            setTableFilter={setTableFilter}
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
            status={activeStatus}
          />
        </Col>

        {/* Pagination Bottom */}
        <Col xs={24}>
          <Flex justify="space-between" align="center" className="tbl-bottom-filter">
            <div />
            <Flex align="center">
              <div>
                  <strong>Results</strong> {(tableFilter.page - 1) * tableFilter.page_size + 1} to{" "}
                  {Math.min(tableFilter.page * tableFilter.page_size, filteredDataSource.length)} of{" "}
                  {filteredDataSource.length} records
              </div>
              <TablePagination
                tableFilter={tableFilter}
                setTableFilter={setTableFilter}
                total={filteredDataSource.length}
                showLessItems
                showSizeChanger={false}
                tblIdWrapper="tbl_wrapper"
              />
            </Flex>
          </Flex>
        </Col>

        {/* Modal */}
        <ModalFormAddDonation
          toggleModalModule={toggleModalModule}
          setToggleModalModule={setToggleModalModule}
          systemId={tableFilter.system_id}
        />
      </Row>
    </Card>
  );
}