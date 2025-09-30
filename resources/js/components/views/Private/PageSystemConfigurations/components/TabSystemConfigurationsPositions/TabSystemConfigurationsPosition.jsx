import { useEffect, useState } from "react";
import { Card, Button, Flex, message, Row, Col } from "antd";
import { faPlus, faRefresh } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PageSystemConfigurationsContext from "../TabSystemsConfigurationsContext";
import ModalPosition from "./components/ModalPosition";
import TablePosition from "./components/TablePosition";
import { POST } from "../../../../../providers/useAxiosQuery";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../../../providers/CustomTableFilter";

export default function TabSystemConfigurationsPosition() {
    const [toggleModalForm, setToggleModalForm] = useState({ open: false, data: null });
    const [viewMode, setViewMode] = useState("active");
    const [tableFilter, setTableFilter] = useState({ 
        page: 1, 
        page_size: 10, 
        search: "",
        sort_field: "id",
        sort_order: "desc"
    });

    // table will fetch data itself; we just keep total for pagination widgets
    const [total, setTotal] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);

    // Archive/Restore mutation
    const archivePosition = POST(
        "api/position_archived",
        "positions_list",
        true,
        () => {
            message.success("Position archived successfully");
        }
    );

    const restorePosition = POST(
        "api/position_archived",
        "positions_list",
        true,
        () => {
            message.success("Position restored successfully");
        }
    );

    // Handle view mode change
    useEffect(() => {
        setTableFilter(prev => ({
            ...prev,
            page: 1
        }));
    }, [viewMode]);

    const handleArchive = (record) => {
        archivePosition.mutate({
            ids: [record.id],
            isTrash: false
        }, {
            onSuccess: () => {
                setRefreshKey((k) => k + 1);
                if (import.meta.env.MODE !== 'production') {
                    // eslint-disable-next-line no-console
                    console.log('POSITIONS: archived', record.id);
                }
            },
            onError: (err) => {
                if (import.meta.env.MODE !== 'production') {
                    // eslint-disable-next-line no-console
                    console.log('POSITIONS: archive error', err?.response?.data || err?.message || err);
                }
            }
        });
    };

    const handleRestore = (record) => {
        restorePosition.mutate({
            ids: [record.id],
            isTrash: true
        }, {
            onSuccess: () => {
                setRefreshKey((k) => k + 1);
                if (import.meta.env.MODE !== 'production') {
                    // eslint-disable-next-line no-console
                    console.log('POSITIONS: restored', record.id);
                }
            },
            onError: (err) => {
                if (import.meta.env.MODE !== 'production') {
                    // eslint-disable-next-line no-console
                    console.log('POSITIONS: restore error', err?.response?.data || err?.message || err);
                }
            }
        });
    };

    const handleEdit = (record) => {
        setToggleModalForm({ open: true, data: record });
    };

    const handleAdd = () => {
        setToggleModalForm({ open: true, data: null });
    };

    const handleFetched = (totalRecords) => {
        setTotal(totalRecords);
    };

    const handleRefresh = () => {
        setRefreshKey((k) => k + 1);
    };



    return (
        <PageSystemConfigurationsContext.Provider value={{ 
            toggleModalForm, 
            setToggleModalForm, 
            viewMode,
            refreshKey,
            setRefreshKey
        }}>
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
                            <Button
                                type="primary"
                                icon={<FontAwesomeIcon icon={faPlus} />}
                                onClick={handleAdd}
                            >
                                Add New Position
                            </Button>
                            
                            <Flex align="center" gap={8}>
                                <Button 
                                    type={viewMode === "active" ? "primary" : "default"} 
                                    onClick={() => setViewMode("active")}
                                >
                                    Active
                                </Button>
                                <Button 
                                    type={viewMode === "archive" ? "primary" : "default"} 
                                    onClick={() => setViewMode("archive")}
                                >
                                    Archive
                                </Button>
                            </Flex>
                            
                            <div style={{ flex: 1, minWidth: 200 }}>
                                <TableGlobalSearchAnimated
                                    tableFilter={tableFilter}
                                    setTableFilter={setTableFilter}
                                    placeholder="Search positions..."
                                />
                            </div>
                            
                            <Button
                                type="default"
                                size="middle"
                                icon={<FontAwesomeIcon icon={faRefresh} />}
                                onClick={handleRefresh}
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
                        <TablePosition
                            viewMode={viewMode}
                            onEdit={handleEdit}
                            onArchive={handleArchive}
                            onRestore={handleRestore}
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                            onFetched={handleFetched}
                            refreshKey={refreshKey}
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

            <ModalPosition />
        </PageSystemConfigurationsContext.Provider>
    );
}
