import {
    MOBILE_NET_INPUT_SIZE,
    CLASS_NAMES
} from './variables.js';

import { updateStatus } from './functions.js';

export async function trainAndSaveModel() {
    updateStatus('Training model...');

    tf.util.shuffleCombo(window.trainingDataInputs, window.trainingDataOutputs);
    let outputsAsTensor = tf.tensor1d(window.trainingDataOutputs, 'int32');
    let oneHotOutputs = tf.oneHot(outputsAsTensor, CLASS_NAMES.length);
    let inputsAsTensor = tf.stack(window.trainingDataInputs);

    await window.model.fit(inputsAsTensor, oneHotOutputs, {
        shuffle: true,
        batchSize: 5,
        epochs: 50,
        callbacks: { onEpochEnd: logTrainingProgress },
    });

    outputsAsTensor.dispose();
    oneHotOutputs.dispose();
    inputsAsTensor.dispose();

    saveModel();
}

async function getSunsetsWithRatings() {
    const sunsetsWithRatingsData = await fetch('../functions/getAverageRatingsForCompositeImages.php');
    const sunsetsWithRatings = await sunsetsWithRatingsData.json();

    return sunsetsWithRatings;
}

export async function gatherData() {
    updateStatus('Getting ratings from Airtable...');
    
    const sunsetsWithRatings = await getSunsetsWithRatings();

    updateStatus('Setting ratings...');

    for (let sunset in sunsetsWithRatings) {
        let rating = parseInt(sunsetsWithRatings[sunset]);
        let ratingClass = rating - 1;

        gatherDataForClass(sunset, ratingClass);
    }
}

function logTrainingProgress(epoch, logs) {
    updateStatus(`Epoch ${epoch}`);

    console.log('Data for epoch ' + epoch, logs);
}

async function saveModel() {
    updateStatus('Saving model...');

    let today = new Date();
    let timestamp = today.toISOString().split(':').join('-').split('.').join('-');

    await window.model.save(`downloads://sunsetQualityPreidctorModel-${timestamp}`);

    updateStatus('Model trained and saved! Ready to use!');
}

function gatherDataForClass(filename, classNumber) {
    const image = new Image();
    image.src = `trainingData/${filename}.jpg`;
    image.onload = () => {
        let imageFeatures = tf.tidy(function () {
            let imageAsTensor = tf.browser.fromPixels(image);
            let resizedTensorFrame = tf.image.resizeBilinear(
                imageAsTensor,
                [MOBILE_NET_INPUT_SIZE, MOBILE_NET_INPUT_SIZE],
                true
            );
            
            let normalizedTensorFrame = resizedTensorFrame.div(255);

            return window.mobilenet
                .predict(normalizedTensorFrame.expandDims())
                .squeeze();
        });

        window.trainingDataInputs.push(imageFeatures);
        window.trainingDataOutputs.push(classNumber);

        if (window.examplesCount[classNumber] === undefined) {
            window.examplesCount[classNumber] = 0;
        }
        window.examplesCount[classNumber]++;

        updateStatus('');

        for (let n = 0; n < CLASS_NAMES.length; n++) {
            updateStatus('Rating ' + CLASS_NAMES[n] + ' data count: ' + window.examplesCount[n]);
        }
    };
}