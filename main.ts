import { App, Editor, MarkdownView, Modal, Plugin, PluginSettingTab, Setting, Notice } from 'obsidian';
import { readFrontmatter, parseFrontmatter } from './frontmatterUtils';
import { marked } from './marked.min.js'
import './styles.css'

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
			new Notice("Error: " + e.message);
			return;
			}
		} 
		return req_prop;
}

export function addBtnCopy(el: any, copyThis: string) {
		// https://github.com/jdbrice/obsidian-code-block-copy/
	  const btnCopy = el.createEl("button", {cls: "copy-req", text: "copy"});
	  console.log(copyThis)
	  btnCopy.addEventListener('click', function () {
	      navigator.clipboard.writeText(copyThis).then(function () {
	          btnCopy.blur();

	          btnCopy.innerText = 'copied!';

	          setTimeout(function () {
	              btnCopy.innerText = 'copy';
	          }, 2000);
	      }, function (error) {
	          btnCopy.innerText = 'Error';
	      });
	  });
}

export function replaceOrder(stri, val) {
    let index = 0;
    let replaced = stri.replace(/{}/g, function(match) {
        return val[index++];
    });

    while (val.length > index) {
    		if (val[index] === undefined) break;
    		replaced += "\n"+stri.replace(/{}/g, val[index++]);
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
		
		if (typeof value === "object") {
			value = JSON.stringify(value);
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

				      	if (key.includes("->")) {
				      		value = JSON.stringify(value);
				      		}
				        editor.replaceSelection("```json\n" + `${key.split("->").pop()} : ${value}\n` + "```\n\n");
					    }
					  } else {
					      editor.replaceSelection("```json\n" + `${JSON.stringify(data.json)}\n` + "```\n");
						  }
					})
			    .catch((error: Error) => {
			      console.error(error);
			      new Notice("Error: " + error.message);
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
		        let method = "GET", allowedMethods = ["GET", "POST", "PUT", "DELETE"], URL = "", show = "", headers = {}, body = {}, format = "<li>{}</li>", responseType = "json";

		        if (sourceLines.includes("disabled")) {
		            el.innerHTML = "<strong>This request is disabled</strong>";
		            return;
		        }

		        for (const line of sourceLines) {
		            const lowercaseLine = line.toLowerCase();
		            if (lowercaseLine.includes("method: ")) {
		                method = line.replace(/method: /i, "").toUpperCase();
		                if (!allowedMethods.includes(method)) {
		                    el.innerHTML = `Error: Method ${method} not supported`;
		                    return;
		                }
		            } else if (lowercaseLine.includes("url: ")) {
		                URL = checkFrontmatter(line.replace(/url: /i, ""));
		            } else if (lowercaseLine.includes("response-type")) {
		                responseType = line.replace(/response-type: /i, "").toLowerCase();
		                if (!["json", "txt", "md"].includes(responseType)) {
		                    el.innerHTML = `Error: Response type ${responseType} not supported`;
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
		                    el.innerHTML = "Error: Use {} to show response in the document.";
		                    return;
		                }
		            }
		            if (URL === "") {
		                el.innerHTML = "Error: URL not found";
		                return;
		            }
		        }

		        try {
		            const formatSplit = format.split("{}");
		            const responseData = await requestUrl({ url: URL, method, headers, body });
		            if (responseType !== "json") {
		            	try {
		            		el.innerHTML += marked(responseData.text, { sanitize: false });
		            	} catch (e) {
		            		new Notice("Error: " + e.message);
		            		el.innerHTML += responseData.text;
		            	}
		            	addBtnCopy(el, responseData.text);
		            	return;
		            }
								if (!show) {
		                el.innerHTML += formatSplit[0] + JSON.stringify(responseData.json, null) + formatSplit[1];
		                addBtnCopy(el, el.innerText);
		            } else {
										if (show.includes("{..}")) {
												if (show.includes(",")) { 
							            el.innerHTML = "Error: can't use {..} and , in the same req";
							            return;
												}
										    let temp_show = "";
										    for (let i = 0; i < responseData.json.length; i++) {
										        temp_show += show.replace("{..}", i) + ", ";
										    }
										    show = temp_show;
										}
		                const values = show.includes(",") ? show.split(",").map(key => {
		                    let value = JSON.stringify(responseData.json[key.trim()]);
		                    if (key.includes("->")) value = nestedValue(responseData, key);
		                    return value;
		                }) : [show.trim().includes("->") ? nestedValue(responseData, show.trim()) : JSON.stringify(responseData.json[show.trim()])];
		                const replacedText = replaceOrder(format, values);
		                el.innerHTML += marked(replacedText, { sanitize: false });
		                addBtnCopy(el, replacedText);
		            }
		        } catch (error) {
		            console.error(error);
		            el.innerHTML = "Error: " + error.message;
		            new Notice("Error: " + error.message);
		        }
		    });
		} catch (e) {
		    console.error(e.message);
		    el.innerHTML = "Error: " + error.message;
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
        new Notice("Error: " + error.message);
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
        new Notice("Error: " + error.message);
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
	      .setName('Response format')
	      .setDesc("Select the desired response format (only JSON for now)")
	      .addDropdown(dropDown => {
	        dropDown.addOption("json", "JSON");
	        dropDown.setValue(this.plugin.settings.FormatOut)
	        dropDown.onChange(async value => {
	          this.plugin.settings.FormatOut = value;
	          await this.plugin.saveSettings();
	        });
	      });
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