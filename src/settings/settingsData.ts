export interface LoadAPIRSettings {
	URL: string;
	MethodRequest: string;
	DataRequest: string;
	HeaderRequest: string;
	DataResponse: string;
	URLs: object[];
	Name: string;
	DisabledReq: string;
	Key: string;
	Value: string;
	KeyValueCodeblocks: object[];
	countBlocksText: string;
}

export const DEFAULT_SETTINGS: LoadAPIRSettings = {
	URL: 'https://jsonplaceholder.typicode.com/todos/1',
	MethodRequest: 'GET',
	DataRequest: '',
	HeaderRequest: '{"Content-Type": "application/json"}',
	DataResponse: '',
	URLs: [],
	Name: '',
	DisabledReq: 'This request is disabled',
	Key: '',
	Value: '',
	KeyValueCodeblocks: [],
	countBlocksText: 'Count blocks: %d',
}