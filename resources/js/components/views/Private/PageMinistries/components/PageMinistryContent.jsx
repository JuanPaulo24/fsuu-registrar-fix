import { useState, useEffect } from "react";
import { Button, Col, Row, Flex } from "antd";
import { faPlus } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { GET } from "../../../../providers/useAxiosQuery";
import { TablePageSize } from "../../../../providers/CustomTableFilter";

import PageMinistryContext from "./PageMinistryContext";
import TableMinistry from "./TableMinistry";
import ModalFormMinistry from "./ModalFormMinistry";
import ModalFormArchiveMinistry from "./ModalFormArchiveMinistry";

export default function PageMinistryContent(props) {
    const { tabActive } = props;

    const [toggleModalForm, setToggleModalForm] = useState({
        open: false,
        data: null,
    });

    const [toggleArchiveModal, setToggleArchiveModal] = useState({
        open: false,

    });


    const [viewMode, setViewMode] = useState("active");
    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
    });

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/users?${new URLSearchParams(tableFilter)}`,
        "users_active_list"
    );

    useEffect(() => {
        refetchSource();
    }, [tableFilter]);

    return (
        <PageMinistryContext.Provider
            value={{
                tabActive,
                type: "card",
                from: "test",
                toggleModalForm,
                setToggleModalForm,
                toggleArchiveModal,
                setToggleArchiveModal,
                viewMode,
            }}
        >
            <Row gutter={[20, 20]}>
                <Col xs={24}>
                    <Button
                        type="primary"
                        onClick={() => setToggleModalForm({ open: true })}
                        icon={<FontAwesomeIcon icon={faPlus} />}


                    >
                        Add {tabActive}
                    </Button>
                </Col>

                {/* Active/Archive and Filters Inline */}
                <Col xs={24} sm={24} md={24} lg={24}>
                    <Flex justify="space-between" align="center">
                        <Flex align="center" gap={10}>
                            <Button
                                type={viewMode === "active" ? "secondary" : "default"}
                                onClick={() => setViewMode("active")}
                            >
                                Active
                            </Button>
                            {/* <Button
                                type={viewMode === "archive" ? "secondary" : "default"}
                                onClick={() => setViewMode("archive")}
                            >
                                Archive
                            </Button> */}
                            <Button
                                type="default"
                                onClick={() => setToggleArchiveModal({ open: true })}
                            >
                                View Archive
                            </Button>

                        </Flex>

                        {/* Custom Filters */}
                        <Flex align="center">
                            <TablePageSize
                                tableFilter={tableFilter}
                                setTableFilter={setTableFilter}
                            />
                        </Flex>
                    </Flex>
                </Col>

                {/* Table Section */}
                <Col xs={24} md={24} lg={24} xl={24}>
                    <TableMinistry
                        dataSource={dataSource?.data?.data || []}
                        tableFilter={tableFilter}
                        setTableFilter={setTableFilter}
                    />
                </Col>
            </Row>
            <ModalFormMinistry />
            <ModalFormArchiveMinistry />
        </PageMinistryContext.Provider>
    );
}
