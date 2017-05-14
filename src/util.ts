export function noop(): void {}

export function throwAlreadySubscribedError(context: string): void {
  throw new Error(`
    Stream ${context} has already been subscribed to.
    Use \`S.fork\` to allow more subscribers.
`)
}

