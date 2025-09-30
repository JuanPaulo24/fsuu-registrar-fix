import { useEffect, useState, useMemo } from "react";
import { Card, Table, Flex, Tag, Row, Col, Button } from "antd";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../../../providers/CustomTableFilter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark, faArrowRightToArc, faRefresh } from "@fortawesome/pro-regular-svg-icons";
import { GET } from "../../../../../providers/useAxiosQuery";
import NoData from "../../../../../common/NoData";

export default function TabSystemConfigurationsLoginLogs() {
    const [tableFilter, setTableFilter] = useState({ page: 1, page_size: 10, search: "", sort_field: "attempted_at", sort_order: "desc" });
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);

    const devLog = (...args) => {
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE !== 'production') {
            // eslint-disable-next-line no-console
            console.log(...args);
        }
    };

    const params = useMemo(() => {
        return new URLSearchParams(tableFilter).toString();
    }, [tableFilter]);

    const { data: apiData, isLoading, refetch } = GET(
        `api/login_logs?${params}`,
        "login_logs_list",
        {
            onSuccess: (res) => {
                const list = Array.isArray(res?.data) ? res.data : (res?.data?.data || []);
                const totalCount = res?.data?.total || list.length || 0;
                setRows(list);
                setTotal(totalCount);
                devLog("LOGIN_LOGS: fetch success", { total: totalCount, params });
            },
            onError: (err) => {
                devLog("LOGIN_LOGS: fetch error", err?.response?.data || err?.message || err);
            },
            isLoading: true,
            enabled: true,
        }
    );

    useEffect(() => {
        refetch();
    }, [params]);

    const onChangeTable = (pagination, filters, sorter) => {
        setTableFilter(prev => ({
            ...prev,
            sort_field: sorter.columnKey || "attempted_at",
            sort_order: sorter.order ? sorter.order.replace("end", "") : "desc",
            page: 1,
        }));
        devLog("LOGIN_LOGS: table sort change", { columnKey: sorter.columnKey, order: sorter.order });
    };

    // Helper function to render status with icon and appropriate color
    const renderStatus = (status) => {
        const isSuccess = status === "SUCCESS";
        return (
            <Tag 
                color={isSuccess ? "success" : "error"}
                icon={<FontAwesomeIcon icon={isSuccess ? faCheck : faXmark} />}
                style={{ display: "flex", alignItems: "center", gap: "4px", width: "fit-content" }}
            >
                {status}
            </Tag>
        );
    };

    // Helper function to format device info
    const formatDevice = (userAgent) => {
        if (!userAgent) return 'Unknown Device';
        
        // Simple device detection for display
        let device = 'Unknown';
        let browser = 'Unknown';
        
        // Detect OS
        if (/Windows NT/i.test(userAgent)) {
            device = 'Windows';
        } else if (/Mac OS X/i.test(userAgent)) {
            device = 'macOS';
        } else if (/Android/i.test(userAgent)) {
            device = 'Android';
        } else if (/iPhone|iPad/i.test(userAgent)) {
            device = /iPad/i.test(userAgent) ? 'iPad' : 'iPhone';
        } else if (/Linux/i.test(userAgent)) {
            device = 'Linux';
        }
        
        // Detect Browser
        if (/Chrome/i.test(userAgent) && !/Edge/i.test(userAgent)) {
            browser = 'Chrome';
        } else if (/Firefox/i.test(userAgent)) {
            browser = 'Firefox';
        } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
            browser = 'Safari';
        } else if (/Edge/i.test(userAgent)) {
            browser = 'Edge';
        }
        
        return `${device} - ${browser}`;
    };

    const columns = [
        {
            title: "Username",
            key: "username",
            dataIndex: "username",
            width: 150,
            sorter: true,
            render: (text, record) => (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FontAwesomeIcon icon={faArrowRightToArc} style={{ color: "#1890ff" }} />
                    {text || "—"}
                </div>
            )
        },
        {
            title: "IP Address",
            key: "ip_address",
            dataIndex: "ip_address",
            width: 150,
            sorter: true,
        },
        {
            title: "Device / Browser",
            key: "user_agent",
            dataIndex: "user_agent",
            width: 300,
            render: (userAgent) => formatDevice(userAgent)
        },
        {
            title: "Status",
            key: "status",
            dataIndex: "status",
            render: (status) => renderStatus(status),
            width: 150,
            align: "center",
            sorter: true,
        },
        {
            title: "Date & Time",
            key: "attempted_at",
            dataIndex: "attempted_at",
            width: 200,
            sorter: true,
            render: (text) => {
                if (!text) return "-";
                const date = new Date(text);
                return date.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            },
        }
    ];

    return (
        <Card>
            <Row gutter={[20, 20]} id="tbl_wrapper">
                <Col xs={24} sm={24} md={24} lg={24}>
                    <Flex
                        gap={16}
                        wrap="wrap"
                        align="center"
                        className="tbl-top-controls"
                        style={{ marginBottom: 16 }}
                    >
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <TableGlobalSearchAnimated
                                tableFilter={tableFilter}
                                setTableFilter={setTableFilter}
                                placeholder="Search login attempts..."
                            />
                        </div>
                        
                        <Button
                            type="default"
                            size="middle"
                            icon={<FontAwesomeIcon icon={faRefresh} />}
                            onClick={() => refetch()}
                            title="Refresh table data"
                            className="table-refresh-btn"
                        />
                        
                        <TablePageSize
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                        />
                    </Flex>
                </Col>

                <Col xs={24} sm={24} md={24} lg={24}>
                    <Table
                        className="ant-table-default ant-table-striped"
                        dataSource={rows}
                        rowKey={(record) => record.id}
                        pagination={false}
                        bordered={false}
                        scroll={{ x: "max-content" }}
                        sticky
                        onChange={onChangeTable}
                        loading={false}
                        columns={columns}
                        locale={{
                            emptyText: <NoData />
                        }}
                        size="small"
                    />
                </Col>

                <Col xs={24} sm={24} md={24} lg={24}>
                    <Flex
                        justify="space-between"
                        align="center"
                        className="tbl-bottom-filter"
                    >
                        <div />

                        <Flex align="center">
                            <TableShowingEntriesV2 />
                            <TablePagination
                                tableFilter={tableFilter}
                                setTableFilter={setTableFilter}
                                total={total}
                                showLessItems={true}
                                showSizeChanger={false}
                                tblIdWrapper="tbl_wrapper"
                            />
                        </Flex>
                    </Flex>
                </Col>
                </Row>
        </Card>
    );
}
