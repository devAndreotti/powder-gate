/**
 * Carousel functionality for video recommendations.
 * Supports responsive item sizing, drag and keyboard navigation.
 */
document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('.video-grid');
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');
    const items = carousel.querySelectorAll('.video-item');
    
    let currentIndex = 0;
    let isDragging = false;
    let startPosition = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationFrameId = null;

    // Calculate how many items should be visible based on container width
    function calculateVisibleItems() {
        const containerWidth = window.innerWidth;
        if (containerWidth <= 480) return 1;
        if (containerWidth <= 768) return 1;
        if (containerWidth <= 950) return 1;
        if (containerWidth <= 1200) return 2;
        if (containerWidth <= 1500) return 2;
        if (containerWidth <= 1800) return 2;
        return 3;
    }

    // Calculate ideal width for each item
    function calculateItemWidth() {
        const visibleItems = calculateVisibleItems();
        const containerWidth = carousel.parentElement.offsetWidth;
        const gap = window.innerWidth <= 768 ? 16 : 64; // Smaller gap on mobile
        const containerPadding = window.innerWidth <= 768 ? 16 : 48; // Smaller padding on mobile
        
        // Subtract total padding and gaps before dividing
        const availableWidth = containerWidth - containerPadding - (gap * (visibleItems - 1));
        return Math.max(200, availableWidth / visibleItems); // Minimum width of 200px
    }

    // Update item sizes
    function updateItemSizes() {
        const newWidth = calculateItemWidth();
        const gap = window.innerWidth <= 768 ? 16 : 64;
        
        items.forEach(item => {
            item.style.width = `${newWidth}px`;
            item.style.flex = `0 0 ${newWidth}px`;
            // Maintain 16:9 aspect ratio
            const height = (newWidth * 9) / 16;
            item.style.height = `${height}px`;
        });
        
        // Update gap in CSS
        carousel.style.gap = `${gap}px`;
    }

    // Apply translation to carousel
    function setTranslate(xPos) {
        carousel.style.transform = `translateX(${xPos}px)`;
    }

    // Animate drag movement using requestAnimationFrame for smoothness
    function animate() {
        setTranslate(currentTranslate);
        if (isDragging) {
            animationFrameId = requestAnimationFrame(animate);
        }
    }

    // Update carousel position and button visibility
    function updateCarousel() {
        const visibleItems = calculateVisibleItems();
        const itemWidth = calculateItemWidth();
        const gap = window.innerWidth <= 768 ? 16 : 64;
        const maxIndex = Math.max(0, items.length - visibleItems);
        
        // Clamp current index
        currentIndex = Math.min(currentIndex, maxIndex);
        currentIndex = Math.max(0, currentIndex);
        
        // Calculate new position
        currentTranslate = -currentIndex * (itemWidth + gap);
        
        // Apply transform
        setTranslate(currentTranslate);
        
        // Update button visibility
        if (prevButton && nextButton) {
            prevButton.style.display = currentIndex <= 0 ? 'none' : 'flex';
            nextButton.style.display = currentIndex >= maxIndex ? 'none' : 'flex';
        }
    }

    // Move carousel to previous item
    function movePrev() {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    }

    // Move carousel to next item
    function moveNext() {
        const visibleItems = calculateVisibleItems();
        if (currentIndex < items.length - visibleItems) {
            currentIndex++;
            updateCarousel();
        }
    }

    // Get X position from mouse or touch event
    function getPositionX(e) {
        return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    }

    // Start dragging
    function dragStart(e) {
        isDragging = true;
        startPosition = getPositionX(e);
        prevTranslate = currentTranslate;
        carousel.style.cursor = 'grabbing';
        carousel.style.transition = 'none';
        animationFrameId = requestAnimationFrame(animate);
    }

    // During dragging
    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();
        const currentPosition = getPositionX(e);
        currentTranslate = prevTranslate + currentPosition - startPosition;
    }

    // End dragging
    function dragEnd() {
        if (!isDragging) return;
        isDragging = false;
        carousel.style.cursor = 'grab';
        carousel.style.transition = 'transform 0.3s ease-out';
        cancelAnimationFrame(animationFrameId);
        
        const itemWidth = calculateItemWidth();
        const gap = window.innerWidth <= 768 ? 16 : 64;
        const visibleItems = calculateVisibleItems();
        const maxIndex = items.length - visibleItems;
        
        // Calculate movement threshold (30% of item width)
        const moveThreshold = itemWidth * 0.3;
        const movedDistance = currentTranslate - prevTranslate;
        
        if (Math.abs(movedDistance) > moveThreshold) {
            if (movedDistance > 0 && currentIndex > 0) {
                currentIndex--;
            } else if (movedDistance < 0 && currentIndex < maxIndex) {
                currentIndex++;
            }
        }
        
        updateCarousel();
    }

    // Touch event handlers for mobile
    function handleTouchStart(e) {
        dragStart(e);
    }

    function handleTouchMove(e) {
        drag(e);
    }

    function handleTouchEnd(e) {
        dragEnd();
    }

    // Event Listeners
    if (prevButton) prevButton.addEventListener('click', movePrev);
    if (nextButton) nextButton.addEventListener('click', moveNext);
    
    // Mouse events
    carousel.addEventListener('mousedown', dragStart);
    carousel.addEventListener('mousemove', drag);
    carousel.addEventListener('mouseup', dragEnd);
    carousel.addEventListener('mouseleave', dragEnd);
    
    // Touch events for mobile
    carousel.addEventListener('touchstart', handleTouchStart, { passive: false });
    carousel.addEventListener('touchmove', handleTouchMove, { passive: false });
    carousel.addEventListener('touchend', handleTouchEnd);
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') movePrev();
        if (e.key === 'ArrowRight') moveNext();
    });

    // Initialization and responsiveness
    updateItemSizes();
    updateCarousel();
    
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateItemSizes();
            updateCarousel();
        }, 250);
    });
    
    // Prevent context menu on long press for mobile
    carousel.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
});
