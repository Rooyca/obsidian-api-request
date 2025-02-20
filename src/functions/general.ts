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