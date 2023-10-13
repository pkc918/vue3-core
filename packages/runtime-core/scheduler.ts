const queue: any[] = [];
const p = Promise.resolve();
let isFlushPending: boolean = false;

function queueFlush() {
    if (isFlushPending) return;
    isFlushPending = true;
    nextTick(flushJobs);

}

function flushJobs() {
    isFlushPending = false;
    let a: any;
    while (a = queue.shift()) {
        a && a?.();
    }
}

export function queueJobs(job: any) {
    if (!queue.includes(job)) {
        queue.push(job);
    }

    queueFlush();
}

export function nextTick(fn: any) {
    return fn ? p.then(fn) : p;
}
