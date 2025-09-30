// Global loading utility functions
export const showGlobalLoading = () => {
    const attemptShow = () => {
        const globalLoading = document.querySelector(".globalLoading");
        if (globalLoading) {
            globalLoading.classList.remove("hidden");
            return true;
        }
        return false;
    };

    // Try immediately
    if (!attemptShow()) {
        // If not found, try again after DOM updates
        setTimeout(() => {
            if (!attemptShow()) {
                // Last attempt after a longer delay
                setTimeout(attemptShow, 50);
            }
        }, 10);
    }
};

export const hideGlobalLoading = () => {
    const attemptHide = () => {
        const globalLoading = document.querySelector(".globalLoading");
        if (globalLoading && !globalLoading.matches(".hidden")) {
            globalLoading.classList.add("hidden");
            return true;
        }
        return false;
    };

    // Try immediately
    if (!attemptHide()) {
        // If not found, try again after DOM updates
        setTimeout(() => {
            if (!attemptHide()) {
                // Last attempt after a longer delay
                setTimeout(attemptHide, 50);
            }
        }, 10);
    }
};

// Ensure global loading element exists and is properly initialized
export const ensureGlobalLoadingExists = () => {
    let globalLoading = document.querySelector(".globalLoading");
    
    if (!globalLoading) {
        // Create the global loading element if it doesn't exist
        globalLoading = document.createElement("div");
        globalLoading.className = "globalLoading hidden";
        globalLoading.innerHTML = '<div class="loader">Loading...</div>';
        
        // Append to body as fallback
        document.body.appendChild(globalLoading);
    }
    
    return globalLoading;
};