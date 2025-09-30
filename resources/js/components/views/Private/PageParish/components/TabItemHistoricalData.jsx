import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Row, Col, Card, Flex } from "antd";
import { GET } from "../../../../providers/useAxiosQuery";
import {
  TableGlobalSearchAnimated,
  TablePageSize,
  TablePagination,
  useTableScrollOnTop,
} from "../../../../providers/CustomTableFilter";
import TableHistoricalData from "./TableHistoricalData";
import DataHistoricalData from "./DataHistoricalData.json";

export default function TabItemHistoricalData() {
  const location = useLocation();

  const [tableFilter, setTableFilter] = useState({
    page: 1,
    page_size: 10,
    search: "",
    sort_field: "time_stamp",
    sort_order: "desc",
    from: location.pathname,
  });

  const { data: apiData, refetch: refetchSource } = GET(
    `api/parish?${new URLSearchParams(tableFilter)}`,
    "historicaldata_active_list"
  );

  const [DataHistoricalDataList, setDataHistoricalDataList] = useState(DataHistoricalData);

  const filteredData = (DataHistoricalDataList || []).filter((item) => {
    const matchesSearch = tableFilter.search
      ? item.church.toLowerCase().includes(tableFilter.search.toLowerCase())
      : true;
    return matchesSearch;
  });

  const start = (tableFilter.page - 1) * tableFilter.page_size;
  const end = start + tableFilter.page_size;
  const slicedData = filteredData.slice(start, end);

  const totalRecords = filteredData.length;
  const startRecord = totalRecords === 0 ? 0 : start + 1;
  const endRecord = Math.min(end, totalRecords);

  const dataSource = {
    data: {
      totalHistoricalData: totalRecords,
      historicaldata: slicedData,
    },
  };

  useEffect(() => {
    refetchSource();
  }, [tableFilter]);

  useTableScrollOnTop("tbl_wrapper", location);

  return (
    <Card id="TabItemHistoricalData">
      <>
        {/* Search and Page Size */}
        <Col xs={24} sm={24} md={24} lg={24}>
          <Flex justify="space-between" align="center" className="tbl-top-filter">
            <Flex align="center">
              <TableGlobalSearchAnimated
                tableFilter={tableFilter}
                setTableFilter={setTableFilter}
                placeholder="Search by name"
              />
            </Flex>
            <Flex align="center">
              <TablePageSize tableFilter={tableFilter} setTableFilter={setTableFilter} />
            </Flex>
          </Flex>
        </Col>

        {/* Top Pagination and Results */}
        <Col xs={24} sm={24} md={24} lg={24}>
          <Flex justify="space-between" align="center" className="tbl-bottom-filter">
            <div />
            <Flex align="center" gap={10}>
              <div>
                <b>Results</b> {startRecord} to {endRecord} of {totalRecords} records
              </div>
              <TablePagination
                tableFilter={tableFilter}
                setTableFilter={setTableFilter}
                total={totalRecords}
                showLessItems={true}
                showSizeChanger={false}
                tblIdWrapper="tbl_wrapper"
              />
            </Flex>
          </Flex>
        </Col>

        {/* Table */}
        <Col xs={24} sm={24} md={24} lg={24}>
          <div className="table-bottom-spacing">
            <TableHistoricalData
              data={dataSource?.data?.historicaldata || []}
              setTableFilter={setTableFilter}
            />
          </div>
        </Col>

        {/* Bottom Pagination */}
        <Col xs={24} sm={24} md={24} lg={24}>
          <Flex justify="end" align="center" className="tbl-bottom-filter">
            <div>
              <b>Results</b> {startRecord} to {endRecord} of {totalRecords} records
            </div>
            <TablePagination
              tableFilter={tableFilter}
              setTableFilter={setTableFilter}
              total={totalRecords}
              showLessItems={true}
              showSizeChanger={false}
              tblIdWrapper="tbl_wrapper"
            />
          </Flex>
        </Col>
      </>
    </Card>
  );
}
