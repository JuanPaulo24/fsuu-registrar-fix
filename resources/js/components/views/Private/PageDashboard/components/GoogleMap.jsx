import { Card } from "antd";

const GoogleMap = () => {
    return (
        <section className="map-container mx-auto">
            <Card className="bg-white shadow-lg w-full" bodyStyle={{ padding: 0 }}>
                <iframe
                    className="map-frame"
                    scrolling="no"
                    id="gmap_canvas"
                    src="https://maps.google.com/maps?width=100%25&amp;height=400&amp;hl=en&amp;q=Father%20Saturnino%20Urios%20University%2C%20Butuan%20City&amp;t=p&amp;z=15&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
                    title="Father Saturnino Urios University Location"
                />
            </Card>
        </section>
    );
};

export default GoogleMap;
