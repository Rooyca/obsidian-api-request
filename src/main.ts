import {
    MarkdownView,
    Plugin,
    Notice,
    requestUrl,
    debounce,
    Menu,
    TFile,
    TAbstractFile,
} from "obsidian";
import {
    readFrontmatter,
    parseFrontmatter,
} from "src/functions/frontmatterUtils";
import { addBtnCopy } from "src/functions/general";
import { varname_regx, no_varname_regx, key_regx } from "src/functions/regx";
import { 
    isValidUrl, 
    isValidMethod, 
    sanitizeUuid, 
    isValidJsonPath, 
    sanitizeHtml,
    isValidFormat,
    isValidFilePath,
    safeJsonParse,
    isValidStorageKey
} from "src/functions/security";
import APRSettings from "src/settings/settingsTab";
import { JSONPath } from "jsonpath-plus";
import { LoadAPIRSettings, DEFAULT_SETTINGS } from "src/settings/settingsData";

/**
 * Interface for tracking request code blocks in the editor
 */
interface ReqCodeBlock {
    /** Unique identifier for the request (optional) */
    uuid: string | null;
    /** Index of the block in the document */
    index: number;
    /** Line number where the code block starts */
    lineStart: number;
    /** Whether the request is disabled */
    disabled: boolean;
    /** Whether the request should auto-update */
    autoUpdate: boolean;
    /** Whether the request is active (for UI styling) */
    isActive: boolean;
    /** Display name for the request in the UI */
    displayName: string;
}

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
 * Retrieves global variables defined in plugin settings and replaces them in the input string
 * @param value - The string containing variable placeholders in the format {{KEY}}
 * @param settings - The plugin settings containing key-value pairs
 * @returns The string with variables replaced by their values
 * @example
 * // If settings has {key: "API_KEY", value: "12345"}
 * checkGlobalValue("url={{API_KEY}}", settings) // returns "url=12345"
 */
export function checkGlobalValue(value: string, settings: LoadAPIRSettings): string {
    const match = value.match(key_regx);

    if (match) {
        for (let i = 0; i < match.length; i++) {
            const key = match[i].replace(/{{|}}/g, "");
            value = value.replace(
                match[i],
                (settings.KeyValueCodeblocks as KeyValuePair[]).find((obj) => obj.key === key)
                    ?.value || "",
            );
        }
    }
    return value;
}

/**
 * Retrieves data from localStorage using the syntax {{ls.UUID>JSONPath}}
 * where 'ls' stands for 'localStorage'
 * 
 * @param value - The string containing localStorage references
 * @returns The string with localStorage references replaced by their values
 * @security Validates UUID format and JSONPath expressions to prevent injection attacks
 * @example
 * // If localStorage has "req-mydata" with {user: {name: "John"}}
 * checkLocalStorage("{{ls.mydata>$.user.name}}") // returns "John"
 */
export function checkLocalStorage(value: string): string {
    const match = value.match(key_regx);

    if (match) {
        for (let i = 0; i < match.length; i++) {
            const key = match[i].replace(/{{|}}/g, "");
            let uuid = key.split(">")[0];
            const jsonPath = key.split(">")[1];
            uuid = uuid.split(".")[1];
            
            // Validate uuid and jsonPath for security
            const sanitizedUuid = sanitizeUuid(uuid);
            if (!sanitizedUuid) {
                console.warn("Invalid UUID format:", uuid);
                continue;
            }
            
            if (jsonPath && !isValidJsonPath(jsonPath)) {
                console.warn("Invalid JSONPath expression:", jsonPath);
                continue;
            }
            
            // Try with req- prefix first (for req-uuid data)
            let data = localStorage.getItem(`req-${sanitizedUuid}`);
            
            // If not found, try without prefix (for manual variables)
            if (!data) {
                data = localStorage.getItem(sanitizedUuid);
            }
            
            if (data) {
                const parsedData = safeJsonParse(data);
                if (parsedData && jsonPath) {
                    try {
                        const output = JSONPath({ path: jsonPath, json: parsedData });
                        value = value.replace(match[i], output);
                    } catch (e) {
                        console.error("JSONPath evaluation error:", e);
                    }
                }
            }
        }
    }
    return value;
}

