import { useState, useEffect } from "react";
import { Button, Col, Row, Select, Input, Space, Typography } from "antd";
import { faCog, faSearch } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { GET } from "../../../../../../providers/useAxiosQuery";
import PageEmailContext from "./PageEmailContext";
import TableEmailTemplate from "./TableEmailTemplate";
import ModalEmailTemplate from "./ModalEmailTemplate";
import ModalDefaultBanners from "./ModalDefaultBanners";
import { hasButtonPermission } from "@/hooks/useButtonPermissions";

const { Title } = Typography;

export default function PageEmailContent() {
    const [toggleModalForm, setToggleModalForm] = useState({ open: false, data: null });
    const [showDefaultBannersModal, setShowDefaultBannersModal] = useState(false);
    const [tableFilter, setTableFilter] = useState({ 
        page: 1, 
        page_size: 10,
        system_id: 3 
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState("");

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/email_template?${new URLSearchParams({
            ...tableFilter,
            ...(searchTerm && { search: searchTerm }),
            ...(selectedType && { template_type: selectedType })
        })}`,
        "email_templates_list"
    );

    useEffect(() => { 
        refetchSource(); 
    }, [tableFilter, searchTerm, selectedType, refetchSource]);

    const templateTypeOptions = [
        { value: "", label: "All Types" },
        { value: "verification_result_success", label: "Verification Result (Success)" },
        { value: "verification_result_revoked", label: "Verification Result (Revoked)" },
        { value: "two_factor_auth", label: "Two-Factor Authentication" },
        { value: "auto_reply", label: "Auto-Reply" },
    ];

    const handleSearch = (value) => {
        setSearchTerm(value);
        setTableFilter(prev => ({ ...prev, page: 1 }));
    };

    const handleTypeFilter = (value) => {
        setSelectedType(value);
        setTableFilter(prev => ({ ...prev, page: 1 }));
    };

    return (
        <PageEmailContext.Provider value={{ toggleModalForm, setToggleModalForm, refetchSource }}>
            <Row gutter={[20, 20]}>
                <Col span={24}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Title level={4} style={{ margin: 0 }}>Email Templates</Title>
                        {hasButtonPermission('M-04-SETUP-BANNER') && (
                            <Button 
                                type="primary" 
                                onClick={() => setShowDefaultBannersModal(true)} 
                                icon={<FontAwesomeIcon icon={faCog} />}
                            >
                                Setup Default Banners
                            </Button>
                        )}
                    </div>
                </Col>
                
                <Col span={24}>
                    <Space wrap style={{ marginBottom: 16, width: "100%" }}>
                        <Input.Search
                            placeholder="Search templates..."
                            allowClear
                            style={{ width: 300 }}
                            onSearch={handleSearch}
                            onChange={(e) => !e.target.value && handleSearch("")}
                            prefix={<FontAwesomeIcon icon={faSearch} />}
                        />
                        <Select
                            style={{ width: 200 }}
                            placeholder="Filter by type"
                            options={templateTypeOptions}
                            value={selectedType}
                            onChange={handleTypeFilter}
                            allowClear
                        />
                    </Space>
                </Col>
                
                <Col span={24}>
                    <TableEmailTemplate 
                        dataSource={dataSource?.data?.data || []} 
                        setTableFilter={setTableFilter} 
                        loading={dataSource?.loading}
                    />
                </Col>
            </Row>
            <ModalEmailTemplate />
            <ModalDefaultBanners 
                open={showDefaultBannersModal} 
                onClose={() => setShowDefaultBannersModal(false)} 
            />
        </PageEmailContext.Provider>
    );
}
