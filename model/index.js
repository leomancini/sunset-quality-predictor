let model;
let mobilenet = undefined;
let trainingDataInputs = [];
let trainingDataOutputs = [];
let examplesCount = [];

const MOBILE_NET_INPUT_WIDTH = 224;
const MOBILE_NET_INPUT_HEIGHT = 224;
const STOP_DATA_GATHER = -1;
const CLASS_NAMES = ['Rating 1', 'Rating 2', 'Rating 3', 'Rating 4', 'Rating 5'];

const STATUS = document.getElementById('status');
const GATHER_DATA_BUTTON = document.getElementById('gatherData');
const TRAIN_BUTTON = document.getElementById('train');
const PREDICT_BUTTON = document.getElementById('predict');

GATHER_DATA_BUTTON.addEventListener('click', gatherData);
TRAIN_BUTTON.addEventListener('click', trainAndSaveModel);
PREDICT_BUTTON.addEventListener('click', makePrediction);

async function trainAndSaveModel() {
    STATUS.innerText = 'Training model...';

    tf.util.shuffleCombo(trainingDataInputs, trainingDataOutputs);
    let outputsAsTensor = tf.tensor1d(trainingDataOutputs, 'int32');
    let oneHotOutputs = tf.oneHot(outputsAsTensor, CLASS_NAMES.length);
    let inputsAsTensor = tf.stack(trainingDataInputs);

    await model.fit(inputsAsTensor, oneHotOutputs, {
        shuffle: true,
        batchSize: 5,
        epochs: 10,
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
    STATUS.innerText = 'Getting ratings from Airtable...';
    
    const sunsetsWithRatings = await getSunsetsWithRatings();

    STATUS.innerText = 'Setting ratings...';

    for (let sunset in sunsetsWithRatings) {
        let rating = parseInt(sunsetsWithRatings[sunset]);
        let ratingClass = rating - 1;

        gatherDataForClass(sunset, ratingClass);
    }
}

async function makePrediction() {
    let date = '2022-03-31';

    try {
        window.model = await tf.loadLayersModel('localstorage://sunsetQualityPreidctorModel');
    } finally {
        tf.tidy(function () {
            const image = new Image();
            image.src = `data/unseen/${date}.jpg`;
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

                STATUS.innerText =
                    date +
                    ' - ' +
                    CLASS_NAMES[highestIndex] +
                    ' with ' +
                    Math.floor(predictionArray[highestIndex] * 100) +
                    '% confidence';

                console.log(`http://skyline.noshado.ws/view-sunset/viewer.html#${date}`)
            };
        });
    }
}

function logProgress(epoch, logs) {
    STATUS.innerText = `Epoch ${epoch}`;

    console.log('Data for epoch ' + epoch, logs);
}

async function saveModel() {
    STATUS.innerText = 'Saving model...';

    await model.save('localstorage://sunsetQualityPreidctorModel');

    STATUS.innerText = 'Model trained and saved! Ready to use!';
}

function gatherDataForClass(filename, classNumber) {
    const image = new Image();
    image.src = `data/training/${filename}.jpg`;
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

        STATUS.innerText = '';
        for (let n = 0; n < CLASS_NAMES.length; n++) {
            STATUS.innerText +=
                CLASS_NAMES[n] + ' data count: ' + examplesCount[n] + '. ';
        }
    };
}

async function loadMobileNetFeatureModel() {
    const URL =
        'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v3_small_100_224/feature_vector/5/default/1';

    mobilenet = await tf.loadGraphModel(URL, { fromTFHub: true });
    STATUS.innerText = 'MobileNet v3 loaded successfully!';

    tf.tidy(function () {
        let answer = mobilenet.predict(
            tf.zeros([1, MOBILE_NET_INPUT_HEIGHT, MOBILE_NET_INPUT_WIDTH, 3])
        );
        console.log(answer.shape);
    });
}

loadMobileNetFeatureModel();

model = tf.sequential();
model.add(
    tf.layers.dense({ inputShape: [1024], units: 128, activation: 'relu' })
);
model.add(
    tf.layers.dense({ units: CLASS_NAMES.length, activation: 'softmax' })
);
model.summary();

model.compile({
    optimizer: 'adam',
    loss: 'categoricalCrossentropy',
    metrics: [ 'accuracy' ],
});