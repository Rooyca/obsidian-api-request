import { Notice, requestUrl, Editor } from 'obsidian';

// Saves the response to the localStorage
export function saveToID(reqID: string, reqText: string) {
	localStorage.setItem(reqID, reqText);
}

// Adds the copy button to the code block
// Take from: https://github.com/jdbrice/obsidian-code-block-copy/
export function addBtnCopy(el: HTMLElement, copyThis: string) {
	const btnCopy = el.createEl("button", { cls: "copy-req", text: "copy" });
	btnCopy.addEventListener('click', function () {
		navigator.clipboard.writeText(copyThis).then(function () {
			btnCopy.blur();
			btnCopy.innerText = 'copied!';
			setTimeout(function () {
				btnCopy.innerText = 'copy';
			}, 2000);
		}, function () {
			btnCopy.innerText = 'Error';
		});
	});
}

// When more than one {} is defined in "format"
// it will loop through the responses and replace the {} with the respective value
export function replaceOrder(stri: string, val: []) {
	let index = 0;
	let replaced = stri.replace(/{}/g, function () {
		return val[index++];
	});

	while (val.length > index) {
		if (val[index] === undefined) break;
		replaced += "\n" + stri.replace(/{}/g, val[index++]);
	}

	return replaced;
}

// Check if the user wants a nested response
// In other words, if "->" is present in "show"
export function nestedValue(data, key: string) {
	const keySplit: string[] = key.split("->").map((item) => item.trim());
	let value = "";
	for (let i = 0; i < keySplit.length; i++) {
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

// Paste the response to the editor
export function toDocument(settings: any, editor: Editor) {
	requestUrl({
		url: settings.URL,
		method: settings.MethodRequest,
		body: settings.DataRequest,
	})
		.then((data) => {
			if (settings.DataResponse !== "") {
				const DataResponseArray = settings.DataResponse.split(",");
				for (let i = 0; i < DataResponseArray.length; i++) {
					const key = DataResponseArray[i].trim();

					let value = JSON.stringify(data.json[key]);

					if (key.includes("->")) {
						value = nestedValue(data, key);
						value = JSON.stringify(value);
					}

					editor.replaceSelection("```markdown\n" + `${key.split("->").pop()} : ${value}\n` + "```\n\n");
				}
			} else {
				editor.replaceSelection("<code>\n" + `${data.text}\n` + "</code>\n");
			}
		})
		.catch((error: Error) => {
			console.error(error);
			new Notice("Error: " + error.message);
		});
}