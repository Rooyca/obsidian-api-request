// ⚠️ MESSY CODE AHEAD ⚠️
// PROCEDE UNDER YOUR OWN RISK
// DON'T JUDGE ME... TOO MUCH
// ---------------------------------------------
// == TODO ==
// CLEAN UP THIS MESS
// ---------------------------------------------

import { App, Editor, MarkdownView, Modal, Plugin, PluginSettingTab, Setting, Notice, requestUrl } from 'obsidian';
import { readFrontmatter, parseFrontmatter } from './frontmatterUtils';
import { MarkdownParser } from './mdparse';
import { saveToID, addBtnCopy, replaceOrder, nestedValue, toDocument } from './functions';
import { num_braces_regx, num_hyphen_regx, nums_rex, in_braces_regx, varname_regx, no_varname_regx } from './regx';
import { sanitizer } from './HtmlSanitizer';

const parser = new MarkdownParser();

interface LoadAPIRSettings {
	URL: string;
	MethodRequest: string;
	DataRequest: string;
	HeaderRequest: string;
	DataResponse: string;
	URLs: object[];
	Name: string;
	DisabledReq: string;
}

const DEFAULT_SETTINGS: LoadAPIRSettings = {
	URL: 'https://jsonplaceholder.typicode.com/todos/1',
	MethodRequest: 'GET',
	DataRequest: '',
	HeaderRequest: '{"Content-Type": "application/json"}',
	DataResponse: '',
	URLs: [],
	Name: '',
	DisabledReq: 'This request is disabled',
}

