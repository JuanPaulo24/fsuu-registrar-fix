import { useNavigate } from "react-router-dom";
import { Result, Button } from "antd";

export default function Page404() {
    const navigate = useNavigate();

    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
            id="Page404"
        >
            <Result
                status="404"
                title="404"
                subTitle="Sorry, the page you visited does not exist."
                extra={
                    <Button type="primary" onClick={() => navigate("/")}>
                        Back Home
                    </Button>
                }
            />
        </div>
    );
}
