window.data = {
    mode: 'rating',
    displayType: 'animated',
    currentImage: null,
    cleanedSunsetTimestamp: null,
    intervalID: null
};

async function load() {
    observeImagesContainerHeight();

    window.data.availableDates = await getAvailableDates();
    
    hideCurrentImage();
    await showImagesForRandomDate();

    handleOptionSwitcher();
    handleStarRating();
}

load();