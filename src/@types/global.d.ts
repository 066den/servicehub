export interface WindowWithTimer extends Window {
	resendTimer?: NodeJS.Timeout
}

type NoneToVoidFunction = () => void
