import { useState } from "react";
import { Tabs } from "antd";

export default function CustomTabs(props) {
    const {
        onChange,
        type = "line",
        alignValue = "end",
        size = "middle",
        items = [],
        ...rest
    } = props;

    const [iconSize, setIconSize] = useState(
        items.length > 0 && items[0].iconSize ? items[0].iconSize : 20
    );

    return (
        <Tabs
            onChange={(key) => {
                if (onChange) {
                    onChange(key);
                }

                let findItem = items.find((item) => item.key === key);

                if (findItem && findItem.iconSize) {
                    setIconSize(findItem.iconSize);
                } else {
                    setIconSize(20);
                }
            }}
            indicator={{
                size: (origin) => origin - iconSize,
                align: alignValue,
            }}
            type={type}
            size={size}
            items={items}
            {...rest}
        />
    );
}
