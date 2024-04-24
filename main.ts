import { App, Editor, MarkdownView, Modal, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { readFrontmatter, parseFrontmatter } from './frontmatterUtils';

export function checkFrontmatter(req_prop: string){
	const regex = /{{this\.([^{}]*)}}/g;
	const match = req_prop.match(regex);

	if (match) {
		const var_name = match[0].replace(/{{this\.|}}/g, "");
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		const markdownContent = activeView.editor.getValue();

		try {
			const frontmatterData = parseFrontmatter(readFrontmatter(markdownContent));
			req_prop = req_prop.replace(regex, frontmatterData[var_name] || "");
			return req_prop;
		} catch (e) {
			console.error(e.message);
			return;
			}
		} 
		return req_prop;
}

export function replaceOrder(stri, val) {
    let index = 0;
    let replaced = stri.replace(/{}/g, function(match) {
        return val[index++];
    });

    if (index < val.length) {
        replaced += "<br\>" + val.slice(index).join('');
    }

    return replaced;
}

interface LoadAPIRSettings {
	URL: string;
	FormatOut: string;
	MethodRequest: string;
	DataRequest: string;
	HeaderRequest: string;
	DataResponse: string;
	URLs: string[];
	Name: string;
}

const DEFAULT_SETTINGS: LoadAPIRSettings = {
	URL: 'https://jsonplaceholder.typicode.com/todos/1',
	FormatOut: 'json',
	MethodRequest: 'GET',
	DataRequest: '',
	HeaderRequest: '{"Content-Type": "application/json"}',
	DataResponse: '',
	URLs: [],
	Name: '',
}

function nestedValue(data: any, key: string) {
		const keySplit: string[] = key.split("->").map((item) => item.trim());
		var value: any = "";
		for (let i: number = 0; i < keySplit.length; i++) {
			if (i === 0) {
				value = data.json[keySplit[i]];
		} else {
			value = value[keySplit[i]];
			}
		}
		return value;
	}

function toDocument(settings: any, editor: Editor) {
			requestUrl({
			  	url: settings.URL,
			    method: settings.MethodRequest,
			    body: settings.DataRequest,
			  })
					.then((data: JSON) => {
					  if (settings.DataResponse !== "") {
					    const DataResponseArray = settings.DataResponse.split(",");
					    for (let i = 0; i < DataResponseArray.length; i++) {
					    	const key = DataResponseArray[i].trim();

					    	var value = JSON.stringify(data.json[key]);

								if (key.includes("->")) {
					    		value = nestedValue(data, key);
					    	}
					      
					      if (settings.FormatOut === "variable") {
					      	value = JSON.stringify(value);
					        editor.replaceSelection(`${key.split("->").pop()} : ${value}\n`);
					      }
					      if (settings.FormatOut === "json") {
					      	if (key.includes("->")) {
					      		value = JSON.stringify(value);
					      		}
					        editor.replaceSelection("```json\n" + `${key.split("->").pop()} : ${value}\n` + "```\n\n");
					      }
					    }
					  } else {
					    if (settings.FormatOut === "variable") {
					      editor.replaceSelection(`${JSON.stringify(data.json)}\n`);
					    }
					    if (settings.FormatOut === "json") {
					      editor.replaceSelection("```json\n" + `${JSON.stringify(data.json)}\n` + "```\n");
					    }
					  }
					})
			    .catch((error: Error) => {
			      console.error(error);
			    });
}

export default class MainAPIR extends Plugin {
	settings: LoadAPIRSettings;

	async onload() {
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

	        let method: string = "GET";
	        let allowedMethods: string[] = ["GET", "POST", "PUT", "DELETE"];
	        let URL: string = "";
	        let show: string = "";
	        let headers: any = {};
	        let body: any = {};
	        let format: string = "{}";
	        let responseType: string = "json";

	        for (const line of sourceLines) {
						let lowercaseLine = line.toLowerCase();

						switch (true) {
						    case lowercaseLine.includes("method: "):
						        method = line.replace(/method: /i, "").toUpperCase();
						        if (!allowedMethods.includes(method.toUpperCase())) {
						            el.innerHTML = "Error: Method " + method + " not supported";
						            return;
						        }
						        break;

						    case lowercaseLine.includes("url: "):
										URL = line.replace(/url: /i, "");
										URL = checkFrontmatter(URL);
						        break;

						    case lowercaseLine.includes("response-type"):
						    		responseType = line.replace(/response-type: /i, "").toLowerCase();
						    		const allowedResponseTypes = ["json", "txt", "md"];
						    		if (!allowedResponseTypes.includes(responseType)) {
						    				el.innerHTML = "Error: Response type " + responseType + " not supported";
						            return;
						        }
						        break;

						    case lowercaseLine.includes("show: "):
						        show = line.replace(/show: /i, "");
						        break;

						    case lowercaseLine.includes("headers: "):
						        headers = line.replace(/headers: /i, "");
						        headers = JSON.parse(checkFrontmatter(headers));
						        break;

						    case lowercaseLine.includes("body: "):
						        body = line.replace(/body: /i, "");
						        body = checkFrontmatter(body);
						        break;

						    case lowercaseLine.includes("format: "):
						        format = line.replace(/format: /i, "");
						        if (!format.includes("{}")) {
						            el.innerHTML = "Error: Use {} to show response in the document.";
						            return;
						        }
						        break;
						}
	            if (URL === "") {
	            			el.innerHTML = "Error: URL not found";
	            			return;
	            }
	        }

	        try {
	        		let formatSplit = format.split("{}");
	        		let responseData: any;
	        		
	        		if (method !== "GET") {
	            		responseData = await requestUrl({ url: URL, method, headers, body });
	            } else {
	            	responseData = await requestUrl({ url: URL, headers });
	            }

							if (responseType !== "json") {
	            		el.innerHTML = formatSplit[0] + responseData.text + formatSplit[1];
	            } else if (!show) {
	                el.innerHTML = formatSplit[0] + JSON.stringify(responseData.json, null) + formatSplit[1];
	            } else {
	            		if (show.includes(",")) {
	            			const showSplit = show.split(",");
	            			let values = [];
	            			for (let i = 0; i < showSplit.length; i++) {
	            				const key = showSplit[i].trim();
	            				let value = JSON.stringify(responseData.json[key]);

	            				if (key.includes("->")) {
	            					value = nestedValue(responseData, key);
	            				}
	            				values.push(value);
	            			}
	            			el.innerHTML = replaceOrder(format, values);
	            		} else {
	            			const key = show.trim();
	            			let value = JSON.stringify(responseData.json[key]);

	            			if (key.includes("->")) {
	            				value = nestedValue(responseData, key);
	            			}

	            			el.innerHTML = formatSplit[0] + value + formatSplit[1];
	            		}
	            }
	        } catch (error) {
	            console.error(error);
	            el.innerHTML = "Error: " + error.message;
	        }
	    });
		} catch (e) {
		    console.error(e.message);
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
  console.log(HeaderRequest)

  if (MethodRequest === "GET") {
    requestUrl({
    	url: URL,
      method: MethodRequest,
      headers: JSON.parse(HeaderRequest)
    })
      .then((data: JSON) => {
        if (DataResponse !== "") {
          const DataResponseArray = DataResponse.split(",");
          for (let i = 0; i < DataResponseArray.length; i++) {
          	if (DataResponseArray[i].includes("->")) {
          		contentEl.createEl('b', { text: DataResponseArray[i] + " : " + `${JSON.stringify(nestedValue(data, DataResponseArray[i]))}` });
						} else {
							contentEl.createEl('b', { text: DataResponseArray[i] + " : " + `${JSON.stringify(data.json[DataResponseArray[i]])}` });
						}
          }
        } else {
          contentEl.createEl('b', { text: `${JSON.stringify(data.json)}` });
        }
      })
      .catch((error: Error) => {
        console.error(error);
        contentEl.createEl('b', { text: "Error: " + error.message });
      });
  } else {
    requestUrl({
    	url: URL,
      method: MethodRequest,
      headers: JSON.parse(HeaderRequest),
      body: DataRequest
    })
      .then((data: JSON)  => {
        if (DataResponse !== "") {
          const DataResponseArray = DataResponse.split(",");
          for (let i = 0; i < DataResponseArray.length; i++) {
            contentEl.createEl('b', { text: DataResponseArray[i] + " : " + `${JSON.stringify(data.json[DataResponseArray[i]])}` });
          }
        } else {
          contentEl.createEl('b', { text: `${JSON.stringify(data.json)}` });
        }
      })
      .catch((error: Error) => {
        console.error(error);
        contentEl.createEl('b', { text: "Error: " + error.message });
      });
  }
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
		this.displayAddedURLs(containerEl);

		new Setting(containerEl)
			.setName('Name')
			.setDesc('Name of the request')
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
	      .setName('Response format')
	      .setDesc("Select the desired response format: JSON (as a code block) or Variable (using '::')")
	      .addDropdown(dropDown => {
	        dropDown.addOption("json", "JSON");
	        dropDown.addOption("variable", "Variable");
	        dropDown.setValue(this.plugin.settings.FormatOut)
	        dropDown.onChange(async value => {
	          this.plugin.settings.FormatOut = value;
	          await this.plugin.saveSettings();
	        });
	      });
	    new Setting(containerEl)
	      .setName('Request method')
	      .setDesc("Select the desired request method")
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
	      .setName('Data to send')
	      .setDesc("Data to send in the request")
	      .addTextArea(text => text
	      	.setPlaceholder('{"data":"data"}')
	      	.setValue(this.plugin.settings.DataRequest)
	      	.onChange(async (value) => {
	      		this.plugin.settings.DataRequest = value;
	      		await this.plugin.saveSettings();
	      }));
	    new Setting(containerEl)
	      .setName('Headers')
	      .setDesc("Headers to send in the request")
	      .addTextArea(text => text
	      	.setPlaceholder('{"Content-Type": "application/json"}')
	      	.setValue(this.plugin.settings.HeaderRequest)
	      	.onChange(async (value) => {
	      		this.plugin.settings.HeaderRequest = value;
	      		await this.plugin.saveSettings();
	      }));
	    new Setting(containerEl)
	      .setName('Data to show in modal')
	      .setDesc("Write the name of the variable to show in the modal (space by comma)")
	      .addTextArea(text => text
	      	.setPlaceholder('Variable Name')
	      	.setValue(this.plugin.settings.DataResponse)
	      	.onChange(async (value) => {
	      		this.plugin.settings.DataResponse = value;
	      		await this.plugin.saveSettings();
	      }));
        new Setting(containerEl)
            .addButton(button => {
            		button.setClass('mod-cta');
                button.setButtonText('Add this APIR').onClick(async () => {
                		const {Name} = this.plugin.settings;
                		if (Name === "") {
                			new Notice("Name is empty");
                			return;
										}
                		const {URL, FormatOut, MethodRequest, DataResponse, DataRequest, HeaderRequest} = this.plugin.settings;
                		const {URLs} = this.plugin.settings;
                		URLs.push({
                			'URL': URL, 
                			'Name': Name, 
                			'FormatOut': FormatOut, 
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
    }

    displayAddedURLs(containerEl: HTMLElement) {
    const {URLs} = this.plugin.settings;
    if (URLs.length > 0) {
        containerEl.createEl('p', {text: 'Added APIs:'});
        const urlsList = containerEl.createEl('ul');
        URLs.forEach((url) => {
            const urlItem = urlsList.createEl('li');
            urlItem.createEl('code', {text: url.Name+" : "});
            urlItem.createEl('a', {text:  url.URL, href: url.URL});
            urlItem.createEl('code', {text: " || "});

            const removeButton = urlItem.createEl('button', {
                text: '❌',
            });
            removeButton.addEventListener('click', async () => {
                const index = URLs.indexOf(url);
                URLs.splice(index, 1);
                await this.plugin.saveSettings();
                this.display();
            });
        });
    }
}
}