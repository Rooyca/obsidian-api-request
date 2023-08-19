import { App, Editor, MarkdownView, Modal, Plugin, PluginSettingTab, Setting } from 'obsidian';


interface LoadAPIRSettings {
	URL: string;
	FormatOut: string;
	MethodRequest: string;
	DataRequest: string;
	DataResponse: string;
}

const DEFAULT_SETTINGS: LoadAPIRSettings = {
	URL: 'https://jsonplaceholder.typicode.com/todos/1',
	FormatOut: 'json',
	MethodRequest: 'GET',
	DataRequest: 'None',
	DataResponse: ''
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

export default class MainAPIR extends Plugin {
	settings: LoadAPIRSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'show-response-in-modal',
			name: 'Show response in Modal',
			callback: () => {
				new ShowOutputModal(this.app, this.settings.URL, this.settings.MethodRequest, this.settings.DataRequest, this.settings.DataResponse).open();
			}
		});

    this.registerMarkdownCodeBlockProcessor("apir", (source, el, ctx) => {
        const SourceSplit = source.split("\n")
        

        for (let i = 0; i < SourceSplit.length; i++) {
					if (SourceSplit[i].includes("URL: ") || SourceSplit[i].includes("url: ")) {
						var URL: string = SourceSplit[i].replace("URL: ", "").replace("url: ", "");
					}
					if (SourceSplit[i].includes("ShowThis: ") || SourceSplit[i].includes("showthis: ")) {
						var ShowThis: string = SourceSplit[i].replace("ShowThis: ", "").replace("showthis: ", "");
					}
				}

        requestUrl({url: URL})
				.then((data: JSON) => {
					if (!ShowThis) {
						el.innerHTML = JSON.stringify(data.json);
					} else {
						el.innerHTML = JSON.stringify(data.json[ShowThis]);
						if (ShowThis.includes("->")) {
							el.innerHTML = JSON.stringify(nestedValue(data, ShowThis));
						}
					}
				})
				.catch((error: Error) => {
					console.error(error);
					el.innerHTML = "Error: " + error.message;
				});
    });

		this.addCommand({
			id: 'response-in-document',
			name: 'Paste response in current document',
			editorCallback: (editor: Editor, view: MarkdownView) => {
			requestUrl({
			  	url: this.settings.URL,
			    method: this.settings.MethodRequest,
			    body: this.settings.DataRequest,
			  })
					.then((data: JSON) => {
					  if (this.settings.DataResponse !== "") {
					    const DataResponseArray = this.settings.DataResponse.split(",");
					    for (let i = 0; i < DataResponseArray.length; i++) {
					    	const key = DataResponseArray[i].trim();

					    	var value = JSON.stringify(data.json[key]);

								if (key.includes("->")) {
					    		value = nestedValue(data, key);
					    	}
					      
					      if (this.settings.FormatOut === "variable") {
					      	value = JSON.stringify(value);
					        editor.replaceSelection(`json:: ${key.split("->").pop()} : ${value}\n`);
					      }
					      if (this.settings.FormatOut === "json") {
					      	if (key.includes("->")) {
					      		value = JSON.stringify(value);
					      		}
					        editor.replaceSelection("```json\n" + `${key.split("->").pop()} : ${value}\n` + "```\n\n");
					      }
					    }
					  } else {
					    if (this.settings.FormatOut === "variable") {
					      editor.replaceSelection(`json:: ${JSON.stringify(data.json)}\n`);
					    }
					    if (this.settings.FormatOut === "json") {
					      editor.replaceSelection("```json\n" + `${JSON.stringify(data.json)}\n` + "```\n");
					    }
					  }
					})
			    .catch((error: Error) => {
			      console.error(error);
			    });
			}
		});

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
  constructor(app: App, URL: string, MethodRequest: string, DataRequest: string, DataResponse: string) {
    super(app);
    this.props = {
      URL,
      MethodRequest,
      DataRequest,
      DataResponse,
    };
  }

onOpen() {
  const { contentEl } = this;
  const { URL, MethodRequest, DataRequest, DataResponse } = this.props;

  if (MethodRequest === "GET") {
    requestUrl({
    	url: URL,
      method: MethodRequest,
      headers: {
        'Content-Type': 'application/json'
      }
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
      headers: {
        'Content-Type': 'application/json'
      },
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
	      	.setPlaceholder('{"data": "data"}')
	      	.setValue(this.plugin.settings.DataRequest)
	      	.onChange(async (value) => {
	      		this.plugin.settings.DataRequest = value;
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

	}
}
