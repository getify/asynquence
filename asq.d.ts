declare module 'asynquence' {
    namespace ASQ {}    
    let ASQ: ASQ;

    interface ASQ {
        (args?: any): Sequence
        faild: (...args: any[]) => Sequence
        messages: () => any
        isMessageWrapper: (arg: any) => boolean
        isSequence: (arg: any) => boolean
        unpause: () => Sequence
        noConflict: () => Sequence
        clone: () => Sequence
    }

    interface Done {
        (args?: any): void
        fail: (args?: any) => void
        abort: () => void
        errfcb: () => void
    }

    type PipeDone = (args?: any) => void;

    interface Sequence {
        then: (fn: (done: Done) => void, ...msg: any[]) => Sequence,
        or: (fn: (err: any) => void) => void,
        onerror: (err: Error) => void,
        gate: (...seq: ((done: Done, ...msg: any[]) => void)[]) => Sequence,
        all: (...seq: ((done: Done, ...msg: any[]) => void)[]) => Sequence,
        pipe: (done: PipeDone) => void,
        seq: (fn: (msg: any) => Sequence) => Sequence,
        val: (fn: (msg: any) => any) => Sequence,
        promise: <T>(promise: Promise<T>) => Sequence,
        fork: () => Sequence,
        abort: () => void,
        duplicate: () => Sequence,
        defer: () => Sequence
    }

    export = ASQ;
}