import React, { useState } from "react";
import PropTypes from "prop-types";
import { Input } from "antd";
import InputMask from "react-input-mask";

export default function FloatInputMask(props) {
    const {
        id,
        value,
        label,
        placeholder,
        size = "large",
        required,
        maskType,
        className,
        ...rest
    } = props;

    const [focus, setFocus] = useState(false);

    let new_placeholder = !placeholder ? label : placeholder;

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
            <InputMask
                alwaysShowMask={false}
                mask={maskType ? maskType : "9999 9999 9999 9999"}
                value={value ? value : ""}
                autoComplete="off"
                size={size}
                {...rest}
            >
                {(inputProps) => <Input {...inputProps} />}
            </InputMask>

            <label className={`label ${size}${labelClass}`}>
                {isOccupied ? label : new_placeholder} {requiredMark}
            </label>
        </div>
    );
}

FloatInputMask.propTypes = {
    id: PropTypes.string,
    size: PropTypes.oneOf(["small", "middle", "large"]),
    value: PropTypes.string,
    label: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    maskType: PropTypes.string,
    className: PropTypes.string,
};
