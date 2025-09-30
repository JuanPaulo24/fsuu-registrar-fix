import React, { useState } from "react";
import { Modal, Select } from "antd";

const CalendarModal = ({ isModalOpen, setIsModalOpen, selectedDate }) => {
    const [selectedService, setSelectedService] = useState(null);

    const handleServiceSelect = (value) => {
        setSelectedService(value);
        setTimeout(() => setIsModalOpen(false), 500); // Auto-close modal after selecting
    };

    return (
        <Modal
            title={
                <header className="bg-primary text-white text-lg font-semibold px-6 py-3">
                    Services
                </header>
            }
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={null}
            centered
            width={400}
            className="rounded-lg overflow-hidden"
        >
            <section className="p-6">
                <Select
                    className="w-full border border-gray-300 rounded-md"
                    placeholder="Select an option"
                    onChange={handleServiceSelect}
                    options={[
                        { label: "Baptisms", value: "baptism" },
                        { label: "Communion", value: "communion" },
                        { label: "Confirmations", value: "confirmation" },
                        { label: "Matrimony", value: "matrimony" },
                    ]}
                />
            </section>
        </Modal>
    );
};

export default CalendarModal;
