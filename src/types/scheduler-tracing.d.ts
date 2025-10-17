declare module 'scheduler/tracing' {
  export type Interaction = any;
  export const unstable_trace: (...args: any[]) => any;
  export const unstable_wrap: <T extends (...args: any[]) => any>(fn: T) => T;
}
