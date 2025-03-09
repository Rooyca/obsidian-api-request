import {
    MarkdownView,
    Plugin,
    Notice,
    requestUrl,
    debounce,
} from "obsidian";
import {
    readFrontmatter,
    parseFrontmatter,
} from "src/functions/frontmatterUtils";
import { addBtnCopy } from "src/functions/general";
import { varname_regx, no_varname_regx, key_regx } from "src/functions/regx";
import APRSettings from "src/settings/settingsTab";
import { JSONPath } from "jsonpath-plus";
import { LoadAPIRSettings, DEFAULT_SETTINGS } from "src/settings/settingsData";

// Get global variables (defined in settings)
export function checkGlobalValue(value: string, settings: LoadAPIRSettings) {
    const match = value.match(key_regx);

    if (match) {
        for (let i = 0; i < match.length; i++) {
            const key = match[i].replace(/{{|}}/g, "");
            value = value.replace(
                match[i],
                settings.KeyValueCodeblocks.find((obj) => obj.key === key)
                    ?.value || "",
            );
        }
    }
    return value;
}

// Get data from localStorage using this syntax: {{ls.UUID>JSONPath}}
// where `ls` stands for `localStorage`
export function checkLocalStorage(value: string) {
    const match = value.match(key_regx);

    if (match) {
        for (let i = 0; i < match.length; i++) {
            const key = match[i].replace(/{{|}}/g, "");
            let uuid = key.split(">")[0];
            const jsonPath = key.split(">")[1];
            uuid = uuid.split(".")[1]
            const data = localStorage.getItem(uuid);
            if (data) {
                const parsedData = JSON.parse(data);
                const output = JSONPath({ path: jsonPath, json: parsedData });
                value = value.replace(match[i], output);
            }
        }
    }
    return value;
}

// parse headers and body to valid JSON
export function parseToValidJson(input, type) {
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

// format the output to be displayed
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

// Check if the value has variables and replace them
export function checkVariables(req_prop: string, settings: LoadAPIRSettings) {
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
                req_prop = req_prop.replace(
                    match[i],
                    this.app.workspace.getActiveFile().basename,
                );
                continue;
            }

            const activeView =
                this.app.workspace.getActiveViewOfType(MarkdownView);
            const markdownContent = activeView.editor.getValue();

            try {
                const frontmatterData = parseFrontmatter(
                    readFrontmatter(markdownContent),
                );
                req_prop = req_prop.replace(
                    match[i],
                    frontmatterData[var_name] || "",
                );
            } catch (e) {
                console.error(e.message);
                new Notice("Error: " + e.message);
                return;
            }
        }
    }
    return req_prop;
}

export default class MainAPIR extends Plugin {
    settings: LoadAPIRSettings;

