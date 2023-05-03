import { App, Editor, MarkdownView, Modal, Plugin, PluginSettingTab, Setting } from 'obsidian';


interface ARSettings {
	URL: string;
	FormatOut: string;
}

const DEFAULT_SETTINGS: ARSettings = {
	URL: 'https://example.com/json',
	FormatOut: 'json'
}

export default class MyPlugin extends Plugin {
	settings: ARSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'show-response-in-modal',
			name: 'Show response in Modal',
			callback: () => {
				new SampleModal(this.app, this.settings.URL).open();
			}
		});

		this.addCommand({
			id: 'response-in-document',
			name: 'Paste response in current document',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				fetch(this.settings.URL)
				  .then(response => response.json())
				  .then(data => {
				  	if (this.settings.FormatOut == "variable") {
				    	editor.replaceSelection("json:: "+JSON.stringify(data)+"\n")
				  	}
				  	if (this.settings.FormatOut == "json") {
				  		editor.replaceSelection("```json\n"+JSON.stringify(data)+"\n```\n")
				  	}
				  })
				  .catch(error => {
				    console.error(error);
				  });
			}
		});

		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
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

class SampleModal extends Modal {
	constructor(app: App, URL: string) {
		super(app);
    	this.props = { URL };
	}

	onOpen() {
		const {contentEl} = this;
		const { URL } = this.props;
		fetch(URL)
		  .then(response => response.json())
		  .then(data => {
		  	console.log(JSON.stringify(data));
		    contentEl.createEl('b', {text: `${JSON.stringify(data)}`});
		  })
		  .catch(error => {
		    console.error(error);
		  });		
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h1', {text: 'General Settings'});

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

	}
}
