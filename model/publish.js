import { cleanDate } from './functions.js';

async function loadSourceImages(data) {
    let loader = source => new Promise(resolve => {
        let image = new Image();
        image.src = source;
        image.onload = e => resolve(image);
        image.src = image.src;
    });
    
    return {
        backgroundImage: await loader(`../publish/resources/instagram/background-${data.rating}.png`)
    }
};

async function generateImage(sourceImages, data) {
    let { date, rating, confidence, compositeImageURL } = data;

    let canvas = document.getElementById('image');
    let context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);

    let dateParsed = cleanDate(date).dateObject;
    let dateFormatted = {
        dayOfWeek: dateParsed.toLocaleDateString('en-US', { weekday: 'long' }),
        date: dateParsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    }

    let text = `${dateFormatted.dayOfWeek}\n${dateFormatted.date}`;

    let scale = 2;
    
    context.drawImage(sourceImages.backgroundImage, 0, 0);

    context.font = `bold ${64 * scale}px Inter V`;
    context.shadowOffsetX = 0 * scale;
    context.shadowOffsetY = 4 * scale;
    context.shadowColor = 'rgba(0, 0, 0, 0.15)';
    context.shadowBlur = 20 * scale;
    context.fillStyle = 'white';

    let x = 40 * scale;
    let y = 172 * scale;
    let lineheight = 78 * scale;
    let lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {    
        context.fillText(lines[i], x, y + (i * lineheight));
    }
    
    context.globalCompositeOperation = 'overlay';
    context.font = `600 ${18 * scale}px Inter V`;
    context.fillStyle = 'black';
    
    x = 40 * scale;
    y = 506 * scale;
    
    const zeroPad = (num, places) => String(num).padStart(places, '0');
    
    let confidenceWithLeadingZeros = zeroPad(confidence, 2);
    
    context.fillText(`${String(confidenceWithLeadingZeros).charAt(0)} ${String(confidenceWithLeadingZeros).charAt(1)} %  C O N F I D E N T`, x, y);

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
    loadSourceImages(data).then(async (sourceImages) =>  {
        let imageData = await generateImage(sourceImages, data);

//         await postToDestination({
//             destination: 'instagram',
//             data: { 
//                 imageData,
//                 caption: 'text'
//             }
//         });
// 
//         await saveHistory(data);
    }).catch(console.error);
}