import React from "react";
import { Card } from "antd";

const CalendarFilter = () => {
    return (
        <Card className="p-4">
            <h2 className="text-lg font-bold mb-3">Filter</h2>
            {/* Highlight Color at Bottom */}
            <div className="w-full mt-4 h-1" 
                 style={{ backgroundColor: "var(--color-highlight)" }}></div>
        </Card>
    );
};

export default CalendarFilter;
