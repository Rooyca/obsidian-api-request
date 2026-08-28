/**
 * Adds a copy button to the code block element
 * Button copies the specified text to clipboard when clicked
 * 
 * @param el - The HTML element to add the button to
 * @param copyThis - The text to copy to clipboard
 * @source https://github.com/jdbrice/obsidian-code-block-copy/
 */
export function addBtnCopy(el: HTMLElement, copyThis: string) {
	const btnCopy = el.createEl("button", { cls: "copy-req", text: "Copy" });
	btnCopy.addEventListener('click', function () {
		navigator.clipboard.writeText(copyThis).then(function () {
			btnCopy.blur();
			btnCopy.innerText = 'Copied!';
			window.setTimeout(function () {
				btnCopy.innerText = 'Copy';
			}, 2000);
		}, function () {
			btnCopy.innerText = 'Error';
		});
	});
}