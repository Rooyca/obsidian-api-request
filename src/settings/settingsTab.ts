import { App, PluginSettingTab, Setting } from "obsidian";
import MainAPIR from "src/main";

export default class APRSettings extends PluginSettingTab {
	plugin: MainAPIR;

	constructor(app: App, plugin: MainAPIR) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		containerEl.createEl("h2", { text: "Codeblocks" });
		new Setting(containerEl)
			.setName("Text when request is Disabled")
			.setDesc("What to show when a request is disabled")
			.addText((text) =>
				text
					.setPlaceholder("This request is disabled")
					.setValue(this.plugin.settings.DisabledReq)
					.onChange(async (value) => {
						this.plugin.settings.DisabledReq = value;
						await this.plugin.saveSettings();
					}),
			);
		new Setting(containerEl)
			.setName("Status-bar text")
			.setDesc(
				"Text to display in the status bar when there are code blocks (use %d to show the number of blocks)",
			)
			.addText((text) =>
				text
					.setPlaceholder("Count blocks: %d")
					.setValue(this.plugin.settings.countBlocksText)
					.onChange(async (value) => {
						if (!value.includes("%d")) value = "APIR: %d";
						this.plugin.settings.countBlocksText = value;
						await this.plugin.saveSettings();
					}),
			);

		containerEl.createEl("h2", { text: "Global variables" });
		new Setting(containerEl).setName("Key").addText((text) =>
			text
				.setPlaceholder("key")
				.setValue(this.plugin.settings.Key)
				.onChange(async (value) => {
					this.plugin.settings.Key = value;
					await this.plugin.saveSettings();
				}),
		);
		new Setting(containerEl).setName("Value").addText((text) =>
			text
				.setPlaceholder("value")
				.setValue(this.plugin.settings.Value)
				.onChange(async (value) => {
					this.plugin.settings.Value = value;
					await this.plugin.saveSettings();
				}),
		);
		new Setting(containerEl).addButton((button) => {
			button.setClass("btn-add-codeblock");
			button.setButtonText("Add Variable").onClick(async () => {
				const { Key, Value } = this.plugin.settings;
				const { KeyValueCodeblocks } = this.plugin.settings;
				KeyValueCodeblocks.push({ key: Key, value: Value });
				await this.plugin.saveSettings();
				this.display();
			});
		});

		containerEl.createEl("h2", { text: "Manage Global Variables" });
		this.displayKeyValues();

		containerEl.createEl("h2", { text: "Saved API Requests" });
		this.displayInfoApirs();
	}

	displayKeyValues() {
		const { containerEl } = this;
		const { KeyValueCodeblocks } = this.plugin.settings;
		const ct = containerEl.createEl("div", {
			cls: "cocontainer full-width",
		});
		if (KeyValueCodeblocks.length > 0) {
			const tableContainer = ct.createEl("div", {
				cls: "table-container full-width",
			});

			const table = tableContainer.createEl("table", {
				cls: "api-table full-width",
			});
			const thead = table.createEl("thead");
			const headerRow = thead.createEl("tr");
			headerRow.createEl("th", { text: "Key" });
			headerRow.createEl("th", { text: "Value" });

			const tbody = table.createEl("tbody");
			KeyValueCodeblocks.forEach((u) => {
				const row = tbody.createEl("tr");

				row.createEl("td", { text: u.key });
				row.createEl("td", { text: u.value });

				row.addEventListener("click", async () => {
					const index = KeyValueCodeblocks.indexOf(u);
					KeyValueCodeblocks.splice(index, 1);
					await this.plugin.saveSettings();
					this.display();
				});
			});
		}
	}

	displayInfoApirs() {
		const { containerEl } = this;
		const ct = containerEl.createEl("div", { cls: "cocontainer" });

		// Render localStorage table
		containerEl.createEl("div", { cls: "table-container full-width" });
		const table = ct.createEl("table", { cls: "api-table full-width" });
		const thead = table.createEl("thead");
		const headerRow = thead.createEl("tr");
		const hr = headerRow.createEl("th", { text: "ID" });

		const tbody = table.createEl("tbody");
		Object.keys(localStorage).forEach((key) => {
			if (key.startsWith("req-")) {
				const row = tbody.createEl("tr");
				const idCell = row.createEl("td", { text: key });

				idCell.addEventListener("click", async () => {
					localStorage.removeItem(key);
					this.display();
				});
			}
		});
		// if table is empty
		if (tbody.children.length === 0) {
			hr.innerText = "No requests saved";
		}
	}
}
