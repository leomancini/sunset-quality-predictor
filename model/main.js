import { publishPrediction } from './publish.js';
import { makePrediction } from './predict.js';
import { trainAndSaveModel } from './train.js';
import { gatherData } from './train.js';

import {
    MOBILE_NET_INPUT_SIZE,
    CLASS_NAMES
} from './variables.js'

const STATUS = document.getElementById('status');

if (TRAINING_PAGE) {
    const GATHER_DATA_BUTTON = document.getElementById('gatherData');
    const TRAIN_BUTTON = document.getElementById('train');
    
    GATHER_DATA_BUTTON.addEventListener('click', gatherData);
    TRAIN_BUTTON.addEventListener('click', trainAndSaveModel);
}

function updateStatus(message) {
    if (STATUS) {
        STATUS.innerHTML = message;
        console.log(message);
    }
}

async function loadMobileNetFeatureModel() {
    const URL = 'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v3_small_100_224/feature_vector/5/default/1';

    window.mobilenet = await tf.loadGraphModel(URL, { fromTFHub: true });
    updateStatus('Sucessfully loaded MobileNet v3!');

    tf.tidy(function () {
        let answer = window.mobilenet.predict(tf.zeros([1, MOBILE_NET_INPUT_SIZE, MOBILE_NET_INPUT_SIZE, 3]));
    });
}

window.trainingDataInputs = [];
window.trainingDataOutputs = [];
window.examplesCount = [];

await loadMobileNetFeatureModel();

window.model = tf.sequential();
window.model.add(tf.layers.dense({ inputShape: [1024], units: 128, activation: 'relu' }));
window.model.add(tf.layers.dense({ units: CLASS_NAMES.length, activation: 'softmax' }));
window.model.summary();
window.model.compile({
    optimizer: 'adam',
    loss: 'categoricalCrossentropy',
    metrics: [ 'accuracy' ],
});

if (!TRAINING_PAGE) {
    if (window.location.hash) {
        makePrediction();
    } else {
        updateStatus('No date specified!')
    }
}

window.addEventListener('hashchange', function() {
    window.location.reload();
});