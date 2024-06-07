import { App, Editor, MarkdownView, Modal, Plugin, PluginSettingTab, Setting, Notice } from 'obsidian';
import { readFrontmatter, parseFrontmatter } from './frontmatterUtils';
import { MarkdownParser } from './mdparse';
import { checkFrontmatter, saveToID, addBtnCopy, replaceOrder, nestedValue, toDocument } from './functions';
import { num_braces_regx, num_hyphen_regx, nums_rex, in_braces_regx, varname_regx, no_varname_regx } from './regx';

const parser = new MarkdownParser();

interface LoadAPIRSettings {
	URL: string;
	MethodRequest: string;
	DataRequest: string;
	HeaderRequest: string;
	DataResponse: string;
	URLs: string[];
	Name: string;
}

const DEFAULT_SETTINGS: LoadAPIRSettings = {
	URL: 'https://jsonplaceholder.typicode.com/todos/1',
	MethodRequest: 'GET',
	DataRequest: '',
	HeaderRequest: '{"Content-Type": "application/json"}',
	DataResponse: '',
	URLs: [],
	Name: '',
}

// Checks if the frontmatter is present in the request property
// If it is, it will replace the variable (this.VAR) with the frontmatter value
export function checkFrontmatter(req_prop: string) {
	const match = req_prop.match(varname_regx);

	if (match) {

		for (let i = 0; i < match.length; i++) {
			const var_name = match[i].replace(no_varname_regx, "");
			
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
		        let method = "GET", allowedMethods = ["GET", "POST", "PUT", "DELETE"], URL = "", show = "", 
		        	headers = {}, body = {}, format = "{}", responseType = "json", reqID = "req-general", 
		        	reqRepeat = { "times": 1, "every": 1000 }, notifyIf = "", saveTo = "";

		        for (const line of sourceLines) {
		            const lowercaseLine = line.toLowerCase();
		            if (lowercaseLine.includes("method: ")) {
		                method = line.replace(/method: /i, "").toUpperCase();
		                if (!allowedMethods.includes(method)) {
		                    el.createEl("strong", { text: `Error: Method ${method} not supported` });
		                    return;
		                }
		            } else if (lowercaseLine.includes("notify-if: ")) {
		                notifyIf = line.replace(/notify-if: /i, "");
		                notifyIf = notifyIf.split(" ");
		            } else if (lowercaseLine.includes("req-repeat: ")) {
						let repeat_values = line.replace(/req-repeat: /i, "");
						repeat_values = repeat_values.split("@");

						// check if there are two values and they are numbers
						if (repeat_values.length === 2 && !isNaN(repeat_values[0]) && !isNaN(repeat_values[1])) {
							reqRepeat = {"times": parseInt(repeat_values[0]), "every": parseInt(repeat_values[1])*1000};
						} else {
							el.createEl("strong", { text: "Error: req-repeat format is not valid (use Nt@Ns)" });
							return;
						}
		            } else if (lowercaseLine.includes("url: ")) {
		                URL = checkFrontmatter(line.replace(/url: /i, ""));
		                if (!URL.includes("http")) {
		                    URL = "https://" + URL;
		                }
		            } else if (lowercaseLine.includes("res-type: ")) {
		                responseType = line.replace(/res-type: /i, "").toLowerCase();
		                if (!["json", "txt", "md"].includes(responseType)) {
		                    el.createEl("strong", { text: `Error: Response type ${responseType} not supported` });
		                    return;
		                }
		            } else if (lowercaseLine.includes("show: ")) {
		                show = line.replace(/show: /i, "");
		            } else if (lowercaseLine.includes("headers: ")) {
		                headers = JSON.parse(checkFrontmatter(line.replace(/headers: /i, "")));
		            } else if (lowercaseLine.includes("body: ")) {
		                body = checkFrontmatter(line.replace(/body: /i, ""));
		            } else if (lowercaseLine.includes("format: ")) {
		                format = line.replace(/format: /i, "");
		                if (!format.includes("{}")) {
		                    el.createEl("strong", { text: "Error: Use {} to show response in the document." });
		                    return;
		                }
		            } else if (lowercaseLine.includes("req-id: ")) {
		                reqID = line.replace(/id: /i, "");

			            if (sourceLines.includes("disabled")) {
			            	const idExists = localStorage.getItem(reqID);
			            	if (idExists) {
			            		el.innerHTML += parser.parse(idExists);
			            		return;
			            	} else {
			            		sourceLines.splice(sourceLines.indexOf("disabled"), 1);
			            	}
			            }
		            } else if (lowercaseLine.includes("save-to: ")) {
										saveTo = line.replace(/save-to: /i, "");
		                if (saveTo === "") {
		                    el.createEl("strong", { text: "Error: save-to value is empty. Please provide a filename" });
		                    return;
		                }
		            }
		            if (URL === "") {
		                el.createEl("strong", { text: "Error: URL not found" });
		                return;
		            }
		        }

		        if (sourceLines.includes("disabled")) {
		            el.createEl("strong", { text: "This request is disabled." });
		            return;
		        }

		        for (let i = 0; i < reqRepeat.times; i++) {
			        try {
			            const responseData = await requestUrl({ url: URL, method, headers, body });
			            // Save to File
			            if (saveTo) {
			            	try {
			            		await this.app.vault.create(saveTo, responseData.text);
			            		new Notice("Saved to " + saveTo);
			            	} catch (e) {
			            		console.error(e.message);
			            		new Notice("Error: " + e.message);
			            	}
			            }

			            if (responseType !== "json") {
			            	try {
			            		el.innerHTML += parser.parse(responseData.text);
			            	} catch (e) {
			            		new Notice("Error: " + e.message);
			            		el.createEl("strong", { text: responseData.text });
			            	}
			            	saveToID(reqID, responseData.text);
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
			          el.innerHTML = "<pre>" + JSON.stringify(responseData.json, null, 2) + "</pre>";
			          saveToID(reqID, el.innerText);
			          addBtnCopy(el, el.innerText);
			      } else {
							if (show.match(in_braces_regx)) {
								if (show.includes(",")) {
									el.createEl("strong", { text: "Error: comma is not allowed when using {}" });
									return;
								}

								let temp_show = "";

								if (show.match(num_braces_regx)) {
									const range = show.match(nums_rex).map(Number);
									if (range[0] > range[1]) {
										el.createEl("strong", { text: "Error: range is not valid" });
										return;
									}
									for (let i = range[0]; i <= range[1]; i++) {
										temp_show += show.replace(show.match(num_braces_regx)[0], i) + ", ";
									}
									show = temp_show;
								} else if (show.match(num_hyphen_regx)) {
										const numbers = show.match(nums_rex).map(Number);
										show = show.replace(in_braces_regx, "-");
										for (let i = 0; i < numbers.length; i++) {
											temp_show += show.replace("-", numbers[i]) + ", ";
										}
										show = temp_show;
								} else {
								    for (let i = 0; i < responseData.json.length; i++) {
								        temp_show += show.replace("{..}", i) + ", ";
								    }
								    show = temp_show;
						  		}
							}

			                const values = show.includes(",") ? show.split(",").map(key => {
			                    let value = JSON.stringify(responseData.json[key.trim()]);
			                    if (key.includes("->")) value = nestedValue(responseData, key);
			                    return value;
			                }) : [show.trim().includes("->") ? nestedValue(responseData, show.trim()) : JSON.stringify(responseData.json[show.trim()])];
			                const replacedText = replaceOrder(format, values);
			                el.innerHTML = parser.parse(replacedText);

			                saveToID(reqID, replacedText);
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
		    el.createEl("strong", { text: "Error: " + error.message });
		    new Notice("Error: " + e.message);
		}

		this.addCommand({
			id: 'response-in-document',
			name: 'Paste response in current document',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				toDocument(this.settings, editor);
			}
		});

		for (let i = 0; i < this.settings.URLs.length; i++) {
			this.addCommand({
				id: 'response-in-document-' + this.settings.URLs[i].Name,
				name: 'Response for api: ' + this.settings.URLs[i].Name,
				editorCallback: (editor: Editor, view: MarkdownView) => {
					const rea = this.settings.URLs[i];
					toDocument(rea, editor);
				}
			});
		}

		this.addSettingTab(new APRSettings(this.app, this));
	}

	onunload() {
		console.log('unloading APIR');
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

	  const handleError = (error) => {
	    console.error(error);
	    new Notice("Error: " + error.message);
	  };

	  const parseAndCreate = (data) => (key) => {
	    const json = data.json;
	    const value = DataResponse.includes("->") ? nestedValue(data, key) : json[key];
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
		const {containerEl} = this;

		containerEl.empty();
		containerEl.createEl('h2', { text: "Add Request" });

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
	      .addTextArea(text => text
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
                		const {Name} = this.plugin.settings;
                		if (Name === "") {
                			new Notice("Name is empty");
                			return;
										}
                		const {URL, MethodRequest, DataResponse, DataRequest, HeaderRequest} = this.plugin.settings;
                		const {URLs} = this.plugin.settings;
                		URLs.push({
                			'URL': URL, 
                			'Name': Name, 
                			'MethodRequest': MethodRequest, 
                			'DataRequest': DataRequest,
                			'HeaderRequest': HeaderRequest, 
                			'DataResponse': DataResponse
                		});
                		await this.plugin.saveSettings();
                		this.display();
                		this.plugin.addCommand({
                			id: 'response-in-document-' + Name,
                			name: 'Response for api: ' + Name,
                			editorCallback: (editor: Editor, view: MarkdownView) => {
                				const rea = URLs[URLs.length - 1];
                				toDocument(rea, editor);
											}
										});
                });
            });

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
        URLs.forEach((url) => {
            const row = tbody.createEl('tr');

            row.createEl('td', { text: url.Name });

            const urlCell = row.createEl('td');
            urlCell.createEl('a', { text: url.URL.length > 50 ? url.URL.substring(0, 50) + "..." : url.URL, cls: 'api-url' });

            urlCell.addEventListener('click', async () => {
                const index = URLs.indexOf(url);
                URLs.splice(index, 1);
                await this.plugin.saveSettings();
                this.display();
            });
        });
    }

    // Render localStorage table
    const tableContainer = containerEl.createEl('div', { cls: 'table-container full-width' });
    const table = ct.createEl('table', { cls: 'api-table full-width' });
    const thead = table.createEl('thead');
    const headerRow = thead.createEl('tr');
    let hr = headerRow.createEl('th', { text: 'ID' });

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