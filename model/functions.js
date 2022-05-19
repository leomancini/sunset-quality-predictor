import { STATUS } from './variables.js';

export function updateStatus(message) {
    if (STATUS) {
        STATUS.innerHTML = message;
        console.log(message);
    }
}

export function cleanDate(dateYYYMMDD) {
    let dateComponents = dateYYYMMDD.split('-');

    // Clean up timestamp so it's read correctly in all bro
    const dateObject = new Date(dateComponents.slice(0, 3).join('/') + ' 00:00:00');
    const ISOString = dateObject.toISOString();

    return {
        dateObject,
        ISOString
    };
}

export function formatDate(date) {
    let yyyy = date.getFullYear().toString();
    let mm = (date.getMonth()+1).toString();
    let dd  = date.getDate().toString();

    let mmChars = mm.split('');
    let ddChars = dd.split('');

    return yyyy + '-' + (mmChars[1]?mm:"0"+mmChars[0]) + '-' + (ddChars[1]?dd:"0"+ddChars[0]);
}
