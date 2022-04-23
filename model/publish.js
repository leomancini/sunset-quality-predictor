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
        text: `S U N S E T  Q U A L I T Y  P R E D I C T I O N`,
        doubleDraw: true,
        position: {
            x: 100,
            y: 60
        },
        attributes: {
            blendingMode: 'overlay',
            font: {
                family: 'Inter V',
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
                family: 'Inter V',
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
        text: `${String(confidenceWithLeadingZeros).charAt(0)} ${String(confidenceWithLeadingZeros).charAt(1)} %  C O N F I D E N T`,
        doubleDraw: doubleDrawConfidenceLabel,
        position: {
            x: 40,
            y: 504
        },
        attributes: {
            blendingMode: 'overlay',
            font: {
                family: 'Inter V',
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
        let { imageData, caption } = params.data;

        let uploadRequest = await fetch('../publish/proxy/instagram.php', {
            method: 'POST',
            body: JSON.stringify({ imageData, caption })
        });

        const uploadResponse = await uploadRequest.json();

        console.log(uploadResponse);
    }
}

function generateCaption(dateFormatted, data) {
    let caption = `The visual beauty of the sunset on ${dateFormatted.dayOfWeek}, ${dateFormatted.date}, ${dateFormatted.year} is predicted to be ${data.rating} out of 5 stars, with a confidence of ${data.confidence}%.`;

    return caption;
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
        let caption = generateCaption(dateFormatted, data);

        await postToDestination({
            destination: 'instagram',
            data: { 
                imageData,
                caption
            }
        });

        await saveHistory(data);
    }).catch(console.error);
}