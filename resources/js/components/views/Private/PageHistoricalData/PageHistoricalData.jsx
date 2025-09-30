import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "antd";
import PageHistoricalContent from "../PageHistoricalData/components/PageHistoricalContent";
import PageHistoricalContext from "../PageHistoricalData/components/PageHistoricalContext";
import { GET } from "../../../providers/useAxiosQuery";

const PageHistoricalData = () => {
    const params = useParams();
    const [serviceTypeData, setServiceTypeData] = useState(null);

    useEffect(() => {
        fetchData();
    }, [params.id]);

    const fetchData = async () => {
        const response = await GET(`api/service_type/${params.id}`);
        if (response.success) {
            setServiceTypeData(response.data);
        }
    };

    return (
        <PageHistoricalContext.Provider value={{ serviceTypeData }}>
            <Card>
                <PageHistoricalContent />
            </Card>
        </PageHistoricalContext.Provider>
    );
};

export default PageHistoricalData;
