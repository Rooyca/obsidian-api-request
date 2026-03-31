/**
 * Interface for key-value pairs in plugin settings
 */
interface KeyValuePair {
	/** The key identifier */
	key: string;
	/** The value associated with the key */
	value: string;
}

/**
 * Plugin settings interface
 * Contains all user-configurable options for the API Request plugin
 */
export interface LoadAPIRSettings {
	/** Text to display when a request is disabled */
	DisabledReq: string;
	/** Temporary key input field value */
	Key: string;
	/** Temporary value input field value */
	Value: string;
	/** Array of global key-value pairs for variable substitution */
	KeyValueCodeblocks: KeyValuePair[];
	/** Whether to show the interactive status bar */
	enableStatusBar: boolean;
	/** Color for active requests in status bar (hex color) */
	statusBarActiveColor: string;
	/** Color for inactive/disabled requests in status bar (hex color) */
	statusBarInactiveColor: string;
}

/**
 * Default plugin settings
 */
export const DEFAULT_SETTINGS: LoadAPIRSettings = {
	DisabledReq: '>> Disabled <<',
	Key: '',
	Value: '',
	KeyValueCodeblocks: [],
	enableStatusBar: true,
	statusBarActiveColor: '#4ade80',
	statusBarInactiveColor: '#9ca3af',
}
