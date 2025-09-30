import React, { useContext } from "react";
import TableHistoricalData from "../components/TableHistoricalData";
import PageHistoricalContext from "../components/PageHistoricalContext";

const PageHistoricalContent = () => {
    const context = useContext(PageHistoricalContext);

    return (
        <div>
            {/* Any additional content can go here */}
            <TableHistoricalData />
        </div>
    );
};

export default PageHistoricalContent;
