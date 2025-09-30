import { useState } from "react";
import PropTypes from "prop-types";
import { Input } from "antd";

export default function FloatInputPassword(props) {
    const {
        id,
        value,
        label,
        placeholder,
        className,
        required,
        size = "large",
        ...rest
    } = props;

    const [focus, setFocus] = useState(false);

    let new_placeholder = placeholder ? placeholder : label;

    let hasValue = focus || (value && value !== "" && value.length !== 0);

    let labelClass =
        hasValue || (value && value === "0" && value.length !== 0)
            ? " float-label"
            : "";

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
            <Input.Password value={value} size={size} {...rest} />
            <label className={`label ${size}${labelClass}`}>
                {hasValue ? label : new_placeholder} {requiredMark}
            </label>
        </div>
    );
}

FloatInputPassword.propTypes = {
    id: PropTypes.string,
    value: PropTypes.string,
    label: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    className: PropTypes.string,
    required: PropTypes.bool,
    size: PropTypes.oneOf(["small", "middle", "large"]),
};
