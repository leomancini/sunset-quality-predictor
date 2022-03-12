async function getAvailableDates() {
    let lastDateDownloaded = '2022-03-11';
    let response = await fetch(`../getAvailableDates.php?last_date=${lastDateDownloaded}`);
    let data = await response.json();

    return data;
}

async function showImagesForRandomDate() {
    if (window.data.availableDates.length > 0) {
        let randomAvailableDate = window.data.availableDates[Math.floor(Math.random() * window.data.availableDates.length)];
    
        window.data.availableDates = window.data.availableDates.filter(function(value) {
            return value !== randomAvailableDate;
        });
    
        showAnimatedAndGridImagesForDate(randomAvailableDate);
    } else {
        loadingSpinner.classList.add('loaded');

        document.querySelector('#animatedImages').classList.remove('visible');
        document.querySelector('#gridImages').classList.remove('visible');
        
        setTimeout(function() {
            alert("Nice! You've rated all the available sunsets! Refresh to rate again or wait for the sun to set again to see new images.");
        }, 500);
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

            starsContainer.classList.remove('interactive');

            setTimeout(function() {
                starsContainer.classList.remove('visible');
            }, 300);
        };
    });
}

async function saveRating(rating) {
    const ratingInfo = {
        sunsetTimestamp: window.data.cleanedSunsetTimestamp.ISOString,
        displayType: window.data.displayType.charAt(0).toUpperCase() + window.data.displayType.slice(1),
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

const starsContainer = document.querySelector('#starsContainer');