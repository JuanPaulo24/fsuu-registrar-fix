import { useMutation, useQuery, useQueryClient } from "react-query";
import axios from "axios";

import { apiUrl, token } from "./appConfig";
import { showGlobalLoading, hideGlobalLoading, ensureGlobalLoadingExists } from "./globalLoading";

export function POST(
    url,
    key_name,
    isLoading = true,
    onSuccessFunction,
    onProgress,
) {
    const queryClient = useQueryClient();
    
    return useMutation(
        async (data) => {
            if (isLoading) {
                ensureGlobalLoadingExists();
                showGlobalLoading();
            }
            
            return await axios
                .post(apiUrl(url), data, {
                    headers: {
                        Authorization: token(),
                    },
                    onUploadProgress: (progressEvent) => {
                        let percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        if (onProgress) onProgress(percentCompleted);
                    },
                })
                .then((res) => res.data);
        },
        {
            onSuccess: (data) => {
                if (onSuccessFunction) {
                    onSuccessFunction(data);
                }
                
                if (key_name) {
                    if (typeof key_name === "string") {
                        queryClient.refetchQueries(key_name);
                    } else {
                        key_name.forEach((name) => {
                            queryClient.refetchQueries(name);
                        });
                    }
                }

                hideGlobalLoading();
            },
            onError: (error) => {
                console.error('POST request failed:', error);
                hideGlobalLoading();
            },
        }
    );
}

export function UPDATE(
    url,
    key_name,
    isLoading = true,
    onSuccessFunction,
    onProgress
) {
    const queryClient = useQueryClient();

    return useMutation(
        async (data) => {
            if (isLoading) {
                ensureGlobalLoadingExists();
                showGlobalLoading();
            }
            return await axios
                .put(apiUrl(`${url}/${data.id}`), data, {
                    headers: {
                        Authorization: token(),
                    },
                    onUploadProgress: (progressEvent) => {
                        let percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        if (onProgress) onProgress(percentCompleted);
                    },
                })
                .then((res) => res.data);
        },
        {
            onSuccess: () => {
                if (onSuccessFunction) onSuccessFunction();
                // console.log(key_name);
                if (key_name) {
                    if (typeof key_name === "string") {
                        queryClient.refetchQueries(key_name);
                    } else {
                        key_name.forEach((name) => {
                            queryClient.refetchQueries(name);
                        });
                    }
                }

                hideGlobalLoading();
            },
            onError: () => {
                hideGlobalLoading();
            },
        }
    );
}

export function DELETE(
    url,
    key_name,
    isLoading = true,
    onSuccessFunction,
    onProgress
) {
    const queryClient = useQueryClient();

    return useMutation(
        async (data) => {
            if (isLoading) {
                let globalLoading = document.querySelector(".globalLoading");
                if (globalLoading) {
                    globalLoading.classList.remove("hide");
                }
            }
            return await axios
                .delete(apiUrl(`${url}/${data.id}`), {
                    headers: {
                        Authorization: token(),
                    },
                    onUploadProgress: (progressEvent) => {
                        let percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        if (onProgress) onProgress(percentCompleted);
                    },
                })
                .then((res) => res.data);
        },
        {
            onSuccess: () => {
                if (onSuccessFunction) onSuccessFunction();
                if (key_name) {
                    if (typeof key_name === "string") {
                        queryClient.refetchQueries(key_name);
                    } else {
                        key_name.forEach((name) => {
                            queryClient.refetchQueries(name);
                        });
                    }
                }

                hideGlobalLoading();
            },
            onError: () => {
                hideGlobalLoading();
            },
        }
    );
}