    async onload() {
        console.log("loading APIR");
        await this.loadSettings();

        async function updateStatusBar() {
            const statusbar = document.getElementsByClassName(
                "status-bar-item plugin-api-request",
            );
            while (statusbar[0]) {
                statusbar[0].parentNode?.removeChild(statusbar[0]);
            }

            // count the number of code-blocks
            const markdownContent = this.app.workspace
                .getActiveViewOfType(MarkdownView)
                ?.getViewData();
            const codeBlocks = markdownContent?.match(/```req/g)?.length || 0;
            if (codeBlocks > 0) {
                const item = this.addStatusBarItem();

                const statusText = this.settings.countBlocksText.replace(
                    "%d",
                    codeBlocks.toString(),
                );
                item.createEl("span", { text: statusText });
            }
        }

        // count number of codeblocks on "file-open" and "changes to the file"
        this.registerEvent(
            this.app.workspace.on(
                "file-open",
                debounce(updateStatusBar.bind(this), 300),
            ),
        );
        this.registerEvent(
            this.app.workspace.on("editor-change", updateStatusBar.bind(this)),
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
                            if (!allowedMethods.includes(method)) {
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

                            // extract data using jsonpath-plus (https://www.npmjs.com/package/jsonpath-plus)
                        } else if (lowercaseLine.startsWith("show:")) {
                            show =
                                checkVariables(
                                    line.replace(/show: /i, "").trim(),
                                    this.settings,
                                ) ?? "";
                            if (!show) {
                                el.createEl("strong", {
                                    text: "Error: show value is empty",
                                });
                                return;
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
                            } catch (e) {
                                el.createEl("strong", { text: e.message });
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
                            } catch (e) {
                                el.createEl("strong", { text: e.message });
                                return;
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
                        } else if (lowercaseLine.startsWith("req-uuid:")) {
                            uuid = line.replace(/req-uuid:/i, "").trim();
                            if (!uuid) {
                                el.createEl("strong", {
                                    text: "Error: req-uuid is empty. Please provide a unique identifier",
                                });
                                return;
                            }
                            uuid = `req-${uuid}`
                        } else if (lowercaseLine.startsWith("auto-update")) {
                            autoUpdate = true;
                        } else if (lowercaseLine.startsWith("format:")) {
                            format = line.replace(/format:/i, "").trim();
                        } else if (lowercaseLine.startsWith("properties:")) {
                            properties = line
                                .replace(/properties:/i, "")
                                .trim()
                                .split(",");
                        }
                    }

                    let responseData;
                    let responseDataText;

                    // Check if the response is cached in localStorage
                    if (uuid && !autoUpdate) {
                        const cachedResponse = localStorage.getItem(uuid);
                        if (cachedResponse) {
                            responseData = JSON.parse(cachedResponse);
                            const temp_uuid = uuid.split("req-")[1]
                            new Notice(`Using cached data with UUID: ${temp_uuid}`);
                        }
                    }

                    // If no cached data or auto-update is requested, make a new request
                    if (!responseData || autoUpdate) {
                        try {
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
                                localStorage.setItem(
                                    uuid,
                                    JSON.stringify(responseData),
                                );
                            }
                        } catch (e) {
                            console.error(e.message);
                            new Notice("Error: " + e.message);
                            responseData = `Error: ${e.message}`;
                        }
                    }

                    let output = responseData;

                    if (show) {
                        // split show by `+` to check if user defined more than one path
                        show = show.split("+");
                        
                        // check if the user defined more than one path
                        // if so, iterate over each path and get the data
                        output = show.length > 1 
                          ? show.map((path) => JSONPath({ path: path.trim(), json: responseData })) 
                          : JSONPath({ path: show[0], json: responseData });

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

                    // if a *format* is defined in the codeblock
                    // render the response, else just *return* the response as String
                    if (format) {
                        const parts = formattedOutput.split(",");
                        el.innerHTML = format.replace(/{}/g, () => parts.shift() || "");
                    } else {
                        el.createEl("pre", { text: formattedOutput });
                    }
                    
                    // add a button to copy the output
                    addBtnCopy(el, formattedOutput);

                    // Save to a file
                    if (saveTo) {
                        try {
                            // try to create the file. It'll fail if already exists
                            await this.app.vault.create(
                                saveTo,
                                responseDataText,
                            );
                            new Notice("Saved to: " + saveTo);
                        } catch (e) {
                            // try to modify the file
                            const file =
                                this.app.vault.getAbstractFileByPath(saveTo);
                            await this.app.vault.modify(file, responseDataText);
                            new Notice("File modified");
                        }
                    }
                },
            );
        } catch (e) {
            console.error(e.message);
            new Notice("Error: " + e.message);
        }

        // TODO
        // Make *Inline queries* using responses from codeblocks

        //this.registerMarkdownPostProcessor(async (element, context) => {
        //  const codeblocks = element.findAll("code");
        //  for (const codeblock of codeblocks) {
        //      const text = codeblock.innerText.trim();
        //
        //      const inlineMatches = text.match(/{{(.*?)}}/g);
        //      if (inlineMatches) {
        //          inlineMatches.forEach((match) => {
        //              const varName = match.replace(/{{|}}/g, "").trim();
        //              const value = localStorage.getItem(varName);
        //              element.innerHTML = element.innerHTML.replace(match, value);
        //          });
        //      }
        //}});

        this.addSettingTab(new APRSettings(this.app, this));
    }

    onunload() {
        console.log("unloading APIR");
    }

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData(),
        );
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
