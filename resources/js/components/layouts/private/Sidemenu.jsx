import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout, Menu, Typography } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";

import { appName, appLogoFullWidth } from "../../providers/appConfig";
import { adminSideMenu } from "./components/SideMenuList";

export default function Sidemenu(props) {
    const {
        location,
        sideMenuCollapse,
        setSideMenuCollapse,
        width,
        menuItems,
        // dataPermissions,
    } = props;

    const [openKeys, setOpenKeys] = useState();

    let pathname = location.pathname;
    pathname = pathname.split("/");
    pathname = "/" + pathname[1];

    useEffect(() => {
        setOpenKeys(
            menuItems
                .filter((item) => item.path === pathname)
                .map((item) => item.path)
        );
    }, [pathname, menuItems]);

    const onOpenChange = (keys) => {
        const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
        const menuItemsFilter = menuItems
            .filter((item) => item.path === latestOpenKey)
            .map((item) => item.path);

        if (menuItemsFilter.indexOf(latestOpenKey) === -1) {
            setOpenKeys(menuItemsFilter);
        } else {
            setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
        }
    };

    // const handleCheckPermission = (moduleCode) => {
    //     let checkPermissions = dataPermissions.filter(
    //         (f) =>
    //             f.module_code === moduleCode &&
    //             f.module_buttons.filter(
    //                 (f2) =>
    //                     f2.mod_button_code === "view_page" &&
    //                     parseInt(f2.status) === 1
    //             ).length > 0
    //     );
    //     return checkPermissions.length > 0 ? true : false;
    // };

    const activeRoute = (routeName) => {
        const pathname = location.pathname;
        return pathname === routeName ? "ant-menu-item-selected" : "";
    };

    const activeSubRoute = (routeName) => {
        const pathname1 = location.pathname.split("/");
        const pathname2 = routeName.split("/");
        return "/" + pathname1[1] + "/" + pathname1[2] ===
            "/" + pathname2[1] + "/" + pathname2[2]
            ? "ant-menu-item-selected"
            : "";
    };

    const handleMenuRender = () => {
        let items = [];

        menuItems.forEach((item, index) => {
            if (item.type === "divider") {
                items.push({
                    type: "divider",
                    key: item.key,
                });
                return "";
            }
            
            if (item.children && item.children.length > 0) {
                let children_list = [];

                item.children.forEach((item2) => {
                    let link = "";

                    if (item2.targetNew === 1) {
                        link = (
                            <Typography.Link
                                target="new"
                                href={window.location.origin + item2.path}
                            >
                                {item2.title ?? item2.permission}
                            </Typography.Link>
                        );
                    } else {
                        link = (
                            <Link to={item2.path}>
                                {item2.title ?? item2.permission}
                            </Link>
                        );
                    }

                    // if (handleCheckPermission(item2.moduleCode)) {
                    children_list.push({
                        key: item2.path,
                        className: activeSubRoute(item2.path),
                        label: link,
                        onClick: () => {
                            if (width < 768) {
                                setSideMenuCollapse(true);
                            }
                        },
                    });
                    // }

                    return "";
                });

                if (children_list.length > 0) {
                    items.push({
                        key: item.path,
                        icon: item.icon,
                        label: item.title,
                        className: item.className ?? "",
                        children: children_list,
                    });
                    return "";
                }
            } else {
                let link = "";

                if (item.targetNew === 1) {
                    link = (
                        <Typography.Link
                            target="new"
                            href={window.location.origin + item.path}
                        >
                            {item.title ?? item.permission}
                        </Typography.Link>
                    );
                } else {
                    link = (
                        <Link
                            onClick={() => {
                                setOpenKeys([]);
                            }}
                            to={item.path}
                        >
                            {item.title ?? item.permission}
                        </Link>
                    );
                }

                // if (handleCheckPermission(item.moduleCode)) {
                items.push({
                    key: item.path,
                    icon: item.icon,
                    label: link,
                    className:
                        activeRoute(item.path) + " " + (item.className ?? ""),
                    id: item.id,
                    onClick: () => {
                        if (width < 768) {
                            setSideMenuCollapse(true);
                        }
                    },
                });
                // }
            }
        });

        return items;
    };

    return (
        <Layout.Sider trigger={null} collapsible collapsed={sideMenuCollapse}>
            <div className="ant-side-header">
                <MenuUnfoldOutlined
                    id="btn_sidemenu_collapse_unfold"
                    onClick={() => {
                        setSideMenuCollapse(false);
                        setTimeout(() => {
                            setOpenKeys(
                                menuItems
                                    .filter((item) => item.path === pathname)
                                    .map((item) => item.path)
                            );
                        }, 200);
                    }}
                    style={{ display: sideMenuCollapse ? "block" : "none" }}
                />
                <MenuFoldOutlined
                    id="btn_sidemenu_collapse_fold"
                    onClick={() => {
                        setSideMenuCollapse(true);
                    }}
                    style={{ display: !sideMenuCollapse ? "block" : "none" }}
                />

                <div className="logo_wrapper">
                    {!sideMenuCollapse && (
                        <img
                            src={appLogoFullWidth}
                            alt={appName}
                            width="150px"
                        />
                    )}
                </div>
            </div>

            <Menu
                theme="light"
                mode="inline"
                openKeys={openKeys}
                selectedKeys={[pathname]}
                onOpenChange={onOpenChange}
                items={handleMenuRender()}
            />
        </Layout.Sider>
    );
}
