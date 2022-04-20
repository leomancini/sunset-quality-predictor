import { STATUS } from './variables.js';

export function updateStatus(message) {
    if (STATUS) {
        STATUS.innerHTML = message;
        console.log(message);
    }
}
