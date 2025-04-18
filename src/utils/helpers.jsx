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

export function fetchWithAbort(url, options = {}) {
    const controller = new AbortController();
    const signal = controller.signal;
    const promise = fetch(url, { signal, ...options });
    return {
        loader: async () => {
            const res = await promise;
            if (!res.ok) {
                throw new Error("error in response: " + (res.statusText ? res.statusText : res.status));
            }
            return res;
        },
        abort: () => {
            console.log("Aborting fetch request...", url);
            controller.abort();
        }
    };
}

export function fetchJsonWithAbort(url, options = {}) {
    const fetcher = fetchWithAbort(url, options);
    return {
        loader: async () => {
            const res = await fetcher.loader();
            const json = await res.json();
            if (!json.data) throw new Error("Invalid response format");
            return json.data;
        },
        abort: fetcher.abort,
    };
}

export function fetchStreamWithAbort(url, options = {}) {
    const fetcher = fetchWithAbort(url, options);
    let reader = null;
    let decoder = new TextDecoder("utf-8");
    let buffer = "";
    return {
        loader: async () => {
            const res = await fetcher.loader();
            if (!res.body) throw new Error("Invalid response format");
            if (!reader) reader = res.body.getReader();

            const { done, value } = await reader.read();
            if (done) return null;

            buffer += decoder.decode(value, { stream: true });
            console.log("Buffer:", buffer);
            const lines = buffer.split("\n");
            buffer = lines.pop(); // Save incomplete line

            const results = [];
            for (let line of lines) {
                line = line.trim();
                if (line.startsWith("data:")) {
                    const jsonStr = line.slice(5).trim();
                    try {
                        results.push(JSON.parse(jsonStr));
                    } catch (e) {
                        console.error("Invalid JSON:", jsonStr);
                    }
                }
            }
            return results;
        },
        abort: fetcher.abort,
    };
}
