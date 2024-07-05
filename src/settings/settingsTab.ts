import {  PluginSettingTab, Setting, Notice } from 'obsidian';
 import MainAPIR from 'src/main';
 import { toDocument } from 'src/functions/general';

export default class APRSettings extends PluginSettingTab {
	plugin: MainAPIR;

	constructor(app: App, plugin: MainAPIR) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		containerEl.createEl('h2', { text: "APIR Settings" })
		const newApir = containerEl.createEl('details');
		newApir.createEl('summary', { text: 'Click to Add Request ↴', cls: 'summary-text' });

		new Setting(newApir)
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

		new Setting(newApir)
			.setName('URL')
			.setDesc('Endpoint to fetch data from')
			.addText(text => text
				.setPlaceholder('URL')
				.setValue(this.plugin.settings.URL)
				.onChange(async (value) => {
					this.plugin.settings.URL = value;
					await this.plugin.saveSettings();
				}));
		new Setting(newApir)
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
		new Setting(newApir)
			.setName('Body')
			.setDesc("Data to send in the body")
			.addTextArea(text => text
				.setPlaceholder('{"data":"data"}')
				.setValue(this.plugin.settings.DataRequest)
				.onChange(async (value) => {
					this.plugin.settings.DataRequest = value;
					await this.plugin.saveSettings();
				}));
		new Setting(newApir)
			.setName('Headers')
			.setDesc("The headers of the request")
			.addTextArea(text => text
				.setPlaceholder('{"Content-Type": "application/json"}')
				.setValue(this.plugin.settings.HeaderRequest)
				.onChange(async (value) => {
					this.plugin.settings.HeaderRequest = value;
					await this.plugin.saveSettings();
				}));
		new Setting(newApir)
			.setName('What to display')
			.setDesc("Write the name of the variables you want to show (spaced by comma)")
			.addText(text => text
				.setPlaceholder('varname')
				.setValue(this.plugin.settings.DataResponse)
				.onChange(async (value) => {
					this.plugin.settings.DataResponse = value;
					await this.plugin.saveSettings();
				}));
		new Setting(newApir)
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
		new Setting(containerEl)
			.setName('Status-bar text')
			.setDesc("Text to display in the status bar when there are code blocks (use %d to show the number of blocks)")
			.addText(text => text
				.setPlaceholder('Count blocks: %d')
				.setValue(this.plugin.settings.countBlocksText)
				.onChange(async (value) => {
					if (!value.includes("%d")) value = "🗲 %d";
					this.plugin.settings.countBlocksText = value;
					await this.plugin.saveSettings();
				}));

		const codeblock = containerEl.createEl('details');
		codeblock.createEl('summary', { text: 'Click to Add Key/Value ↴', cls: 'summary-text' });
		new Setting(codeblock)
			.setName('Key')
			.setDesc('Key of the codeblock')
			.addText(text => text
				.setPlaceholder('key')
				.setValue(this.plugin.settings.Key)
				.onChange(async (value) => {
					this.plugin.settings.Key = value;
					await this.plugin.saveSettings();
				}));
		new Setting(codeblock)
			.setName('Value')
			.setDesc('Value of the codeblock')
			.addText(text => text
				.setPlaceholder('value')
				.setValue(this.plugin.settings.Value)
				.onChange(async (value) => {
					this.plugin.settings.Value = value;
					await this.plugin.saveSettings();
				}));
		new Setting(codeblock)
			.addButton(button => {
				button.setClass('btn-add-codeblock');
				button.setButtonText('ADD').onClick(async () => {
					const { Key, Value } = this.plugin.settings;
					const { KeyValueCodeblocks } = this.plugin.settings;
					KeyValueCodeblocks.push({ 'key': Key, 'value': Value });
					await this.plugin.saveSettings();
					this.display();
				});
			});

		containerEl.createEl('hr');

		containerEl.createEl('h2', { text: 'Manage Requests' });
		this.displayInfoApirs(containerEl);

		// new Setting(containerEl)
		// 	.addButton(button => {
		// 		button.setClass('btn-clear-apir');
		// 		button.setButtonText("Clear localStorage").onClick(async () => {
		// 			Object.keys(localStorage).forEach(key => {
		// 				if (key.startsWith("req-")) {
		// 					localStorage.removeItem(key);
		// 				}
		// 			});
		// 			this.display();
		// 		});
		// 	});
		containerEl.createEl('hr');

		containerEl.createEl('h2', { text: 'Manage Key/Values' });
		this.displayKeyValues();
	}

	displayKeyValues() {
		const { containerEl } = this;
		const { KeyValueCodeblocks } = this.plugin.settings;
		const ct = containerEl.createEl('div', { cls: 'cocontainer full-width' });
		if (KeyValueCodeblocks.length > 0) {
			const tableContainer = ct.createEl('div', { cls: 'table-container full-width' });
		
			const table = tableContainer.createEl('table', { cls: 'api-table full-width' });
			const thead = table.createEl('thead');
			const headerRow = thead.createEl('tr');
			headerRow.createEl('th', { text: 'Key' });
			headerRow.createEl('th', { text: 'Value' });

			const tbody = table.createEl('tbody');
			KeyValueCodeblocks.forEach((u) => {
				const row = tbody.createEl('tr');

				row.createEl('td', { text: u.key });
				row.createEl('td', { text: u.value });

				row.addEventListener('click', async () => {
					const index = KeyValueCodeblocks.indexOf(u);
					KeyValueCodeblocks.splice(index, 1);
					await this.plugin.saveSettings();
					this.display();
				});
			});
		}
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