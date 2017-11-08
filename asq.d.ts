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
        then: {
            (fn: (done: Done, ...msg: any[]) => void): Sequence
            (...args: any[]): Sequence
        },
        or: (fn: (err: any) => void) => void,
        onerror: (err: any) => void,
        gate: {
            (...fn: ((done: Done, ...msg: any[]) => void)[]): Sequence
            (seq: Sequence): Sequence
        },
        all: {
            (...fn: ((done: Done, ...msg: any[]) => void)[]): Sequence
            (seq: Sequence): Sequence
        },
        pipe: (done: PipeDone) => void,
        seq: {
            (...fn: ((msg: any) => Sequence)[]): Sequence
            (seq: Sequence): Sequence
        }
        val: {
            (fn: (...msgs: any[]) => any): Sequence
            (...args: any[]): Sequence
        },
        promise: <T>(promise: Promise<T>) => Sequence,
        fork: () => Sequence,
        abort: () => void,
        duplicate: () => Sequence,
        defer: () => Sequence
    }
    export = ASQ;
}
