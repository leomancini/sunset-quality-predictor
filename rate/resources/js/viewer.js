async function getInfoForDate(options) {
    let pathToServerFunctions = '..';

    if (window.data.mode === 'viewer') {
        pathToServerFunctions = '../sunset-quality-predictor';
    }

    let optionsString = new URLSearchParams(options).toString();
    let response = await fetch(`${pathToServerFunctions}/generateCompositeSunsetImage.php?${optionsString}`);
    let data = await response.json();

    return data;
}

async function reload() {
    hideCurrentImage();

    const inputDate = window.location.hash.split('#').join('');

    await showAnimatedAndGridImagesForDate(inputDate);
}

async function showAnimatedAndGridImagesForDate(date) {
    let infoForDate_ForAnimated = await getInfoForDate({
        date,
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
        date,
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
}

function showImagesForDate(data) {
    window.data.currentImage = data.info;
    window.data.cleanedSunsetTimestamp = cleanTimestamp(window.data.currentImage.sunsetTimestamp);

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

        if (imagesLoadedCount >= imagesElement.childNodes.length) {
            if (window.data.displayType === 'animated' && data.displayType === 'animated') {
                startImageAnimation({
                    speed: 50,
                    imagesElement
                });

                showCurrentImage(imagesElement);
            } else if (window.data.displayType === 'grid' && data.displayType === 'grid') {
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

        if (window.data.mode == 'rating') {
            starsContainer.classList.add('interactive');
            starsContainer.classList.add('visible');

            [].forEach.call(starsContainer.children, function(star) {
                star.classList.remove('hover');
                star.classList.remove('selected');
            });
        }

        updateDateLabel();
    }, 700);
}

function hideCurrentImage() {
    dateLabelElement.classList.remove('visible');

    loadingSpinner.classList.remove('loaded');

    document.querySelector('#animatedImages').classList.remove('visible');
    document.querySelector('#gridImages').classList.remove('visible');
}

function updateDateLabel() {
    const date = window.data.cleanedSunsetTimestamp.dateObject.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    dateLabelElement.classList.add('visible');
    dateLabelElement.innerText = date;;
}

function startImageAnimation(options) {
    if (window.data.intervalID) {
        clearInterval(window.data.intervalID);
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

    window.data.intervalID = setInterval(loop, options.speed);
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
        window.data.displayType = 'animated';
        gridImages.classList.remove('visible');

        setTimeout(function() {
            animatedImages.classList.add('visible');
        }, 700);
    } else if (type === 'grid') {
        window.data.displayType = 'grid';
        animatedImages.classList.remove('visible');

        setTimeout(function() {
            gridImages.classList.add('visible');
        }, 700);
    }
}

function observeImagesContainerHeight() {
    let margin = 28;
    let contentWidth = Math.min(parseInt(window.innerWidth - (margin * 2)), 1024); 
    let imageHeight = contentWidth / 1920 * 1080;

    document.querySelector('#imagesContainer').style.height = `${imageHeight}px`;
}

function cleanTimestamp(timestamp) {
    // Clean up timestamp so it's read correctly in all browsers, mostly for iOS Safari
    const inputTimestampComponents = window.data.currentImage.sunsetTimestamp.split(/[-T.]/);
    const dateObject = new Date(inputTimestampComponents.slice(0, 3).join('/') + ' ' + inputTimestampComponents[3]);
    const ISOString = dateObject.toISOString();

    return {
        dateObject,
        ISOString
    };
}

window.onresize = observeImagesContainerHeight;
window.onhashchange = reload;

const dateLabelElement = document.querySelector('h1');
const loadingSpinner = document.querySelector('#loading');