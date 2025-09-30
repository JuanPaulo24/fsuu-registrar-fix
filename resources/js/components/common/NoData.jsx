import { Empty } from "antd";

export default function NoData() {
    return (
        <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No data"
        />
    );
}
