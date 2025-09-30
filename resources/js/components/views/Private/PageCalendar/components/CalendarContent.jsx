import React, { useState } from "react";
import { Calendar, Badge, Modal, Select, Card } from "antd";
import dayjs from "dayjs";

const eventTypes = {
    2: [{ type: "success", content: "Baptismal Ceremony" }],
    5: [{ type: "warning", content: "Marriage/Wedding" }],
    9: [{ type: "error", content: "Religious Retreat" }],
    12: [{ type: "default", content: "Funeral Service" }],
    15: [{ type: "processing", content: "Community Outreach" }]
};

const CalendarContent = ({ currentDate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedService, setSelectedService] = useState(null);

    const handleDateClick = (date) => {
        if (date.isSame(dayjs(), "day")) {
            setSelectedDate(date);
            setIsModalOpen(true);
        }
    };

    const getListData = (value) => {
        return eventTypes[value.date()] || [];
    };

    const dateCellRender = (value) => {
        const listData = getListData(value);
        return (
            <ul>
                {listData.map((item, index) => (
                    <li key={index}>
                        <Badge status={item.type} text={item.content} />
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <Card className="p-6">
            <Calendar 
                fullscreen 
                cellRender={(current, info) => {
                    if (info.type === 'date') {
                        return dateCellRender(current);
                    }
                    return info.originNode;
                }}
                onSelect={handleDateClick} 
                value={currentDate} 
            />

            <Modal
                title="SERVICES"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                className="rounded-lg"
            >
                <Select
                    className="w-full border border-gray-300 rounded-md"
                    placeholder="Select an option"
                    onChange={setSelectedService}
                    options={[
                        { label: "Baptisms", value: "baptism" },
                        { label: "Communion", value: "communion" },
                        { label: "Confirmations", value: "confirmation" },
                        { label: "Matrimony", value: "matrimony" },
                    ]}
                />
            </Modal>
        </Card>
    );
};

export default CalendarContent;
