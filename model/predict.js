import {
    MOBILE_NET_INPUT_SIZE,
    CLASS_NAMES,
    COMPOSITE_IMAGES_PATH
} from './variables.js'

import { updateStatus, formatDate } from './functions.js';
import { publishPrediction } from './publish.js';;

export async function makePrediction() {
    let dateInput = window.location.hash.split('#').join('');
    let date;

    if (dateInput === 'today') {
        let today = new Date();

        date = formatDate(today);
    } else {
        date = dateInput;
    }

    const compositeImageForPrediction = new Image();
    const compositeImageURL = `${COMPOSITE_IMAGES_PATH}${date}.jpg`;
    compositeImageForPrediction.src = compositeImageURL;

    updateStatus(`Checking for composite image for ${date}...`);

    compositeImageForPrediction.onload = async () => {
        updateStatus(`Found existing composite image for ${date}...`);
        getPredictionFromModel(date, compositeImageURL);
    }

    compositeImageForPrediction.onerror = async () => {
        updateStatus(`Generating composite image for ${date}...`);

        const compositeImageData = await fetch(`../generateAndSaveCompositeImageBeforeSunset.php?date=${date}`);
        const compositeImageResponse = await compositeImageData.json();

        if (compositeImageResponse.success) {
            updateStatus(`Successfully generated composite image for ${date}...`);

            getPredictionFromModel(date, compositeImageURL);
        }
    }
}

async function getPredictionFromModel(date, compositeImageURL) {
    const SAVED_MODELS_URL = 'http://localhost/sunset-quality-predictor/model/savedModels/';
    const LATEST_MODEL = 'sunsetQualityPreidctorModel-2022-05-02T14-37-56-132Z-50-epochs.json';

    try {
        updateStatus('Loading model...');
        window.model = await tf.loadLayersModel(`${SAVED_MODELS_URL}/${LATEST_MODEL}`);
    } finally {
        tf.tidy(function() {
            updateStatus(`Making prediction for ${date}...`);

            const compositeImageForPrediction = new Image();
            compositeImageForPrediction.src = compositeImageURL;

            compositeImageForPrediction.onload = async () => {
                let imageAsTensor = tf.browser.fromPixels(compositeImageForPrediction).div(255);
                let resizedTensorFrame = tf.image.resizeBilinear(
                    imageAsTensor,
                    [MOBILE_NET_INPUT_SIZE, MOBILE_NET_INPUT_SIZE],
                    true
                );

                let imageFeatures = window.mobilenet.predict(
                    resizedTensorFrame.expandDims()
                );

                let prediction = window.model.predict(imageFeatures).squeeze();
                let highestIndex = prediction.argMax().arraySync();
                let predictionArray = prediction.arraySync();

                let predictionResult = {
                    date,
                    rating: parseInt(CLASS_NAMES[highestIndex]),
                    confidence: Math.floor(predictionArray[highestIndex] * 100)
                };

                console.log(predictionResult);

                updateStatus(`Sunset on ${date} predicted to be <b>${predictionResult.rating} stars</b> at a ${predictionResult.confidence}% confidence!`);

                await publishPrediction({
                    date,
                    rating: parseInt(CLASS_NAMES[highestIndex]),
                    confidence: Math.floor(predictionArray[highestIndex] * 100),
                    compositeImageURL
                });

                console.log(`http://skyline.noshado.ws/view-sunset/viewer.html#${date}`)
            };

            compositeImageForPrediction.onerror = () => {
                updateStatus(`ERROR: No composite image found for ${date}!`);
            }
        });
    }
}
