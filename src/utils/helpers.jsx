export async function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(() => { resolve(); }, ms);
    });
}


export function timeDiffTxt(diff) {
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days}d`;
    } else if (hours > 0) {
        return `${hours}h`;
    } else if (minutes > 0) {
        return `${minutes}m`;
    }
    return `${seconds}s`;
}

export function timeAgoTxt(when) {
    const currentTime = new Date().getTime();
    const timeDifference = currentTime - when;
    return timeDiffTxt(timeDifference) + " ago";
}
