import React, { useEffect } from 'react';

const PreventDragRightClick = () => {
  useEffect(() => {
    // Prevent right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Prevent dragging images and other elements
    const handleDragStart = (e) => {
      if (e.target.nodeName === 'IMG' || 
          e.target.classList.contains('prevent-drag') ||
          e.target.closest('.prevent-drag')) {
        e.preventDefault();
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);

    // Add draggable="false" attribute to all images
    const applyNoDragToImages = () => {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        img.setAttribute('draggable', 'false');
        // Additional protection with CSS
        img.style.webkitUserDrag = 'none';
        img.style.userDrag = 'none';
        img.style.userSelect = 'none';
        img.style.webkitUserSelect = 'none';
      });
    };

    // Apply initially
    applyNoDragToImages();

    // Apply when DOM changes (for dynamically loaded images)
    const observer = new MutationObserver(applyNoDragToImages);
    observer.observe(document.body, { 
      childList: true,
      subtree: true 
    });

    // Clean up event listeners and observer
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      observer.disconnect();
    };
  }, []);

  return null; // This component doesn't render anything
};

export default PreventDragRightClick; 