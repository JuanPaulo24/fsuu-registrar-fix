import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Row, Col, Card, Button, Flex } from "antd";
import { faPlus, faRefresh } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TableUser from "./components/TableUser";
import { GET } from "../../../../../providers/useAxiosQuery";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
    useTableScrollOnTop,
} from "../../../../../providers/CustomTableFilter";
import { hasButtonPermission } from "@/hooks/useButtonPermissions";

export default function TabSystemConfigurationsUser() {
    const navigate = useNavigate();
    const location = useLocation();

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_field: "created_at",
        sort_order: "desc",
        status: ["Active"],
        exclude_user_roles: "STUDENT", // Exclude students from system configurations
        from: location.pathname,
    });

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/users?${new URLSearchParams(tableFilter)}`,
        "users_active_list"
    );

    useEffect(() => {
        refetchSource();

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableFilter]);

    useEffect(() => {
        // Data source logged for debugging - removed for security
    }, [dataSource]);

    useTableScrollOnTop("tbl_user", location);

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
                        {hasButtonPermission('M-09-USERS-ADD') && (
                            <Button
                                type="primary"
                                icon={<FontAwesomeIcon icon={faPlus} />}
                                onClick={() => navigate(`/system-configurations/users/add`)}
                                name="btn_add"
                            >
                                Add User
                            </Button>
                        )}
                        
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <TableGlobalSearchAnimated
                                tableFilter={tableFilter}
                                setTableFilter={setTableFilter}
                                placeholder="Search users..."
                            />
                        </div>
                        
                        <Button
                            type="default"
                            size="middle"
                            icon={<FontAwesomeIcon icon={faRefresh} />}
                            onClick={() => refetchSource()}
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
                    <TableUser
                        dataSource={dataSource}
                        tableFilter={tableFilter}
                        setTableFilter={setTableFilter}
                        selectedRowKeys={selectedRowKeys}
                        setSelectedRowKeys={setSelectedRowKeys}
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
                                total={dataSource?.data?.total || 0}
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
