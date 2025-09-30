import PageProfileContext from "./PageProfileContext";
import CustomTabs from "../../../../providers/CustomTabs";

export default function ProfileEmployeeContent() {
    const onChangeTable = () => {};

    return (
        <PageProfileContext.Provider
            value={{
                dataSource: [],
                onChangeTable,
            }}
        >
            <CustomTabs
                items={[
                    {
                        key: "Parish Priests",
                        label: "Parish Priests",
                        children: <></>,
                    },
                    {
                        key: "Parochial Vicar",
                        label: "Parochial Vicar",
                        children: <></>,
                    },
                    {
                        key: "Resident Priest",
                        label: "Resident Priest",
                        children: <></>,
                    },
                    {
                        key: "Priest with Special Assignment",
                        label: "Priest with Special Assignment",
                        children: <></>,
                    },
                    {
                        key: "Regular Parish Vicar",
                        label: "Regular Parish Vicar",
                        children: <></>,
                    },
                    {
                        key: "Deacons",
                        label: "Deacons",
                        children: <></>,
                    },
                ]}
            />
        </PageProfileContext.Provider>
    );
}
