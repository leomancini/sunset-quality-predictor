const MOBILE_NET_INPUT_WIDTH = 224;
const MOBILE_NET_INPUT_HEIGHT = 224;
const CLASS_NAMES = [1, 2, 3, 4, 5];
const SAVED_MODELS_URL = 'http://localhost/sunset-quality-predictor/model/savedModels/';
const LATEST_MODEL = 'sunsetQualityPreidctorModel-2022-04-16T14-34-32-344Z.json';

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
    }
}

async function trainAndSaveModel() {
    updateStatus('Training model...');

    tf.util.shuffleCombo(trainingDataInputs, trainingDataOutputs);
    let outputsAsTensor = tf.tensor1d(trainingDataOutputs, 'int32');
    let oneHotOutputs = tf.oneHot(outputsAsTensor, CLASS_NAMES.length);
    let inputsAsTensor = tf.stack(trainingDataInputs);

    await model.fit(inputsAsTensor, oneHotOutputs, {
        shuffle: true,
        batchSize: 5,
        epochs: 100,
        callbacks: { onEpochEnd: logProgress },
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

async function gatherData() {
    updateStatus('Getting ratings from Airtable...');
    
    const sunsetsWithRatings = await getSunsetsWithRatings();

    updateStatus('Setting ratings...');

    for (let sunset in sunsetsWithRatings) {
        let rating = parseInt(sunsetsWithRatings[sunset]);
        let ratingClass = rating - 1;

        gatherDataForClass(sunset, ratingClass);
    }
}

async function makePrediction() {
    let date = window.location.hash.split('#').join('');

    try {
        window.model = await tf.loadLayersModel(`${SAVED_MODELS_URL}/${LATEST_MODEL}`);
    } finally {
        tf.tidy(function() {
            const image = new Image();
            image.src = `../data/compositeImagesBeforeSunset/forPrediction/${date}.jpg`;
            image.onload = () => {
                let imageAsTensor = tf.browser.fromPixels(image).div(255);
                let resizedTensorFrame = tf.image.resizeBilinear(
                    imageAsTensor,
                    [MOBILE_NET_INPUT_HEIGHT, MOBILE_NET_INPUT_WIDTH],
                    true
                );

                let imageFeatures = mobilenet.predict(
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

                updateStatus(`Sunset on ${date} predicted to be <b>${predictionResult.rating} stars</b> at a ${predictionResult.confidence}% confidence!`);

                console.log(`http://skyline.noshado.ws/view-sunset/viewer.html#${date}`);

                publishPrediction({
                    date,
                    rating: parseInt(CLASS_NAMES[highestIndex]),
                    confidence: Math.floor(predictionArray[highestIndex] * 100)
                });
            };
            image.onerror = () => {
                updateStatus(`ERROR: No composite image found for ${date}!`);
            }
        });
    }
}

function publishPrediction(data) {
    console.log(data);
}

function logProgress(epoch, logs) {
    updateStatus(`Epoch ${epoch}`);

    console.log('Data for epoch ' + epoch, logs);
}

async function saveModel() {
    updateStatus('Saving model...');

    let today = new Date();
    let timestamp = today.toISOString().split(':').join('-').split('.').join('-');

    await model.save(`downloads://sunsetQualityPreidctorModel-${timestamp}`);

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
                [MOBILE_NET_INPUT_HEIGHT, MOBILE_NET_INPUT_WIDTH],
                true
            );
            
            let normalizedTensorFrame = resizedTensorFrame.div(255);

            return mobilenet
                .predict(normalizedTensorFrame.expandDims())
                .squeeze();
        });

        trainingDataInputs.push(imageFeatures);
        trainingDataOutputs.push(classNumber);

        if (examplesCount[classNumber] === undefined) {
            examplesCount[classNumber] = 0;
        }
        examplesCount[classNumber]++;

        updateStatus('');
        for (let n = 0; n < CLASS_NAMES.length; n++) {
            updateStatus(CLASS_NAMES[n] + ' data count: ' + examplesCount[n] + '. ');
        }
    };
}

async function loadMobileNetFeatureModel() {
    const URL = 'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v3_small_100_224/feature_vector/5/default/1';

    mobilenet = await tf.loadGraphModel(URL, { fromTFHub: true });
    updateStatus('MobileNet v3 loaded successfully!');

    tf.tidy(function () {
        let answer = mobilenet.predict(tf.zeros([1, MOBILE_NET_INPUT_HEIGHT, MOBILE_NET_INPUT_WIDTH, 3]));
        console.log(answer.shape);
    });
}

let model;
let mobilenet = undefined;
let trainingDataInputs = [];
let trainingDataOutputs = [];
let examplesCount = [];

await loadMobileNetFeatureModel();

model = tf.sequential();

model.add(tf.layers.dense({ inputShape: [1024], units: 128, activation: 'relu' }));

model.add(tf.layers.dense({ units: CLASS_NAMES.length, activation: 'softmax' }));

model.summary();

model.compile({
    optimizer: 'adam',
    loss: 'categoricalCrossentropy',
    metrics: [ 'accuracy' ],
});

if (!TRAINING_PAGE && window.location.hash) {
    makePrediction();
}

window.addEventListener('hashchange', function() {
    makePrediction();
}, false);