import { cleanDate } from './functions.js';

async function loadSourceImages() {
    let loader = source => new Promise(resolve => {
        let image = new Image();
        image.src = source;
        image.onload = e => resolve(image);
        image.src = image.src;
    });

    return {
        backgroundImage: await loader('../publish/resources/instagram/background.png')
    }
};

async function generateImage(sourceImages, data) {
    let { date, rating, confidence, compositeImageURL } = data;

    let canvas = document.getElementById('image');
    let context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);

    let dateParsed = cleanDate(date).dateObject;
    let dateFormatted = dateParsed.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    let text = `Sunset on\n${dateFormatted}\npredicted to be\n${rating} out of 5 stars\nat a ${confidence}% confidence!`;

    context.drawImage(sourceImages.backgroundImage, 0, 0);

    context.font = 'bold 84px Helvetica Neue';
    context.globalCompositeOperation = 'overlay';
    context.fillStyle = 'black';

    let x = 60;
    let y = 140;
    let lineheight = 108;
    let lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
        if (i === 3) {
            context.fillStyle = 'white';
            context.fillText(lines[i], x, y + (i * lineheight));
            context.fillStyle = 'black';
        } else {       
            context.fillText(lines[i], x, y + (i * lineheight));
            context.fillText(lines[i], x, y + (i * lineheight));
        }
    }

    let imageData = canvas.toDataURL();

    return imageData;
}

async function saveHistory(data) {
    let request = await fetch('../publish/proxy/saveHistory.php', {
        method: 'POST',
        body: JSON.stringify(data)
    });

    const response = await request.json();

    console.log(response);
}

async function postToDestination(params) {
    if (params.destination === 'instagram') {
        let { imageData, caption } = params.data;

        let uploadRequest = await fetch('../publish/proxy/instagram.php', {
            method: 'POST',
            body: JSON.stringify({ imageData, caption })
        });

        const uploadResponse = await uploadRequest.json();

        console.log(uploadResponse);
    }
}

export async function publishPrediction(data) {
    loadSourceImages().then(async (sourceImages) =>  {
        let imageData = await generateImage(sourceImages, data);

        await postToDestination({
            destination: 'instagram',
            data: { 
                imageData,
                caption: 'text'
            }
        });

        await saveHistory(data);
    }).catch(console.error);
}