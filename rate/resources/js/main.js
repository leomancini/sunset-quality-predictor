async function getAvailableDates() {
    let response = await fetch('../getAvailableDates.php');
    let data = await response.json();

    return data;
}

async function getInfoForDate(options) {
    let optionsString = new URLSearchParams(options).toString();
    let response = await fetch(`../generateCompositeSunsetImage.php?${optionsString}`);
    let data = await response.json();

    return data;
}

async function load() {
    observeImagesContainerHeight();

    window.availableDates = await getAvailableDates();
    
    hideCurrentImage();
    await showImagesForRandomDate();

    handleOptionSwitcher();
    handleStarRating();
}

async function showImagesForRandomDate() {
    if (window.availableDates.length > 0) {
        let randomAvailableDate = window.availableDates[Math.floor(Math.random() * window.availableDates.length)];
    
        window.availableDates = window.availableDates.filter(function(value) {
            return value !== randomAvailableDate;
        });
    
        let infoForDate_ForAnimated = await getInfoForDate({
            date: randomAvailableDate,
            output: 'JSON',
            beforePeriod: '-30 minutes',
            beforeInterval: '1 minutes',
            afterPeriod: '+30 minutes',
            afterInterval: '1 minutes'
        });
    
        showImagesForDate({
            info: infoForDate_ForAnimated,
            displayType: 'animated'
        });
    
        let infoForDate_ForGrid = await getInfoForDate({
            date: randomAvailableDate,
            output: 'JSON',
            beforePeriod: '-12 minutes',
            beforeInterval: '2 minutes',
            afterPeriod: '+30 minutes',
            afterInterval: '5 minutes'
        });
    
        showImagesForDate({
            info: infoForDate_ForGrid,
            displayType: 'grid'
        });
    } else {
        loadingSpinner.classList.add('loaded');

        document.querySelector('#animatedImages').classList.remove('visible');
        document.querySelector('#gridImages').classList.remove('visible');
        
        setTimeout(function() {
            alert("Nice! You've rated all the available sunsets! Refresh to rate again or wait for the sun to set again to see new images.");
        }, 500);
    }
}

function cleanTimestamp(timestamp) {
    // Clean up timestamp so it's read correctly in all browsers, mostly for iOS Safari
    const inputTimestampComponents = window.currentImage.sunsetTimestamp.split(/[-T.]/);
    const dateObject = new Date(inputTimestampComponents.slice(0, 3).join('/') + ' ' + inputTimestampComponents[3]);
    const ISOString = dateObject.toISOString();

    return {
        dateObject,
        ISOString
    };
}

function showImagesForDate(data) {
    window.currentImage = data.info;
    window.cleanedSunsetTimestamp = cleanTimestamp(window.currentImage.sunsetTimestamp);

    const imagesElement = document.querySelector(`#${data.displayType}Images`);

    let imageIndex = 0;
    
    while (imagesElement.firstChild) {
        imagesElement.removeChild(imagesElement.firstChild);
    }

    data.info.sunsetRangeTimes.forEach(time => {
        let imageElement = document.createElement('img');
        imageElement.src = `../../nest-cam-timelapse/images/SKYLINE/${time}.jpg`;
        imageElement.id = `image-${imageIndex}`;

        imagesElement.appendChild(imageElement);

        imageIndex++;
    });

    let imagesLoadedCount = 0;

    [].forEach.call(imagesElement.childNodes, function(image) {
        if (image.complete) {
            handleLoadedImage(); 
        } else {
            image.addEventListener('load', handleLoadedImage, false);
            image.addEventListener('error', handleFailedImage, image);
        }
    });

    function handleLoadedImage() {
        imagesLoadedCount++;

        if (imagesLoadedCount === imagesElement.childNodes.length) {
            if (window.state.displayType === 'animated' && data.displayType === 'animated') {
                startImageAnimation({
                    speed: 50,
                    imagesElement
                });

                showCurrentImage(imagesElement);
            } else if (window.state.displayType === 'grid' && data.displayType === 'grid') {
                showCurrentImage(imagesElement);
            }
        }
    }

    function handleFailedImage(image) {
        imagesLoadedCount++;

        imagesElement.querySelector(`img#${image.srcElement.getAttribute('id')}`).remove();
    }
}

