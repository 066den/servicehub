export interface WindowWithTimer extends Window {
	resendTimer?: NodeJS.Timeout
}

type NoneToVoidFunction = () => void
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any
