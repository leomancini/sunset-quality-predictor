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
}

function drawText(context, params) {
    let { scale, position, text, attributes } = params;

    context.globalCompositeOperation = attributes.blendingMode;
    context.font = `${attributes.font.weight} ${attributes.font.size * scale}px ${attributes.font.family}`;
    context.fillStyle = attributes.font.color;
    context.shadowOffsetX = attributes.shadow.offsetX * scale;
    context.shadowOffsetY = attributes.shadow.offsetY * scale;
    context.shadowColor = attributes.shadow.color;
    context.shadowBlur = attributes.shadow.blur * scale;

    let x = position.x * scale;
    let y = position.y * scale;
    let lineheight = attributes.font.lineHeight * scale;
    let lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {    
        context.fillText(lines[i], x, y + (i * lineheight));
        if (params.doubleDraw) { context.fillText(lines[i], x, y + (i * lineheight)); }
    }

    context.globalCompositeOperation = 'normal';
}

async function generateImage(sourceImages, dateFormatted, data) {
    let { rating, confidence, compositeImageURL } = data;

    let canvas = document.getElementById('image');
    let context = canvas.getContext('2d');
    let scale = 2;

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.drawImage(sourceImages.backgroundImage, 0, 0);

    drawText(context, {
        scale,
        text: `S U N S E T    Q U A L I T Y    P R E D I C T I O N`,
        doubleDraw: true,
        position: {
            x: 104,
            y: 59
        },
        attributes: {
            blendingMode: 'overlay',
            font: {
                family: 'Inter',
                weight: '600',
                size: 18,
                lineHeight: 0,
                color: 'black'
            },
            shadow: {
                offsetX: 0,
                offsetY: 4,
                blur: 20,
                color: 'rgba(0, 0, 0, 0.15)'
            }
        }
    });

    drawText(context, {
        scale,
        text: `${dateFormatted.dayOfWeek}\n${dateFormatted.date}`,
        position: {
            x: 40,
            y: 180
        },
        attributes: {
            blendingMode: 'normal',
            font: {
                family: 'Inter',
                weight: 'bold',
                size: 64,
                lineHeight: 78,
                color: 'white'
            },
            shadow: {
                offsetX: 0,
                offsetY: 4,
                blur: 20,
                color: 'rgba(0, 0, 0, 0.15)'
            }
        }
    });

    const zeroPad = (num, places) => String(num).padStart(places, '0');
    
    let confidenceWithLeadingZeros = zeroPad(confidence, 2);

    let doubleDrawConfidenceLabel;

    if (data.rating === 2) {
        doubleDrawConfidenceLabel = true;
    }

    drawText(context, {
        scale,
        text: `${String(confidenceWithLeadingZeros).charAt(0)} ${String(confidenceWithLeadingZeros).charAt(1)} %    C O N F I D E N T`,
        doubleDraw: doubleDrawConfidenceLabel,
        position: {
            x: 40,
            y: 504
        },
        attributes: {
            blendingMode: 'overlay',
            font: {
                family: 'Inter',
                weight: '600',
                size: 18,
                lineHeight: 0,
                color: 'black'
            },
            shadow: {
                offsetX: 0,
                offsetY: 4,
                blur: 20,
                color: 'rgba(0, 0, 0, 0.15)'
            }
        }
    });
    
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
        let { imageData, caption, date } = params.data;

        let uploadRequest = await fetch('../publish/proxy/postPredictionToInstagram.php', {
            method: 'POST',
            body: JSON.stringify({ imageData, caption, date })
        });

        const uploadResponse = await uploadRequest.json();

        console.log(uploadResponse);
    }
}

async function getSunsetTime(date) {
    const sunsetTimeRequest = await fetch(`http://skyline.noshado.ws/sunset-api-proxy/getSunsetTime.php?lat=40.730610&lng=-73.935242&date=${date}&timezone=ET`);
    const sunsetTimeData = await sunsetTimeRequest.json();

    const sunsetTime = new Date(sunsetTimeData.timestamp * 1000);
    const sunsetTimeFormatted = sunsetTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });
    
    return {
        dateObject: sunsetTime,
        formatted: sunsetTimeFormatted
    };
}

async function generateCaption(dateFormatted, data) {
    let sunsetTime = await getSunsetTime(data.date);

    let captions = [
        `I predict the quality of the sunset on ${dateFormatted.dayOfWeek}, ${dateFormatted.date}, ${dateFormatted.year} is going to be ${data.rating} out of 5 stars. I'm ${data.confidence}% confident, but we'll see at ${sunsetTime.formatted}!`,
        `The sunset is going to happen today at ${sunsetTime.formatted} and I'm ${data.confidence}% sure that it is going to be a ${data.rating}-star sunset.`
    ];

    let randomCaptionIndex = Math.floor(Math.random() * captions.length);

    return captions[randomCaptionIndex];
}

export async function publishPrediction(data) {
    loadSourceImages(data).then(async (sourceImages) =>  {
        let dateParsed = cleanDate(data.date).dateObject;
        let dateFormatted = {
            dayOfWeek: dateParsed.toLocaleDateString('en-US', { weekday: 'long' }),
            date: dateParsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
            year: dateParsed.toLocaleDateString('en-US', { year: 'numeric' })
        }

        let imageData = await generateImage(sourceImages, dateFormatted, data);
        let caption = await generateCaption(dateFormatted, data);

        // await postToDestination({
        //     destination: 'instagram',
        //     data: { 
        //         imageData,
        //         caption,
        //         date: data.date
        //     }
        // });

        // await saveHistory(data);
    }).catch(console.error);
}