function showCurrentImage(imagesElement) {
    setTimeout(function() {
        imagesElement.classList.add('visible');
        loadingSpinner.classList.add('loaded');
        starsContainer.classList.add('interactive');

        [].forEach.call(starsContainer.children, function(star) {
            star.classList.remove('hover');
            star.classList.remove('selected');
        });

        updateDateLabel();
    }, 500);
}

function hideCurrentImage() {
    dateLabelElement.classList.remove('visible');

    loadingSpinner.classList.remove('loaded');

    document.querySelector('#animatedImages').classList.remove('visible');
    document.querySelector('#gridImages').classList.remove('visible');
}

function updateDateLabel() {
    const date = window.cleanedSunsetTimestamp.dateObject.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    dateLabelElement.classList.add('visible');
    dateLabelElement.innerText = date;;
}

function startImageAnimation(options) {
    if (window.intervalID) {
        clearInterval(intervalID);
    }

    let visibleImageIndex = 0;

    function loop() {
        hiddenImagesIndex = 0;

        while (hiddenImagesIndex < options.imagesElement.childNodes.length) {
            if (options.imagesElement.childNodes[hiddenImagesIndex]) {
                options.imagesElement.childNodes[hiddenImagesIndex].style.opacity = 0;
            }
            hiddenImagesIndex++;
        }
        
        if (options.imagesElement.childNodes[visibleImageIndex]) {
            options.imagesElement.childNodes[visibleImageIndex].style.opacity = 1;
        }

        if (visibleImageIndex >= options.imagesElement.childNodes.length - 1) {
            visibleImageIndex = 0;
        } else {
            visibleImageIndex++;
        }
    }

    window.intervalID = setInterval(loop, options.speed);
};

function handleOptionSwitcher() {
    let optionSwitcher = document.querySelector('#optionSwitcher');

    [].forEach.call(optionSwitcher.children, function(option) {
        option.onclick = () => {
            switchDisplayType(option.innerText.toLowerCase());

            [].forEach.call(optionSwitcher.children, function(option) {
                option.classList.remove('selected');
            });

            option.classList.add('selected');
        }
    });
}

function switchDisplayType(type) {
    const animatedImages = document.querySelector('#animatedImages');
    const gridImages = document.querySelector('#gridImages');

    if (type === 'animated') {
        window.state.displayType = 'animated';
        gridImages.classList.remove('visible');

        setTimeout(function() {
            animatedImages.classList.add('visible');
        }, 200);
    } else if (type === 'grid') {
        window.state.displayType = 'grid';
        animatedImages.classList.remove('visible');

        setTimeout(function() {
            gridImages.classList.add('visible');
        }, 200);
    }
}

async function handleStarRating() {
    [].forEach.call(starsContainer.children, function(star) {
        star.onmouseover = () => {
            let hoveredRating = star.dataset.rating;

            [].forEach.call(starsContainer.children, function(star) {
                star.classList.remove('hover');
            });

            [].forEach.call(starsContainer.children, function(star) {
                if (star.dataset.rating <= hoveredRating) {
                    star.classList.add('hover');
                }
            });
        }

        star.onclick = async () => {
            let clickedRating = star.dataset.rating;

            hideCurrentImage();

            [].forEach.call(starsContainer.children, function(star) {
                if (star.dataset.rating <= clickedRating) {
                    star.classList.remove('hover');
                    star.classList.add('selected');
                }
            });

            await saveRating(clickedRating);

            showImagesForRandomDate();

            setTimeout(function() {
                starsContainer.classList.remove('interactive');
            }, 300);
        };
    });
}

async function saveRating(rating) {
    const ratingInfo = {
        sunsetTimestamp: window.cleanedSunsetTimestamp.ISOString,
        displayType: window.state.displayType.charAt(0).toUpperCase() + window.state.displayType.slice(1),
        rating
    };
    
    await fetch('resources/helpers/saveRating.php', {
        method: 'POST',
        mode: 'same-origin',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ratingInfo)
    });
}

function observeImagesContainerHeight() {
    let margin = 28;
    let contentWidth = Math.min(parseInt(window.innerWidth - (margin * 2)), 1024); 
    let imageHeight = contentWidth / 1920 * 1080;

    document.querySelector('#imagesContainer').style.height = `${imageHeight}px`;
}

window.onresize = () => {
    observeImagesContainerHeight();
}

window.state = {
    displayType: 'animated'
};

const dateLabelElement = document.querySelector('h1');
const loadingSpinner = document.querySelector('#loading');
const starsContainer = document.querySelector('#starsContainer');

load();