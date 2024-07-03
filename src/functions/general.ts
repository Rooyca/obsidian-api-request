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
export function replaceOrder(stri: string, val) {
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
	let value = data.json;

	for (let i = 0; i < keySplit.length; i++) {
		if (value === undefined) {
			return undefined;
		}
		value = value[keySplit[i]];
	}
	if (typeof value === "object" && !Array.isArray(value)) {
		value = JSON.stringify(value, null, 2);
	}

	return value;
}

// Paste the response to the editor
export function toDocument(requestOptions: object, DataResponse: string, editor: Editor) {
	requestUrl(requestOptions)
		.then((data) => {
			if (DataResponse !== "") {
				const DataResponseArray = DataResponse.split(",");
				for (let i = 0; i < DataResponseArray.length; i++) {
					const key = DataResponseArray[i].trim();

					let value = JSON.stringify(data.json[key]);

					if (key.includes("->")) {
						value = nestedValue(data, key);
						value = JSON.stringify(value);
					}

					editor.replaceSelection(value);
				}
			} else {
				editor.replaceSelection("<div>\n" + `${data.text}\n` + "</div>\n");
			}
		})
		.catch((error: Error) => {
			console.error(error);
			new Notice("Error: " + error.message);
		});
}