/**
 * Parses and validates input string to JSON format
 * Attempts to convert various quote styles to valid JSON
 * 
 * @param input - The input string to parse
 * @param type - The type of data being parsed (for error messages)
 * @returns Parsed JSON object or null if input is empty
 * @throws Error if the input cannot be parsed to valid JSON
 * @example
 * parseToValidJson("{key: value}", "headers") // returns {"key": "value"}
 * parseToValidJson("'key': 'value'", "body") // returns {"key": "value"}
 */
export function parseToValidJson(input: string, type: string): Record<string, any> | null {
    const trimmedInput = input.trim();

    if (!trimmedInput) {
        return null;
    }

    try {
        // Replace single quotes with double quotes and ensure keys/values are properly quoted
        const formattedInput = trimmedInput
            .replace(/"/g, "") // Remove all quotes
            .replace(/'/g, '"') // Replace single quotes with double quotes
            .replace(
                /\s*([^,{"]+):\s*([^,"}]+)/g,
                '"$1":"$2"',
            ); // Add double quotes around unquoted keys and values

        return JSON.parse(formattedInput);
    } catch (e) {
        throw new Error(
            `Invalid ${type} format. Details: ${e.message}`,
        );
    }
}

/**
 * Formats output for display in the code block
 * Handles arrays, objects, and primitive values
 * 
 * @param output - The output to format (can be any type)
 * @returns Formatted string representation of the output
 * @example
 * formatOutput([1, 2, 3]) // returns "1, 2, 3"
 * formatOutput({key: "value"}) // returns '{\n  "key": "value"\n}'
 */
export function formatOutput(output: any): string {
    // If output is Array
    if (Array.isArray(output)) {
        // If it's an Array of one element, format that element
        if (output.length === 1) {
            return formatOutput(output[0]);
        }
        // If it's an array of multiple elements, filter out empty strings and format
        return output
            .map((item) => formatOutput(item)) // Format each item
            .filter((item) => item.trim() !== "") // Filter out empty strings
            .join(", "); // Join with ", "
    }

    // If output is an object, convert it to string
    if (typeof output === "object" && output !== null) {
        return JSON.stringify(output, null, 2);
    }

    // Any other case, convert it to string (handling null/undefined)
    return String(output ?? "");
}

/**
 * Checks if the value contains variables and replaces them with actual values
 * Supports:
 * - localStorage references: {{ls.UUID>JSONPath}}
 * - Global variables: {{KEY}}
 * - Frontmatter variables: {{this.propertyName}}
 * - File name: {{this.file.name}}
 * 
 * @param req_prop - The string containing variable placeholders
 * @param settings - The plugin settings
 * @returns The string with variables replaced, or undefined if an error occurs
 * @security All variable values are validated before substitution
 * @example
 * checkVariables("{{this.file.name}}", settings) // returns current file name
 * checkVariables("{{API_KEY}}", settings) // returns value from global settings
 */
export function checkVariables(req_prop: string, settings: LoadAPIRSettings): string | undefined {
    try {
        // search value in localStorage
        req_prop = checkLocalStorage(req_prop);
        // search value globally
        req_prop = checkGlobalValue(req_prop, settings);
        const match = req_prop.match(varname_regx);

        if (match) {
            for (let i = 0; i < match.length; i++) {
                const var_name = match[i].replace(no_varname_regx, "");

                // if {{this.file.name}} return filename
                if (var_name == "file.name") {
                    const activeFile = this.app.workspace.getActiveFile();
                    if (!activeFile) {
                        console.warn("No active file found");
                        continue;
                    }
                    req_prop = req_prop.replace(
                        match[i],
                        activeFile.basename,
                    );
                    continue;
                }

                const activeView =
                    this.app.workspace.getActiveViewOfType(MarkdownView);
                
                if (!activeView) {
                    console.warn("No active markdown view found");
                    continue;
                }
                
                const markdownContent = activeView.editor.getValue();

                try {
                    const frontmatterData = parseFrontmatter(
                        readFrontmatter(markdownContent),
                    );
                    req_prop = req_prop.replace(
                        match[i],
                        frontmatterData[var_name] || "",
                    );
                } catch (e: any) {
                    console.error("Frontmatter parsing error:", e.message);
                    new Notice("Error reading frontmatter: " + e.message);
                    return undefined;
                }
            }
        }
        return req_prop;
    } catch (e: any) {
        console.error("Variable substitution error:", e);
        new Notice("Error processing variables: " + e.message);
        return undefined;
    }
}

/**
 * Main plugin class for API Request functionality
 * Allows users to make HTTP requests directly from Obsidian code blocks
 * and display responses with caching, variable substitution, and data extraction
 */
export default class MainAPIR extends Plugin {
    /** Plugin settings */
    settings: LoadAPIRSettings;
    /** Status bar element for displaying request count */
    private statusBarItem: HTMLElement;
    /** List of request code blocks in the current file */
    private reqBlocks: ReqCodeBlock[] = [];

    /**
     * Called when the plugin is loaded
     * Registers code block processor, event handlers, and settings tab
     */
    async onload() {
        console.log("Loading: api-request");
        await this.loadSettings();

        // Create status bar item only if enabled in settings
        this.statusBarItem = this.addStatusBarItem();
        this.statusBarItem.addClass('plugin-api-request');
        this.statusBarItem.style.cursor = 'pointer';
        
        // Add click handler for menu
        this.statusBarItem.addEventListener('click', (e) => {
            this.showRequestMenu(e);
        });

        // Debounced update function
        const debouncedUpdate = debounce(this.updateStatusBar.bind(this), 300);

        // count number of codeblocks on "file-open" and "changes to the file"
        this.registerEvent(
            this.app.workspace.on("file-open", debouncedUpdate)
        );
        this.registerEvent(
            this.app.workspace.on("editor-change", debouncedUpdate)
        );
        this.registerEvent(
            this.app.workspace.on("active-leaf-change", debouncedUpdate)
        );

        try {
            this.registerMarkdownCodeBlockProcessor(
                "req",
                async (source, el) => {
                    // split the content by lines
                    const sourceLines = source.split("\n");
                    // create variables
                    let [URL, saveTo] = [String(), String()];
                    let properties = [String()];
                    let uuid, show;
                    let autoUpdate = false;
					let hidden = false;
                    let method = "GET";
                    let format = String();
                    let [headers, body] = [Object(), Object()];
                    const allowedMethods = ["GET", "POST", "PUT", "DELETE"];

                    for (const line of sourceLines) {
                        // convert line to lowercase
                        // this way we can check for the keywords without worrying about the case
                        const lowercaseLine = line.toLowerCase();

                        // comments
                        if (
                            lowercaseLine.startsWith("#") ||
                            lowercaseLine.startsWith("//")
                        ) {
                            continue;

                            // return if request is disabled
                        } else if (lowercaseLine.startsWith("disabled")) {
                            el.createEl("strong", {
                                text: this.settings.DisabledReq,
                            });
                            return;

                            // get the method and check if is a valid method
                        } else if (lowercaseLine.startsWith("method:")) {
                            method = line.replace(/method:/i, "").toUpperCase().trim();
                            if (!isValidMethod(method)) {
                                el.createEl("strong", {
                                    text: `Error: Method ${method} not supported`,
                                });
                                return;
                            }

                            // get the url and *return* if is null
                        } else if (lowercaseLine.startsWith("url:")) {
                            URL =
                                checkVariables(
                                    line.replace(/url:/i, "").trim(),
                                    this.settings,
                                ) ?? "";
                            if (!URL) {
                                el.createEl("strong", {
                                    text: "Error: URL not found",
                                });
                                return;
                            }
                            
                            // Validate URL for security
                            if (!isValidUrl(URL)) {
                                el.createEl("strong", {
                                    text: "Error: Invalid or unsafe URL",
                                });
                                return;
                            }

                            // extract data using jsonpath-plus (https://www.npmjs.com/package/jsonpath-plus)
                        } else if (lowercaseLine.startsWith("show:")) {
                            show =
                                checkVariables(
                                    line.replace(/show:/i, "").trim(),
                                    this.settings,
                                ) ?? "";
                            if (!show) {
                                el.createEl("strong", {
                                    text: "Error: show value is empty",
                                });
                                return;
                            }
                            
                            // Validate JSONPath for security
                            const paths = show.split(" + ");
                            for (const path of paths) {
                                if (!isValidJsonPath(path.trim())) {
                                    el.createEl("strong", {
                                        text: "Error: Invalid JSONPath expression",
                                    });
                                    return;
                                }
                            }

                            // get headers. They can use double, single quotes or none
                        } else if (lowercaseLine.startsWith("headers:")) {
                            const tempHeaders =
                                checkVariables(
                                    line.replace("headers:", "").trim(),
                                    this.settings,
                                ) ?? "";

                            try {
                                headers = parseToValidJson(
                                    tempHeaders,
                                    "headers",
                                );
                            } catch (e: any) {
                                el.createEl("strong", { text: e.message || "Error parsing headers" });
                                return;
                            }

                            // get body. They can use double, single quotes or none
                        } else if (lowercaseLine.startsWith("body:")) {
                            const tempBody =
                                checkVariables(
                                    line.replace("body:", "").trim(),
                                    this.settings,
                                ) ?? "";

                            try {
                                body = parseToValidJson(tempBody, "body");
                            } catch (e: any) {
                                // use raw body if it's not a valid JSON
                                console.log("Using raw body (not valid JSON):", e.message);
                                body = tempBody;
                            }

                            // save the entire JSON to a file. (filename and extension are needed)
                        } else if (lowercaseLine.startsWith("save-as:")) {
                            saveTo = line.replace(/save-as:/i, "").trim();
                            if (!saveTo) {
                                el.createEl("strong", {
                                    text: "Error: save-as is empty. Please provide a filename with extension",
                                });
                                return;
                            }
                            
                            // Validate file path for security
                            if (!isValidFilePath(saveTo)) {
                                el.createEl("strong", {
                                    text: "Error: Invalid file path. Path traversal and absolute paths are not allowed.",
                                });
                                return;
                            }
                        } else if (lowercaseLine.startsWith("req-uuid:")) {
                            uuid = line.replace(/req-uuid:/i, "").trim();
                            if (!uuid) {
                                el.createEl("strong", {
                                    text: "Error: req-uuid is empty. Please provide a unique identifier",
                                });
                                return;
                            }
                            uuid =
                                checkVariables(
                                    uuid,
                                    this.settings,
                                ) ?? "";
                            
                            // Sanitize UUID for security
                            const sanitized = sanitizeUuid(uuid);
                            if (!sanitized) {
                                el.createEl("strong", {
                                    text: "Error: Invalid UUID format",
                                });
                                return;
                            }
                            uuid = `req-${sanitized}`;
                        } else if (lowercaseLine.startsWith("auto-update")) {
                            autoUpdate = true;
                        } else if (lowercaseLine.startsWith("hidden")) {
                            hidden = true;
                        } else if (lowercaseLine.startsWith("format:")) {
                            format = line.replace(/format:/i, "").trim();
                            
                            // Validate format for XSS prevention
                            if (!isValidFormat(format)) {
                                el.createEl("strong", {
                                    text: "Error: Invalid format string. Script tags and event handlers are not allowed.",
                                });
                                return;
                            }
                        } else if (lowercaseLine.startsWith("properties:")) {
                            properties = line
                                .replace(/properties:/i, "")
                                .trim()
                                .split(",");
                        }
                    }

                    let responseData: any;
                    let responseDataText: string | undefined;

                    // Check if the response is cached in localStorage
                    if (uuid && !autoUpdate) {
                        try {
                            const cachedResponse = localStorage.getItem(uuid);
                            if (cachedResponse) {
                                responseData = safeJsonParse(cachedResponse);
                                if (responseData) {
                                    const temp_uuid = uuid.split("req-")[1];
                                    new Notice(`Using cached data with UUID: ${temp_uuid}`);
                                } else {
                                    console.warn("Failed to parse cached data");
                                }
                            }
                        } catch (e) {
                            console.error("Error reading from localStorage:", e);
                        }
                    }

                    // If no cached data or auto-update is requested, make a new request
                    if (!responseData || autoUpdate) {
                        try {
                            body = method == "GET" ? undefined : JSON.stringify(body);
                            const response = await requestUrl({
                                url: URL,
                                method,
                                headers,
                                body,
                            });
                            responseData = await response.json;
                            responseDataText = response.text;

                            // Cache the response in localStorage if req-uuid is provided
                            if (uuid) {
                                try {
                                    localStorage.setItem(
                                        uuid,
                                        JSON.stringify(responseData),
                                    );
                                } catch (e) {
                                    console.error("Error saving to localStorage:", e);
                                    new Notice("Warning: Failed to cache response");
                                }
                            }
                        } catch (e: any) {
                            console.error(e.message);
                            new Notice("Error: " + e.message);
                            responseData = `Error: ${e.message}`;
                        }
                    }

                    let output = responseData;

                    if (show) {
                        // split show by `+` to check if user defined more than one path
                        show = show.split(" + ");
                        
                        // check if the user defined more than one path
                        // if so, iterate over each path and get the data
                        output = show.length > 1 
                          ? show.map((path) => {
                                try {
                                    return JSONPath({ path: path.trim(), json: responseData });
                                } catch (e: any) {
                                    console.error("JSONPath error for path:", path, e);
                                    return `Error: ${e.message}`;
                                }
                            })
                          : (() => {
                                try {
                                    return JSONPath({ path: show[0], json: responseData });
                                } catch (e: any) {
                                    console.error("JSONPath error:", e);
                                    return `Error: ${e.message}`;
                                }
                            })();

                        if (properties.length > 0 && properties[0] !== '') {
                            // Format the output and split it into an array
                            const stringOutput = formatOutput(output);
                            const splitOutput = stringOutput.split(",");

                            // Get the active Markdown view and its associated file
                            const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
                            if (!activeView?.file) {
                                console.error("No active Markdown view or file found.");
                                return;
                            }
                            const file: TFile = activeView.file;

                            // Function to update the frontmatter
                            const updateFrontmatter = async (propertyName: string, value: string) => {
                                // Handle wikilink formatting if the property name contains [[...]]
                                const match = propertyName.match(/\[\[(.*?)\]\]/);
                                const cleanPropertyName = match ? match[1] : propertyName;

                                // Update the frontmatter
                                await this.app.fileManager.processFrontMatter(file, (existingFrontmatter) => {
                                    existingFrontmatter[cleanPropertyName] = match ? `[[${value}]]` : value;
                                });
                            };

                            // If there's only one property, assign the entire splitOutput to that property
                            if (properties.length === 1) {
                                const propertyName = properties[0]?.trim();

                                // Skip if the property name is empty
                                if (!propertyName) return;

                                // Update the frontmatter
                                await updateFrontmatter(propertyName, stringOutput);
                            } else {
                                // If there are multiple properties, iterate over them
                                for (let index = 0; index < properties.length; index++) {
                                    const propertyName = properties[index]?.trim();

                                    // Skip if the property name is empty
                                    if (!propertyName) continue;

                                    // Extract the value from the output
                                    const valueOutput = splitOutput[index] || "";

                                    // Update the frontmatter
                                    await updateFrontmatter(propertyName, valueOutput);
                                }
                            }
                        }
                    }

                    const formattedOutput = formatOutput(output);


                    // Save to a file
                    if (saveTo) {
                        try {
                            // try to create the file. It'll fail if already exists
                            await this.app.vault.create(
                                saveTo,
                                responseDataText || "",
                            );
                            new Notice("Saved to: " + saveTo);
                        } catch (e: any) {
                            // try to modify the file
                            try {
                                const file = this.app.vault.getAbstractFileByPath(saveTo);
                                if (file instanceof TFile) {
                                    await this.app.vault.modify(file, responseDataText || "");
                                    new Notice("File modified");
                                } else {
                                    new Notice("Error: Could not save to file");
                                    console.error("File save error:", e);
                                }
                            } catch (modifyError: any) {
                                new Notice("Error: Failed to save file");
                                console.error("File modification error:", modifyError);
                            }
                        }
                    }

                    // if a *format* is defined in the codeblock
                    // render the response, else just *return* the response as String
                    if (hidden) {
                        return;
                    } else if (format) {
                        const parts = formattedOutput.split(",");
                        // Sanitize the format output to prevent XSS
                        const sanitizedFormat = sanitizeHtml(format);
                        el.innerHTML = sanitizedFormat.replace(/{}/g, () => {
                            const part = parts.shift() || "";
                            // Escape the part to prevent XSS
                            return sanitizeHtml(part);
                        });
                    } else {
                        el.createEl("pre", { text: formattedOutput });
                    }
                    
                    // add a button to copy the output
                    addBtnCopy(el, formattedOutput);
                },
            );
        } catch (e) {
            console.error(e.message);
            new Notice("Error: " + e.message);
        }

        this.addSettingTab(new APRSettings(this.app, this));
    }

    /**
     * Parses all req code blocks from the active file
     * Extracts metadata like UUID, disabled status, and auto-update flag
     * 
     * @returns Array of parsed request code blocks
     */
    private parseReqBlocks(): ReqCodeBlock[] {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return [];

        const editor = view.editor;
        const content = editor.getValue();
        const lines = content.split('\n');
        const blocks: ReqCodeBlock[] = [];
        let blockIndex = 0;

        let inReqBlock = false;
        let currentBlock: Partial<ReqCodeBlock> = {};
        let blockStartLine = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();
            const lowercaseLine = trimmedLine.toLowerCase();

            if (trimmedLine.startsWith('```req')) {
                inReqBlock = true;
                blockStartLine = i;
                currentBlock = {
                    uuid: null,
                    index: blockIndex,
                    lineStart: blockStartLine,
                    disabled: false,
                    autoUpdate: false,
                    isActive: true
                };
            } else if (inReqBlock && trimmedLine === '```') {
                // End of block - determine display name and active status
                if (currentBlock.uuid) {
                    // Remove 'req-' prefix for display
                    currentBlock.displayName = currentBlock.uuid.replace('req-', '');
                } else {
                    currentBlock.displayName = `Block ${blockIndex + 1}`;
                }

                // Determine if active (green) or inactive (gray)
                // Active = has uuid AND auto-update
				currentBlock.isActive = (currentBlock.uuid !== null && currentBlock.autoUpdate) || 
                       (!currentBlock.disabled && currentBlock.uuid === null);

                blocks.push(currentBlock as ReqCodeBlock);
                blockIndex++;
                inReqBlock = false;
                currentBlock = {};
            } else if (inReqBlock) {
                // Parse properties
                if (lowercaseLine.startsWith('req-uuid:')) {
                    let uuid = line.replace(/req-uuid:/i, '').trim();
                    uuid = checkVariables.call(this, uuid, this.settings) ?? '';
                    currentBlock.uuid = `req-${uuid}`;
                }
                if (lowercaseLine.startsWith('disabled')) {
                    currentBlock.disabled = true;
                }
                if (lowercaseLine.startsWith('auto-update')) {
                    currentBlock.autoUpdate = true;
                }
            }
        }

        return blocks;
    }

    /**
     * Updates the status bar display with request count
     * Shows/hides based on settings and number of requests
     */
    updateStatusBar() {
        // Check if status bar is enabled
        if (!this.settings.enableStatusBar) {
            this.statusBarItem.style.display = 'none';
            return;
        }

        this.reqBlocks = this.parseReqBlocks();
        
        const count = this.reqBlocks.length;
        
        if (count === 0) {
            this.statusBarItem.style.display = 'none';
            return;
        }

        this.statusBarItem.style.display = 'flex';
        this.statusBarItem.style.alignItems = 'center';
        this.statusBarItem.style.gap = '4px';
        
        // Create icon with counter
		// TODO
		// Use native icons
        this.statusBarItem.innerHTML = `
            <span style="display: flex; align-items: center; gap: 4px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span>${count} requests</span>
            </span>
        `;
    }

    /**
     * Shows a menu with all available request blocks
     * Allows navigation to specific blocks
     * 
     * @param event - The mouse event that triggered the menu
     */
    private showRequestMenu(event: MouseEvent) {
        const menu = new Menu();

        if (this.reqBlocks.length === 0) {
            menu.addItem((item) => {
                item.setTitle('No req blocks found');
                item.setDisabled(true);
            });
        } else {
            this.reqBlocks.forEach((block) => {
                menu.addItem((item) => {
                    item.setTitle(block.displayName);
                    item.setIcon('rocket');
                    
                    // Store color in a CSS variable that can be used by styles
                    const isActive = block.isActive;
                    item.onClick(() => {
                        this.navigateToBlock(block);
                    });
                    
                    // Add custom styling via callback
                    const color = isActive 
                        ? this.settings.statusBarActiveColor 
                        : this.settings.statusBarInactiveColor;
                    
                    // Use setIcon with color hint through title
                    item.setTitle(`${block.displayName}${isActive ? ' 🟢' : ' ⚪'}`);
                });
            });
        }

        menu.showAtMouseEvent(event);
    }

    /**
     * Navigates to a specific code block in the editor
     * Scrolls to the block and selects it for visual feedback
     * 
     * @param block - The request block to navigate to
     */
    private navigateToBlock(block: ReqCodeBlock) {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) {
            new Notice('No active markdown view');
            return;
        }

        const editor = view.editor;
        
        // Set cursor to the start of the code block
        editor.setCursor({
            line: block.lineStart,
            ch: 0
        });

        // Scroll to make it visible
        editor.scrollIntoView({
            from: { line: block.lineStart, ch: 0 },
            to: { line: block.lineStart + 5, ch: 0 }
        }, true);

        // Select the entire block for visual feedback
        const content = editor.getValue();
        const lines = content.split('\n');
        let endLine = block.lineStart;
        
        for (let i = block.lineStart + 1; i < lines.length; i++) {
            if (lines[i].trim() === '```') {
                endLine = i;
                break;
            }
        }

        editor.setSelection(
            { line: block.lineStart, ch: 0 },
            { line: endLine, ch: lines[endLine].length }
        );
    }

    /**
     * Called when the plugin is unloaded
     */
    onunload() {
        console.log("Unloading: api-request");
    }

    /**
     * Loads plugin settings from storage
     */
    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData(),
        );
    }

    /**
     * Saves plugin settings to storage
     */
    async saveSettings() {
        await this.saveData(this.settings);
    }
}
