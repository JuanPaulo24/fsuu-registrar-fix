import { useState } from "react";
import { Button, Col, Row } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-regular-svg-icons";
import PageVenueContext from "./PageVenueContext";

import VenueTabItemBooking from "./VenueTabItemBooking";
import VenueTabItemVenue from "./VenueTabItemVenue";


export default function PageVenue() {
    const { tabActive } = props;

    const [toggleModalForm, setToggleModalForm] = useState({
        open: false,
        data: null,
    });

    return (
        <PageVenueContext.Provider
            value={{
                tabActive,
                type: "card",
                from: "test",
                toggleModalForm,
                setToggleModalForm,
            }}
        >
            <VenueTabItemBooking />
            <Row gutter={[20, 20]}>
                <Col xs={24} md={24} lg={24} xl={24}>

                    <Button
                        type="primary"
                        onClick={() => setToggleModalForm({ open: true })}
                        icon={<FontAwesomeIcon icon={faPlus} />}
                    >
                        Add {tabActive}
                    </Button>
                </Col>
                <Col xs={24} md={24} lg={24} xl={24}>
                    <TableMinistry />
                </Col>
            </Row>

            <ModalFormMinistry />
        </PageVenueContext.Provider>
    );
}