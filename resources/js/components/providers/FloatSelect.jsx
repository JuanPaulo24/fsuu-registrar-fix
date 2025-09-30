import React, { useState } from "react";
import PropTypes from "prop-types";
import { Select } from "antd";

export default function FloatSelect(props) {
    const {
        id,
        value,
        label,
        placeholder,
        required,
        showSearch = true,
        size = "large",
        className,
        options = [],
        ...rest
    } = props;

    const [focus, setFocus] = useState(false);

    let new_placeholder = placeholder ? placeholder : label;

    let isOccupied = focus || (value && value.length !== 0);

    let labelClass = isOccupied ? " float-label" : "";

    let requiredMark = required ? (
        <span className="text-red-600">*</span>
    ) : null;

    return (
        <div
            id={id ?? ""}
            className={`float-wrapper${className ? " " + className : ""}`}
            onBlur={() => setFocus(false)}
            onFocus={() => setFocus(true)}
        >
            <Select
                value={value}
                size={size}
                showSearch={showSearch}
                options={options}
                filterOption={(input, option) => {
                    return (
                        option.label
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                    );
                }}
                {...rest}
            />
            <label className={`label ${size}${labelClass}`}>
                {isOccupied ? label : new_placeholder} {requiredMark}
            </label>
        </div>
    );
}

FloatSelect.propTypes = {
    id: PropTypes.string,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.array,
    ]),
    label: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    popupClassName: PropTypes.string,
    size: PropTypes.oneOf(["small", "middle", "large"]),
    className: PropTypes.string,
};
