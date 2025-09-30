import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Row, Button, Col, Card } from "antd";
import { Flex } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-regular-svg-icons";
import { GET } from "../../../../../providers/useAxiosQuery";
import {
  TableGlobalSearchAnimated,
  TablePageSize,
  TablePagination,
  TableShowingEntriesV2,
  useTableScrollOnTop,
} from "../../../../../providers/CustomTableFilter";
import TablePayment from "./TablePayment";
import DataPayment from "./DataPayment.json";
import ModalFormPayment from "./ModalFormPayment";
import TableHistoricalDataPayment from "./TableHistoricalDataPayment";
import DataHistoricalPayment from "./DataHistoricalPayment.json";

export default function PagePaymentContent({ tabActive }) {
  const location = useLocation();

  // Two separate filter states for Payment and Historical tabs
  const defaultFilter = {
    page: 1,
    page_size: 10,
    search: "",
    sort_field: "date",
    sort_order: "desc",
    from: location.pathname,
  };

  const [tableFilterPayment, setTableFilterPayment] = useState({ ...defaultFilter });
  const [tableFilterHistorical, setTableFilterHistorical] = useState({ ...defaultFilter });

  // Active sub-tab for Payment (active vs. archive)
  const [activeTab, setActiveTab] = useState("active");

  // Determine which tab we're on
  const isHistorical = tabActive === "Historical Data";
  const tableFilter = isHistorical ? tableFilterHistorical : tableFilterPayment;
  const setTableFilter = isHistorical ? setTableFilterHistorical : setTableFilterPayment;

  // When switching Payment sub-tabs, reset Payment page
  useEffect(() => {
    if (!isHistorical) {
      setTableFilterPayment(prev => ({ ...prev, page: 1 }));
    }
  }, [activeTab, isHistorical]);

  // When switching tabs, reset the search and page for the corresponding filter state
  useEffect(() => {
    if (tabActive === "Historical Data") {
      setTableFilterHistorical({ ...defaultFilter });
    } else if (tabActive === "Payment") {
      setTableFilterPayment({ ...defaultFilter });
    }
  }, [tabActive, location.pathname]); // reset on tab switch or location change

  // Example fetch using current filter state
  const { data: apiData, refetch: refetchSource } = GET(
    `api/payments?${new URLSearchParams(tableFilter)}`,
    "payments_active_list"
  );

  // Choose which data source to use
  const baseData = isHistorical ? DataHistoricalPayment : DataPayment;

  // Filter data based on search and, if applicable, status (active vs. archive)
  const filteredData = baseData.filter((item) => {
    let statusMatch = true;
    if (!isHistorical) {
      if (activeTab === "active") {
        statusMatch = item.status !== "Archived";
      } else if (activeTab === "archive") {
        statusMatch = item.status === "Archived";
      }
    }
    const matchesSearch = tableFilter.search
      ? isHistorical
        ? (
            (item.timeStamp && item.timeStamp.toLowerCase().includes(tableFilter.search.toLowerCase())) ||
            (item.editedBy && item.editedBy.toLowerCase().includes(tableFilter.search.toLowerCase())) ||
            (item.subjectUpdated && item.subjectUpdated.toLowerCase().includes(tableFilter.search.toLowerCase())) ||
            (item.fullName && item.fullName.toLowerCase().includes(tableFilter.search.toLowerCase())) ||
            (item.field && item.field.toLowerCase().includes(tableFilter.search.toLowerCase())) ||
            (item.oldValue && item.oldValue.toLowerCase().includes(tableFilter.search.toLowerCase())) ||
            (item.newValue && item.newValue.toLowerCase().includes(tableFilter.search.toLowerCase()))
          )
        : (
            (item.referenceNo && item.referenceNo.toLowerCase().includes(tableFilter.search.toLowerCase())) ||
            (item.services && item.services.toLowerCase().includes(tableFilter.search.toLowerCase())) ||
            (item.recordFrom && item.recordFrom.toLowerCase().includes(tableFilter.search.toLowerCase()))
          )
      : true;

    return statusMatch && matchesSearch;
  });

  // Pagination: slice the filtered data
  const start = (tableFilter.page - 1) * tableFilter.page_size;
  const end = start + tableFilter.page_size;
  const slicedData = filteredData.slice(start, end);

  const dataSource = apiData && apiData.data
    ? apiData
    : {
        data: {
          total: filteredData.length,
          payments: slicedData,
        },
      };

  useEffect(() => {
    refetchSource();
  }, [tableFilter, refetchSource]);

  useTableScrollOnTop("tbl_wrapper", location);

  const [isModalOpen, setModalOpen] = useState(false);
  const handleSettings = (action, record) => {
    if (action === "edit") {
      console.log("Editing record", record);
    }
  };

  return (
    <Card id="PagePayment">
      <Row gutter={[20, 20]} id="tbl_wrapper">
        {/* Payment Tab Content */}
        {tabActive !== "Historical Data" && (
          <>
            <Col xs={24} sm={24} md={24} lg={24}>
              <Button
                type="primary"
                onClick={() => setModalOpen(true)}
                icon={<FontAwesomeIcon icon={faPlus} />}
              >
                Add Payment
              </Button>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24}>
              <Flex justify="space-between" align="center">
                <Flex justify="start" align="center" gap={10}>
                  <Button
                    className={activeTab === "active" ? "active" : ""}
                    type={activeTab === "active" ? "secondary" : "default"}
                    onClick={() => setActiveTab("active")}
                  >
                    Active
                  </Button>
                  <Button
                    className={activeTab === "archive" ? "active" : ""}
                    type={activeTab === "archive" ? "secondary" : "default"}
                    onClick={() => setActiveTab("archive")}
                  >
                    Archive
                  </Button>
                </Flex>
                <Flex align="center">
                  <TablePageSize tableFilter={tableFilter} setTableFilter={setTableFilter} />
                </Flex>
              </Flex>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24}>
              <Flex justify="space-between" align="center" className="tbl-top-filter">
                <TableGlobalSearchAnimated
                  tableFilter={tableFilter}
                  setTableFilter={setTableFilter}
                  placeholder="Search by name"
                />
                <Flex align="center" gap={10}>
                  <TableShowingEntriesV2 />
                  <TablePagination
                    tableFilter={tableFilter}
                    setTableFilter={setTableFilter}
                    total={dataSource?.data?.total || 0}
                    showLessItems={true}
                    showSizeChanger={false}
                    tblIdWrapper="tbl_wrapper"
                  />
                </Flex>
              </Flex>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24}>
              <TablePayment
                data={dataSource?.data?.payments || []}
                handleSettings={handleSettings}
              />
            </Col>
            <Col xs={24} sm={24} md={24} lg={24}>
              <Flex justify="space-between" align="center" className="tbl-bottom-filter">
                <div />
                <Flex align="center">
                  <TableShowingEntriesV2 />
                  <TablePagination
                    tableFilter={tableFilter}
                    setTableFilter={setTableFilter}
                    total={dataSource?.data?.total || 0}
                    showLessItems={true}
                    showSizeChanger={false}
                    tblIdWrapper="tbl_wrapper"
                  />
                </Flex>
              </Flex>
            </Col>
          </>
        )}

        {/* Historical Data Tab Content */}
        {tabActive === "Historical Data" && (
          <>
            <Col xs={24} sm={24} md={24} lg={24}>
              <Flex justify="space-between" align="center" className="tbl-top-filter">
                <TableGlobalSearchAnimated
                  tableFilter={tableFilter}
                  setTableFilter={setTableFilter}
                  placeholder="Search by name"
                />
                <Flex align="center">
                  <TablePageSize tableFilter={tableFilter} setTableFilter={setTableFilter} />
                </Flex>
              </Flex>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24}>
              <Flex justify="space-between" align="center" className="tbl-bottom-filter">
                <div />
                <Flex align="center" gap={10}>
                  <TableShowingEntriesV2 />
                  <TablePagination
                    tableFilter={tableFilter}
                    setTableFilter={setTableFilter}
                    total={dataSource?.data?.total || 0}
                    showLessItems={true}
                    showSizeChanger={false}
                    tblIdWrapper="tbl_wrapper"
                  />
                </Flex>
              </Flex>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24}>
              <TableHistoricalDataPayment
                data={dataSource?.data?.payments || []}
                handleSettings={handleSettings}
              />
            </Col>
            <Col xs={24} sm={24} md={24} lg={24}>
              <Flex justify="space-between" align="center" className="tbl-bottom-filter">
                <div />
                <Flex align="center">
                  <TableShowingEntriesV2 />
                  <TablePagination
                    tableFilter={tableFilter}
                    setTableFilter={setTableFilter}
                    total={dataSource?.data?.total || 0}
                    showLessItems={true}
                    showSizeChanger={false}
                    tblIdWrapper="tbl_wrapper"
                  />
                </Flex>
              </Flex>
            </Col>
          </>
        )}
      </Row>
      <ModalFormPayment
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Payment"
      />
    </Card>
  );
}