export function GET(url, key_name, onSuccessOrOptions, isLoading = true) {
    // Handle both old signature and new options-based signature
    let onSuccessFunction = null;
    let additionalOptions = {};
    
    if (typeof onSuccessOrOptions === 'function') {
        // Old signature: GET(url, key_name, onSuccessFunction, isLoading)
        onSuccessFunction = onSuccessOrOptions;
    } else if (typeof onSuccessOrOptions === 'object' && onSuccessOrOptions !== null) {
        // New signature: GET(url, key_name, options)
        const { onSuccess, enabled, ...otherOptions } = onSuccessOrOptions;
        onSuccessFunction = onSuccess;
        additionalOptions = { enabled, ...otherOptions };
        
        // If options object is passed, isLoading might be in the options
        if (onSuccessOrOptions.isLoading !== undefined) {
            isLoading = onSuccessOrOptions.isLoading;
        }
    }

    return useQuery(
        key_name || ['disabled_query', Math.random()],
        async () => {
            if (isLoading) {
                ensureGlobalLoadingExists();
                showGlobalLoading();
            }
            return await axios
                .get(apiUrl(url), {
                    headers: {
                        Authorization: token(),
                    },
                })
                .then((res) => res.data);
        },
        {
            enabled: !!url && additionalOptions.enabled !== false, // Only enable if url exists
            retry: 1,
            retryDelay: 500,
            fetchOnWindowFocus: false,
            refetchOnWindowFocus: false,
            onSuccess: (res) => {
                if (onSuccessFunction) onSuccessFunction(res);

                hideGlobalLoading();
            },
            onError: () => {
                hideGlobalLoading();
            },
            ...additionalOptions, // Spread additional options like 'enabled'
        }
    );
}

export function GETMANUAL(url, key_name, onSuccessFunction, isLoading = true) {
    return useQuery(
        key_name,
        () => {
            if (isLoading) {
                ensureGlobalLoadingExists();
                showGlobalLoading();
            }
            return axios
                .get(apiUrl(url), {
                    headers: {
                        Authorization: token(),
                    },
                })
                .then((res) => res.data);
        },
        {
            enabled: false,
            retry: 1,
            retryDelay: 500,
            fetchOnWindowFocus: false,
            refetchOnWindowFocus: false,
            onSuccess: (res) => {
                if (onSuccessFunction) onSuccessFunction(res);

                hideGlobalLoading();
            },
            onError: () => {
                hideGlobalLoading();
            },
        }
    );
}

// Public GET function - no authentication required
export function GET_PUBLIC(url, key_name, onSuccessFunction, isLoading = true) {
    return useQuery(
        key_name,
        async () => {
            if (isLoading) {
                ensureGlobalLoadingExists();
                showGlobalLoading();
            }
            return await axios
                .get(apiUrl(url))
                .then((res) => res.data);
        },
        {
            retry: 1,
            retryDelay: 500,
            fetchOnWindowFocus: false,
            refetchOnWindowFocus: false,
            onSuccess: (res) => {
                if (onSuccessFunction) onSuccessFunction(res);

                hideGlobalLoading();
            },
            onError: () => {
                hideGlobalLoading();
            },
        }
    );
}

// Public POST function - no authentication required
export function POST_PUBLIC(
    url,
    key_name,
    isLoading = true,
    onSuccessFunction,
    onProgress,
) {
    const queryClient = useQueryClient();
    return useMutation(
        async (data) => {
            if (isLoading) {
                let globalLoading = document.querySelector(".globalLoading");
                if (globalLoading) {
                    globalLoading.classList.remove("globalLoading");
                }
            }
            // Create config without Authorization header for public endpoints
            const config = {
                onUploadProgress: (progressEvent) => {
                    let percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    if (onProgress) onProgress(percentCompleted);
                },
            };
            
            // Create a new axios instance without default headers for this request
            const publicAxios = axios.create();
            return await publicAxios.post(apiUrl(url), data, config)
                .then((res) => res.data);
        },
        {
            onSuccess: (data) => {
                if (onSuccessFunction) onSuccessFunction(data);
                if (key_name) {
                    if (typeof key_name === "string") {
                        queryClient.refetchQueries(key_name);
                    } else {
                        key_name.forEach((name) => {
                            queryClient.refetchQueries(name);
                        });
                    }
                }

            hideGlobalLoading();
            },
            onError: (error) => {
            hideGlobalLoading();
            },
        }
    );
}