// Checks if the frontmatter is present in the request property
// If it is, it will replace the variable (this.VAR) with the frontmatter value
export function checkFrontmatter(req_prop: string) {
	const match = req_prop.match(varname_regx);

	if (match) {

		for (let i = 0; i < match.length; i++) {
			const var_name = match[i].replace(no_varname_regx, "");

			// if {{this.file.name}} return filename
			if (var_name == "file.name") {
				req_prop = req_prop.replace(match[i], this.app.workspace.getActiveFile().basename);
				continue;
			}
			
			const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
			const markdownContent = activeView.editor.getValue();

			try {
				const frontmatterData = parseFrontmatter(readFrontmatter(markdownContent));
				req_prop = req_prop.replace(match[i], frontmatterData[var_name] || "");
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
		console.log('loading APIR');
		await this.loadSettings();

		this.addCommand({
			id: 'show-response-in-modal',
			name: 'Show response in Modal',
			callback: () => {
				new ShowOutputModal(this.app, this.settings.URL, this.settings.MethodRequest, this.settings.DataRequest, this.settings.HeaderRequest, this.settings.DataResponse).open();
			}
		});

		try {
			this.registerMarkdownCodeBlockProcessor("req", async (source, el, ctx) => {
				const sourceLines = source.split("\n");
				let [URL, show, saveTo, reqID] = [String(), String(), String(), String()];
				let [notifyIf, properties] = [[String()], [String()]];
				// 'format' is not and empty objet, is a string that will be replaced by the response
				let [method, format] = ["GET", "{}"];
				let [headers, body, reqRepeat] = [Object(), Object(), { "times": 1, "every": 1000 }];
				const allowedMethods = ["GET", "POST", "PUT", "DELETE"];

				for (const line of sourceLines) {
					const lowercaseLine = line.toLowerCase();
					if (lowercaseLine.includes("method:")) {
						method = line.replace(/method:/i, "").toUpperCase();
						method = method.trim();
						if (!allowedMethods.includes(method)) {
							el.createEl("strong", { text: `Error: Method ${method} not supported` });
							return;
						}
					} else if (lowercaseLine.includes("notify-if:")) {
						const tempNotifyIf = line.replace(/notify-if:/i, "");
						notifyIf = tempNotifyIf.trim().split(" ");
					} else if (lowercaseLine.includes("req-repeat:")) {
						const repeat_values: string[] = line.replace(/req-repeat:/i, "").trim().split("@");

						// Function to check if a string is a valid integer
						const isValidNumber = (value: string): boolean => {
							return /^\d+$/.test(value);
						};

						// Check if there are two values and they are valid numbers
						if (repeat_values.length === 2 && isValidNumber(repeat_values[0]) && isValidNumber(repeat_values[1])) {
							reqRepeat = { "times": parseInt(repeat_values[0]), "every": parseInt(repeat_values[1]) * 1000 };
						} else {
							el.createEl("strong", { text: "Error: req-repeat format is not valid (use T@S)" });
							return;
						}

					} else if (lowercaseLine.includes("url:")) {
						URL = checkFrontmatter(line.replace(/url:/i, "").trim()) ?? "";
						if (!URL) {
							el.createEl("strong", { text: "Error: URL not found" });
							return;
						}
						if (URL && !URL.startsWith("http")) {
							URL = "https://" + URL;
						}
					} else if (lowercaseLine.includes("show:")) {
						show = line.replace(/show:/i, "").trim();
						if (!show) {
							el.createEl("strong", { text: "Error: show value is empty" });
							return;
						}
					} else if (lowercaseLine.includes("headers:")) {
						const tempHeaders = checkFrontmatter(line.replace(/headers:/i, "")) ?? "";
						if (tempHeaders) {
							try {
								headers = JSON.parse(tempHeaders);
							} catch (e) {
								el.createEl("strong", { text: "Error: Headers format is not valid" });
								return;
							}
						}
					} else if (lowercaseLine.includes("body:")) {
						body = checkFrontmatter(line.replace(/body:/i, ""));
					} else if (lowercaseLine.includes("format:")) {
						format = line.replace(/format:/i, "");
						if (!format.includes("{}")) {
							el.createEl("strong", { text: "Error: Use {} to show response in the document." });
							return;
						}
					} else if (lowercaseLine.includes("req-id:")) {
						reqID = line.replace(/id:/i, "").trim();

						if (sourceLines.includes("disabled")) {
							const idExists = localStorage.getItem(reqID);
							if (idExists) {
								el.createDiv({ text: parser.parse(idExists) });
								return;
							} else {
								sourceLines.splice(sourceLines.indexOf("disabled"), 1);
							}
						}
					} else if (lowercaseLine.includes("save-to:")) {
						saveTo = line.replace(/save-to:/i, "").trim();
						if (!saveTo) {
							el.createEl("strong", { text: "Error: save-to value is empty. Please provide a filename with extension" });
							return;
						}
					} else if (lowercaseLine.includes("properties:")) {
						// remove all spaces and split by comma
						properties = line.replace(/properties:/i, "").replace(/\s/g, "").split(",");
					}
				}

				if (sourceLines.includes("disabled")) {
					el.createEl("strong", { text: this.settings.DisabledReq });
					return;
				}

				for (let i = 0; i < reqRepeat.times; i++) {
					try {
						const responseData = await requestUrl({ url: URL, method, headers, body });
						// Save to a file
						if (saveTo) {
							try {
								await this.app.vault.create(saveTo, responseData.text);
								new Notice("Saved to: " + saveTo);
							} catch (e) {
								console.error(e.message);
								new Notice("Error: " + e.message);
							}
						}

						// Check if the response is not JSON
						if (!responseData.headers["content-type"].includes("application/json")) {
							try {
								el.innerHTML = parser.parse(sanitizer.SanitizeHtml(responseData.text));
							} catch (e) {
								new Notice("Error: " + e.message);
								el.innerHTML = "<pre>" + sanitizer.SanitizeHtml(responseData.text) + "</pre>";
							}

							if (reqID) saveToID(reqID, responseData.text);
							addBtnCopy(el, responseData.text);
							return;
						}

						if (notifyIf) {
							const jsonPath = notifyIf[0];
							const symbol = notifyIf[1];
							const value = notifyIf[2]
							const int_value = parseInt(value);

							const jsonPathValue = jsonPath.split(".").reduce((acc, cv) => acc[cv], responseData.json);
							const lastValue = jsonPath.split(".").pop();
							if (symbol === ">" && jsonPathValue > int_value) {
								new Notice("APIR: " + lastValue + " is greater than " + int_value);
							} else if (symbol === "<" && jsonPathValue < int_value) {
								new Notice("APIR: " + lastValue + " is less than " + int_value);
							} else if (symbol === "=" && jsonPathValue === value) {
								new Notice("APIR: " + lastValue + " is equal to " + value);
							} else if (symbol === ">=" && jsonPathValue >= int_value) {
								new Notice("APIR: " + lastValue + " is greater than or equal to " + int_value);
							} else if (symbol === "<=" && jsonPathValue <= int_value) {
								new Notice("APIR: " + lastValue + " is less than or equal to " + int_value);
							}
						}

						if (!show) {
							if (properties.length > 0 && properties[0] !== '') {
								el.createEl("strong", { text: "Error: Properties are not allowed without SHOW" });
								return;
							}
							el.innerHTML = "<pre>" + JSON.stringify(responseData.json, null, 2) + "</pre>";
							if (reqID) saveToID(reqID, el.innerText);
							addBtnCopy(el, el.innerText);
						} else {
							const checkBracesRegex = show.match(in_braces_regx);
							if (checkBracesRegex) {
								if (show.includes(",")) {
									el.createEl("strong", { text: "Error: comma is not allowed when using {}" });
									return;
								}

								let temp_show = "";
								let range: number[] = [];

								try {
									const rangeMatch = show.match(nums_rex);
									if (rangeMatch) {
										range = rangeMatch.map(Number);
										if (range[0] > range[1]) {
											el.createEl("strong", { text: "Error: range is not valid" });
											return;
										}
									}
								} catch (e) {
									console.error(e.message);
								}

								const numberBracesRegex = show.match(num_braces_regx);

								if (!numberBracesRegex) {
									if (Array.isArray(responseData.json)) {
										for (let i = 0; i < responseData.json.length; i++) {
											temp_show += show.replace(in_braces_regx, i.toString()) + ", ";
										}
										show = temp_show;
									} else {
										const parts = show.split('->').map(part => part.trim());

										const processNestedObject = (obj: any, parts: string[]): string => {
											let result = "";

											const traverse = (current: any, idx: number) => {
												if (idx >= parts.length) {
													if (typeof current === "object") {
														current = JSON.stringify(current, null, 2);
													}
													result += current + ", ";
													return;
												}

												const part = parts[idx];
												if (part === "{..}") {
													if (Array.isArray(current)) {
														current.forEach((item, i) => {
															traverse(item, idx + 1);
														});
													} else {
														el.createEl("strong", { text: "Error: {..} used on non-array element" });
													}
												} else {
													traverse(current[part], idx + 1);
												}
											};

											traverse(obj, 0);
											return result;
										};

										temp_show = processNestedObject(responseData.json, parts);
										show = temp_show;
									}
								} else {
									for (let i: number = range[0]; i <= range[1]; i++) {
										temp_show += show.replace(numberBracesRegex![0], i.toString()) + ", ";
									}
									show = temp_show;
								}

								if (show.match(num_hyphen_regx)) {
									show = show.replace(in_braces_regx, "-");
									for (let i = 0; i < range.length; i++) {
										temp_show += show.replace("-", range[i].toString()) + ", ";
									}
									show = temp_show;
								} 
							}

							// adding properties to frontmatter
							if (properties.length > 0 && properties[0] !== '') {
								const showArray = show.split(",");
								const propertiesArray = properties;
								const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
								const file: TFile = activeView!.file;

								await Promise.all(showArray.map(async (key, index) => {
									const trimmedKey = key.trim();
									let val = "";

									if (trimmedKey.includes("->")) {
										val = nestedValue(responseData, trimmedKey);
									} else if (responseData.json && responseData.json[trimmedKey]) {
										val = responseData.json[trimmedKey];
									}

									let propertyName = propertiesArray[index].trim();
									if (propertyName) {
										const match = propertyName.match(/\[\[(.*?)\]\]/);
										if (match) propertyName = match[1];
										await this.app.fileManager.processFrontMatter(file, (existingFrontmatter) => {
											if (typeof val === "object") {
												Object.keys(val).forEach((key) => {
													if (typeof val[key] === "number") {
														if (match) {
															val[key] = "[[" + val[key].toString() + "]]";
														} else {
															val[key] = val[key].toString();
														}
													}
												});
											} 
											if (match && typeof val !== "object") {
												val = "[["+val+"]]"
											}
											existingFrontmatter[propertyName] = val;
										});
									}
								}));
							}

							const trimAndProcessKey = (key: string) => {
								const trimmedKey = key.trim();
								return trimmedKey.includes("->")
									? nestedValue(responseData, trimmedKey)
									: JSON.stringify(responseData.json[trimmedKey]);
							};

							const values = show.split(",").map(trimAndProcessKey);
							let replacedText = replaceOrder(format, values);

							if (replacedText === 'undefined') {
								show = show.trim();
								if (show[show.length - 1] === ',') {
									show = show.slice(0, -1);
								}
								replacedText = show;
							}

							el.createEl("pre", { text: replacedText });
							if (reqID) saveToID(reqID, replacedText);
							addBtnCopy(el, replacedText);
						}
					} catch (error) {
						console.error(error);
						el.createEl("strong", { text: "Error: " + error.message });
						new Notice("Error: " + error.message);
					}
					await sleep(reqRepeat.every);
				}
				return; 
			});
		} catch (e) {
			console.error(e.message);
			new Notice("Error: " + e.message);
		}

		this.addCommand({
			id: 'response-in-document',
			name: 'Paste response in current document',
			editorCallback: (editor: Editor) => {
				const set = this.settings;
				const requestOptions = {
					url: set.URL,
					method: set.MethodRequest,
					headers: JSON.parse(set.HeaderRequest),
					...(set.MethodRequest !== "GET" && { body: set.DataRequest })
				};
				toDocument(requestOptions, set.DataResponse, editor);
			}
		});

		for (let i = 0; i < this.settings.URLs.length; i++) {
			this.addCommand({
				id: 'response-in-document-' + this.settings.URLs[i]["Name"],
				name: 'Response for api: ' + this.settings.URLs[i]["Name"],
				editorCallback: (editor: Editor, view: MarkdownView) => {
					const rea = this.settings.URLs[i];
					toDocument(rea, this.settings.URLs[i]["DataResponse"], editor);
				}
			});
		}

		this.addSettingTab(new APRSettings(this.app, this));
	}

	onunload() {
		console.log('unloading APIR');
		// Clean up localStorage
		// Object.keys(localStorage).forEach(key => {
		// 	if (key.startsWith("req-")) {
		// 		localStorage.removeItem(key);
		// 	}
		// });
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class ShowOutputModal extends Modal {
	constructor(app: App, URL: string, MethodRequest: string, DataRequest: string, HeaderRequest: string, DataResponse: string) {
		super(app);
		this.props = {
			URL,
			MethodRequest,
			DataRequest,
			HeaderRequest,
			DataResponse,
		};
	}

	onOpen() {
		const { contentEl } = this;
		const { URL, MethodRequest, DataRequest, HeaderRequest, DataResponse } = this.props;

		const handleError = (error: Error) => {
			console.error(error);
			new Notice("Error: " + error.message);
		};

		const parseAndCreate = (data: object) => (key: string) => {
			const value = DataResponse.includes("->") ? nestedValue(data, key) : data[key];
			contentEl.createEl('b', { text: key + " : " + JSON.stringify(value, null, 2) });
		};

		const requestOptions = {
			url: URL,
			method: MethodRequest,
			headers: JSON.parse(HeaderRequest),
			...(MethodRequest !== "GET" && { body: DataRequest })
		};

		requestUrl(requestOptions)
			.then((data) => {
				if (DataResponse !== "") {
					const DataResponseArray = DataResponse.split(",");
					DataResponseArray.forEach(parseAndCreate(data));
				} else {
					contentEl.createEl('b', { text: JSON.stringify(data.json, null, 2) });
				}
			})
			.catch(handleError);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class APRSettings extends PluginSettingTab {
	plugin: MainAPIR;

	constructor(app: App, plugin: MainAPIR) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		containerEl.createEl('h2', { text: "Add New Request" });

		new Setting(containerEl)
			.setName('Name')
			.setDesc('Name of request')
			.addText(text => text
				.setPlaceholder('Name')
				.setValue(this.plugin.settings.Name)
				.onChange(async (value) => {
					if (value !== "") {
						this.plugin.settings.Name = value;
						await this.plugin.saveSettings();
					}
				}));

		new Setting(containerEl)
			.setName('URL')
			.setDesc('Endpoint to fetch data from')
			.addText(text => text
				.setPlaceholder('URL')
				.setValue(this.plugin.settings.URL)
				.onChange(async (value) => {
					this.plugin.settings.URL = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Method')
			.setDesc("Select the desired method")
			.addDropdown(dropDown => {
				dropDown.addOption("GET", "GET");
				dropDown.addOption("POST", "POST");
				dropDown.addOption("POST", "PUT");
				dropDown.addOption("DELETE", "DELETE");
				dropDown.setValue(this.plugin.settings.MethodRequest)
				dropDown.onChange(async value => {
					this.plugin.settings.MethodRequest = value;
					await this.plugin.saveSettings();
				});
			});
		new Setting(containerEl)
			.setName('Body')
			.setDesc("Data to send in the body")
			.addTextArea(text => text
				.setPlaceholder('{"data":"data"}')
				.setValue(this.plugin.settings.DataRequest)
				.onChange(async (value) => {
					this.plugin.settings.DataRequest = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Headers')
			.setDesc("The headers of the request")
			.addTextArea(text => text
				.setPlaceholder('{"Content-Type": "application/json"}')
				.setValue(this.plugin.settings.HeaderRequest)
				.onChange(async (value) => {
					this.plugin.settings.HeaderRequest = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('What to display')
			.setDesc("Write the name of the variables you want to show (spaced by comma)")
			.addText(text => text
				.setPlaceholder('varname')
				.setValue(this.plugin.settings.DataResponse)
				.onChange(async (value) => {
					this.plugin.settings.DataResponse = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.addButton(button => {
				button.setClass('btn-add-apir');
				button.setButtonText('ADD').onClick(async () => {
					const { Name } = this.plugin.settings;
					if (Name === "") {
						new Notice("Name is empty");
						return;
					}
					const { URL, MethodRequest, DataResponse, DataRequest, HeaderRequest } = this.plugin.settings;
					const { URLs } = this.plugin.settings;
					URLs.push({
						'url': URL, 
						'Name': Name, 
						'method': MethodRequest, 
						'body': DataRequest,
						'headers': HeaderRequest, 
						'DataResponse': DataResponse
					});
					await this.plugin.saveSettings();
					this.display();
					this.plugin.addCommand({
						id: 'response-in-document-' + Name,
						name: 'Response for api: ' + Name,
						editorCallback: (editor: Editor) => {
							const rea = URLs[URLs.length - 1];
							toDocument(rea, rea.DataResponse, editor);
						}
					});
				});
			});

		containerEl.createEl('hr');

		containerEl.createEl('h2', { text: 'Codeblock Settings' });
		new Setting(containerEl)
			.setName('Text when request is Disabled')
			.setDesc("What to show when a request is disabled")
			.addText(text => text
				.setPlaceholder('This request is disabled')
				.setValue(this.plugin.settings.DisabledReq)
				.onChange(async (value) => {
					this.plugin.settings.DisabledReq = value;
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('hr');

		containerEl.createEl('h2', { text: 'Manage Requests' });
		this.displayInfoApirs(containerEl);

		new Setting(containerEl)
			.addButton(button => {
				button.setClass('btn-clear-apir');
				button.setButtonText("Clear localStorage").onClick(async () => {
					Object.keys(localStorage).forEach(key => {
						if (key.startsWith("req-")) {
							localStorage.removeItem(key);
						}
					});
					this.display();
				});
			});
	}

	displayInfoApirs(containerEl: HTMLElement) {
		// Render URL table
		const { URLs } = this.plugin.settings;
		const ct = containerEl.createEl('div', { cls: 'cocontainer' });
		if (URLs.length > 0) {
			const tableContainer = ct.createEl('div', { cls: 'table-container' });
        
			const table = tableContainer.createEl('table', { cls: 'api-table' });
			const thead = table.createEl('thead');
			const headerRow = thead.createEl('tr');
			headerRow.createEl('th', { text: 'Name' });
			headerRow.createEl('th', { text: 'URL' });

			const tbody = table.createEl('tbody');
			URLs.forEach((u) => {
				const row = tbody.createEl('tr');

				row.createEl('td', { text: u.Name });

				const urlCell = row.createEl('td');
				urlCell.createEl('a', { text: u.url.length > 50 ? u.url.substring(0, 50) + "..." : u.url, cls: 'api-url' });

				urlCell.addEventListener('click', async () => {
					const index = URLs.indexOf(u);
					URLs.splice(index, 1);
					await this.plugin.saveSettings();
					this.display();
				});
			});
		}

		// Render localStorage table
		containerEl.createEl('div', { cls: 'table-container full-width' });
		const table = ct.createEl('table', { cls: 'api-table full-width' });
		const thead = table.createEl('thead');
		const headerRow = thead.createEl('tr');
		const hr = headerRow.createEl('th', { text: 'ID' });

		const tbody = table.createEl('tbody');
		Object.keys(localStorage).forEach(key => {
			if (key.startsWith("req-")) {
				const row = tbody.createEl('tr');
				const idCell = row.createEl('td', { text: key });

				idCell.addEventListener('click', async () => {
					localStorage.removeItem(key);
					this.display();
				});
			}
		});
		// if table is empty
		if (tbody.children.length === 0) {
			hr.innerText = 'No response saved';
		}
	}

}