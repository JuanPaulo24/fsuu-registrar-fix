import { useNavigate } from "react-router-dom";
import { Table, Button, notification, Popconfirm, Flex } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTrash,
    faNewspaper,
    faRotateLeft,
} from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";

import { POST } from "../../../../../providers/useAxiosQuery";
import notificationErrors from "../../../../../providers/notificationErrors";

export default function TableHistoricalData(props) {
    const {
        dataSource,
        tableFilter,
        setTableFilter,
        selectedRowKeys,
        setSelectedRowKeys,
    } = props;

    const navigate = useNavigate();

    const onChangeTable = (pagination, filters, sorter) => {
        setTableFilter((ps) => ({
            ...ps,
            sort_field: sorter.columnKey,
            sort_order: sorter.order ? sorter.order.replace("end", "") : null,
            page: 1,
            page_size: "50",
        }));
    };

    return (
        <Table
            id="tbl_historical_data"
            className="ant-table-default ant-table-striped"
            dataSource={dataSource}
            rowKey={(record) => record.id}
            pagination={false}
            bordered={false}
            onChange={onChangeTable}
            scroll={{ x: "max-content" }}
            sticky
        >
            <Table.Column title="Time Stamp" key="timeStamp" dataIndex="timeStamp" align="center" sorter={true} width={150} />
            <Table.Column title="Edited By" key="editedBy" dataIndex="editedBy" align="center" sorter={true} width={150} />
            <Table.Column title="Subject Updated" key="subjectUpdated" dataIndex="subjectUpdated" sorter align="center" width={220} />
            <Table.Column title="Full Name" key="fullName" dataIndex="fullName" sorter align="center" width={220} />
            <Table.Column title="Field" key="field" dataIndex="field" align="center" sorter={true} width={150} />
            <Table.Column title="Old Value" key="oldValue" dataIndex="oldValue" align="center" sorter={true} width={150} />
            <Table.Column title="New Value" key="newValue" dataIndex="newValue" align="center" sorter={true} width={150} />
        </Table>
    );
}
