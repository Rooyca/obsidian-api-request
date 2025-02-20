export interface LoadAPIRSettings {
	DisabledReq: string;
	Key: string;
	Value: string;
	KeyValueCodeblocks: object[];
	countBlocksText: string;
}

export const DEFAULT_SETTINGS: LoadAPIRSettings = {
	DisabledReq: '>> Disabled <<',
	Key: '',
	Value: '',
	KeyValueCodeblocks: [],
	countBlocksText: '🇦 🇷(%d)',
}