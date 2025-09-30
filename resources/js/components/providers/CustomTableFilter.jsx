import { useEffect, useRef, useState } from "react";
import { Button, Dropdown, Input, Pagination, Select, Typography } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/pro-solid-svg-icons";
import {
    faAngleLeft,
    faAngleRight,
    faFilterList,
    faSearch,
} from "@fortawesome/pro-regular-svg-icons";

import optionAlphabet from "./optionAlphabet";

export function TablePagination(props) {
    const {
        showLessItems,
        showSizeChanger,
        tableFilter,
        setTableFilter,
        total,
        tblIdWrapper,
    } = props;

    const [paginationSize, setPaginationSize] = useState("default");

    useEffect(() => {
        window.onresize = function () {
            if (window.offsetWidth <= 768) {
                setPaginationSize("small");
            } else {
                setPaginationSize("default");
            }
        };
    }, []);

    return (
        <Pagination
            current={tableFilter.page}
            total={total}
            size={paginationSize}
            showLessItems={showLessItems ?? false}
            showSizeChanger={showSizeChanger ?? true}
            showTotal={(total, range) => {
                let tbl_wrapper = document.getElementById(tblIdWrapper);
                if (tbl_wrapper) {
                    let span_page_from =
                        tbl_wrapper.querySelectorAll(".span_page_from");
                    let span_page_to =
                        tbl_wrapper.querySelectorAll(".span_page_to");
                    let span_page_total =
                        tbl_wrapper.querySelectorAll(".span_page_total");
                    let span_page_to_text =
                        tbl_wrapper.querySelectorAll(".span_page_to_text");
                    let span_page_records_text =
                        tbl_wrapper.querySelectorAll(".span_page_records_text");
                    
                    // Calculate total pages
                    const totalPages = Math.ceil(total / tableFilter.page_size) || 1;
                    
                    if (span_page_from.length > 0) {
                        span_page_from.forEach((item) => {
                            item.textContent = `Page ${tableFilter.page}`;
                        });
                    }
                    if (span_page_to.length) {
                        span_page_to.forEach((item) => {
                            item.textContent = "";
                        });
                    }
                    if (span_page_total) {
                        span_page_total.forEach((item) => {
                            item.textContent = `of ${totalPages}`;
                        });
                    }
                    if (span_page_to_text) {
                        span_page_to_text.forEach((item) => {
                            item.style.display = "none";
                        });
                    }
                    if (span_page_records_text) {
                        span_page_records_text.forEach((item) => {
                            item.style.display = "none";
                        });
                    }
                } else {
                    let span_page_from =
                        document.querySelectorAll(".span_page_from");
                    let span_page_to =
                        document.querySelectorAll(".span_page_to");
                    let span_page_total =
                        document.querySelectorAll(".span_page_total");
                    let span_page_to_text =
                        document.querySelectorAll(".span_page_to_text");
                    let span_page_records_text =
                        document.querySelectorAll(".span_page_records_text");
                    
                    // Calculate total pages
                    const totalPages = Math.ceil(total / tableFilter.page_size) || 1;
                    
                    if (span_page_from.length > 0) {
                        span_page_from.forEach((item) => {
                            item.textContent = `Page ${tableFilter.page}`;
                        });
                    }
                    if (span_page_to.length) {
                        span_page_to.forEach((item) => {
                            item.textContent = "";
                        });
                    }
                    if (span_page_total) {
                        span_page_total.forEach((item) => {
                            item.textContent = `of ${totalPages}`;
                        });
                    }
                    if (span_page_to_text) {
                        span_page_to_text.forEach((item) => {
                            item.style.display = "none";
                        });
                    }
                    if (span_page_records_text) {
                        span_page_records_text.forEach((item) => {
                            item.style.display = "none";
                        });
                    }
                }
            }}
            pageSize={tableFilter.page_size}
            onChange={(page, pageSize) => {
                setTableFilter({
                    ...tableFilter,
                    page,
                    page_size: pageSize,
                });

                let tbl_wrapper = document.getElementById(tblIdWrapper);
                if (tbl_wrapper) {
                    tbl_wrapper.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                }
            }}
            itemRender={(current, type, originalElement) => {
                if (type === "prev") {
                    return (
                        <Button>
                            <FontAwesomeIcon icon={faAngleLeft} />
                        </Button>
                    );
                }
                if (type === "next") {
                    return (
                        <Button>
                            <FontAwesomeIcon icon={faAngleRight} />
                        </Button>
                    );
                }
                return originalElement;
            }}
        />
    );
}

export function TableShowingEntries() {
    return (
        <div className="tbl-showing-entries">
            <Typography.Text>
                Showing <span className="span_page_from"></span> to{" "}
                <span className="span_page_to"></span> of{" "}
                <span className="span_page_total"></span> entries
            </Typography.Text>
        </div>
    );
}

export function TableShowingEntriesV2() {
    return (
        <div className="tbl-showing-entries">
            <div className="wrapper">
                <span className="span_page_from"></span>{" "}
                <span className="span_page_to_text" style={{ display: "none" }}>to</span> <span className="span_page_total"></span>{" "}
                <span className="span_page_records_text" style={{ display: "none" }}>records</span>
            </div>
        </div>
    );
}

