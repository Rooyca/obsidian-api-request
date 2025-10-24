export interface LoadAPIRSettings {
	DisabledReq: string;
	Key: string;
	Value: string;
	KeyValueCodeblocks: object[];
	enableStatusBar: boolean;
	statusBarActiveColor: string;
	statusBarInactiveColor: string;
}

export const DEFAULT_SETTINGS: LoadAPIRSettings = {
	DisabledReq: '>> Disabled <<',
	Key: '',
	Value: '',
	KeyValueCodeblocks: [],
	enableStatusBar: true,
	statusBarActiveColor: '#4ade80',
	statusBarInactiveColor: '#9ca3af',
}
