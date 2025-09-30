import React, { Children } from "react";
import CustomTabs from "../../../providers/CustomTabs";
import VenueTabItemVenue from "./components/VenueTabItemVenue";
import VenueTabItemBooking from "./components/VenueTabItemBooking";
import HistoricalData from "./components/HistoricalData";


export default function PageVenue() {
    return (
        <CustomTabs
            items={[
                {
                    key: "venues",
                    label: "Venues",
                    children: <VenueTabItemVenue />, // Use content prop
                },
                {
                    key: "booking",
                    label: "Booking",
                    children: <VenueTabItemBooking />, // Use content prop
                },
                {
                    key: "historical data",
                    label: "Historical Data",
                    children: <HistoricalData />, // Use content prop
                }
            ]}
        />
    );
}
