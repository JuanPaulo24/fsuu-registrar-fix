import { useEffect, useState } from "react";
import packageJson from "../../../../package.json"; // path to your package.json

export const clearCacheData = async () => {
    console.log("Clearing cache");

    if ("caches" in window) {
        caches.keys().then((names) => {
            names.forEach((name) => {
                caches.delete(name);
            });
        });
    }

    try {
        const currentVersion = packageJson.version;
        localStorage.setItem("appVersion", currentVersion);
    } catch (error) {
        console.error("Error fetching version:", error);
    }

    window.location.reload();
};

export default function ClearCache(props) {
    const { children } = props;
    const [isLatestVersion, setIsLatestVersion] = useState(true);

    useEffect(() => {
        const checkForUpdates = async () => {
            try {
                const storedVersion = localStorage.getItem("appVersion");
                const currentVersion = packageJson.version;

                if (!storedVersion) {
                    localStorage.setItem("appVersion", currentVersion);
                } else {
                    if (storedVersion !== currentVersion) {
                        setIsLatestVersion(false);
                    }
                }
            } catch (error) {
                console.error("Error checking for updates:", error);
            }
        };

        checkForUpdates();
    }, []);

    return children({ isLatestVersion, emptyCacheStorage: clearCacheData });
}
