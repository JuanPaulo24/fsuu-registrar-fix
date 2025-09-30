import { Flex, Layout } from "antd";

import { appName } from "../../providers/appConfig";
import packageJson from "../../../../../package.json";

export default function Footer() {
    return (
        <Layout.Footer>
            <Flex justify="space-between">
                <span>{`${appName} ©2025 BETA VERSION`}</span>

                <span>
                    V:{" "}
                    {packageJson && packageJson.version
                        ? packageJson.version
                        : "0.0.1"}
                </span>
            </Flex>
        </Layout.Footer>
    );
}
