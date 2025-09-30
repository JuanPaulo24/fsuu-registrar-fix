import { useParams } from "react-router-dom";
import { Card } from "antd";

import { GET } from "../../../providers/useAxiosQuery";
import { useEffect } from "react";

export default function PageSacraments() {
    const params = useParams();

    const { data: dataServiceType } = GET(
        `api/service_type/${params.id}`,
        "service_type_info_" + params.id,
        () => {},
        false
    );

    useEffect(() => {
        if (dataServiceType && dataServiceType.data) {
            let sacramentsServiceType = document.getElementsByClassName(
                "sacramentsServiceType"
            );

            if (sacramentsServiceType.length) {
                Array.from(sacramentsServiceType).forEach((item) => {
                    item.innerHTML = dataServiceType.data.service_type;
                });
            }
        }

        return () => {};
    }, [dataServiceType]);

    return <Card></Card>;
}
