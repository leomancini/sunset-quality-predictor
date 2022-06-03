window.data = {
    mode: 'rating',
    displayType: 'animated',
    currentImage: null,
    cleanedSunsetTimestamp: null,
    intervalID: null
};

async function load() {
    observeImagesContainerHeight();

    window.data.currentIndex = 108;
    window.data.availableDates = await getAvailableDates();
    
    hideCurrentImage();
    await showImagesForNextDate();

    handleOptionSwitcher();
    handleStarRating();
}

load();