export function TablePageSize(props) {
    const { tableFilter, setTableFilter, className, option, size } = props;

    return (
        <div className="tbl-page-size">
            <Select
                value={tableFilter.page_size}
                onChange={(e) =>
                    setTableFilter({ ...tableFilter, page_size: e })
                }
                className={className ?? "ant-select-table-pagesize"}
                suffixIcon={<FontAwesomeIcon icon={faCaretDown} />}
                size={size ?? "middle"}
            >
                {option && option.length > 0 ? (
                    option.map((item, index) => {
                        return (
                            <Select.Option value={item} key={index}>
                                {item}
                            </Select.Option>
                        );
                    })
                ) : (
                    <>
                        <Select.Option value={10}>10 / Page</Select.Option>
                        <Select.Option value={25}>25 / Page</Select.Option>
                        <Select.Option value={50}>50 / Page</Select.Option>
                        <Select.Option value={75}>75 / Page</Select.Option>
                        <Select.Option value={100}>100 / Page</Select.Option>
                    </>
                )}
            </Select>
        </div>
    );
}

export function TableGlobalSearch(props) {
    const { tableFilter, setTableFilter, placeholder, size, className } = props;

    const [searchTextTimeout, setSearchTextTimeout] = useState(0);

    return (
        <div className="tbl-search-wrapper">
            <Input
                suffix={<FontAwesomeIcon icon={faSearch} />}
                placeholder={placeholder ?? "Search..."}
                size={size ?? "middle"}
                className={className ?? "ant-input-padding-inherit"}
                onChange={(e) => {
                    if (searchTextTimeout) clearTimeout(searchTextTimeout);
                    clearTimeout(searchTextTimeout);
                    let timeoutTemp = setTimeout(() => {
                        setTableFilter({
                            ...tableFilter,
                            search: e.target.value,
                            page: 1,
                        });
                    }, 1000);
                    setSearchTextTimeout(timeoutTemp);
                }}
            />
        </div>
    );
}

export function TableGlobalSearchAnimated(props) {
    const {
        tableFilter,
        setTableFilter,
        placeholder,
        size,
        className,
        wrapClassName,
    } = props;

    const [searchTextTimeout, setSearchTextTimeout] = useState(0);
    const inputRef = useRef(null);
    const [toggleShow, setToggleShow] = useState(false);

    useEffect(() => {
        if (toggleShow && inputRef.current) {
            inputRef.current.focus();
        }
    }, [toggleShow]);

    return (
        <div
            className={`tbl-search-wrapper animated${
                wrapClassName ? " " + wrapClassName : ""
            }${toggleShow ? " show" : ""}`}
        >
            <Input
                ref={inputRef}
                allowClear
                suffix={
                    <FontAwesomeIcon
                        icon={faSearch}
                        onClick={() => {
                            setToggleShow(!toggleShow);
                        }}
                    />
                }
                placeholder={placeholder ?? "Search..."}
                size={size ?? "middle"}
                className={className ?? "ant-input-padding-inherit"}
                onChange={(e) => {
                    if (searchTextTimeout) clearTimeout(searchTextTimeout);
                    clearTimeout(searchTextTimeout);
                    let timeoutTemp = setTimeout(() => {
                        setTableFilter({
                            ...tableFilter,
                            search: e.target.value,
                            page: 1,
                        });
                    }, 1000);
                    setSearchTextTimeout(timeoutTemp);
                }}
            />
        </div>
    );
}

export function TableGlobalAlphaSearch(props) {
    const { tableFilter, setTableFilter, size, className } = props;
    const [active, setActive] = useState("");

    return (
        <div className={"flex table-filter-alphabet " + (className ?? "")}>
            {optionAlphabet.map((item, index) => (
                <Button
                    key={index}
                    type="link"
                    size={size ?? "large"}
                    onClick={() => {
                        setTableFilter({
                            ...tableFilter,
                            letter: item,
                            page: 1,
                        });
                        setActive(item);
                    }}
                    className={active === item ? "btn-main-outline" : ""}
                >
                    {item}
                </Button>
            ))}
        </div>
    );
}

export const useTableScrollOnTop = (id, location = "") => {
    useEffect(() => {
        const tbl1 = document.getElementById(id);
        const tableStickyHolder = tbl1.querySelector(
            ".ant-table-header.ant-table-sticky-holder"
        );
        const tableBody = tbl1.querySelector(".ant-table-body");

        const handleScroll = (event) => {
            const { scrollLeft, scrollTop } = event.target;
            if (tableStickyHolder) {
                tableStickyHolder.scrollLeft = scrollLeft;
                tableStickyHolder.scrollTop = scrollTop;
            }
            if (tableBody) {
                tableBody.scrollLeft = scrollLeft;
                tableBody.scrollTop = scrollTop;
            }
        };

        if (tableStickyHolder) {
            tableStickyHolder.addEventListener("scroll", handleScroll);
        }
        if (tableBody) {
            tableBody.addEventListener("scroll", handleScroll);
        }

        // Clean up event listeners when the component unmounts
        return () => {
            if (tableStickyHolder) {
                tableStickyHolder.removeEventListener("scroll", handleScroll);
            }
            if (tableBody) {
                tableBody.removeEventListener("scroll", handleScroll);
            }
        };
    }, [id, location]);

    return "";
};

export const TableDropdownFilter = ({ items }) => {
    const [openFilter, setOpenFilter] = useState(false);

    return (
        <Dropdown
            menu={{
                items,
            }}
            placement="bottomLeft"
            align={{
                offset: [0, 0],
            }}
            open={openFilter}
            onOpenChange={(nextOpen, info) => {
                if (info.source === "trigger" || nextOpen) {
                    setOpenFilter(nextOpen);
                }
            }}
            overlayClassName="tbl-dropdown-filter"
            dropdownAlign={{ offset: [0, 0] }}
        >
            <Button
                className="tbl-btn-dropdown-filter"
                icon={<FontAwesomeIcon icon={faFilterList} />}
            >
                Filter
            </Button>
        </Dropdown>
    );
};
