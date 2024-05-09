export class MarkdownParser {
    parse(text) {
        // Headers
        text = text.replace(/^(#{1,6})\s*(.*)$/gm, (match, p1, p2) => `<h${p1.length}>${p2}</h${p1.length}>`);

        // Todo Items
        text = text.replace(/^- \[ \](.*)$/gm, '<li class="todo-li"><input type="checkbox">$1</li>');
        text = text.replace(/^- \[x\](.*)$/gm, '<li class="todo-li"><input type="checkbox" checked>$1</li>');

        // Unordered Lists
        text = text.replace(/^\s*-\s*(.*)$/gm, '<li>$1</li>');
        //text = text.replace(/^\s*<li>(.*?)<\/li>\s*$/gm, '<ul>$1</ul>');

        // Ordered Lists
        text = text.replace(/^\s*\d+\.\s*(.*)$/gm, '<li>$1</li>');
        //text = text.replace(/^\s*<li>(.*?)<\/li>\s*$/gm, '<ol>$1</ol>');

        // Bold
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Italic
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Images
        text = text.replace(/\!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

        // Links
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

        // Blockquotes
        text = text.replace(/^\s*>\s*(.*)$/gm, '<blockquote>$1</blockquote>');

        // Code blocks
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Markdown Tables
        text = this.mdTables(text);

        return text;
    }

    mdTables(text) {
        let table = '';
        let regCheckPipe = /(\|)/gi;

        text = text.trim();

        if (text.match(regCheckPipe)) {
            let rows = text.split('\n');
            let header = rows.shift();
            let headerCells = header.split('|').map(cell => cell.trim()).filter(cell => cell);
            let tableStart = '<table>\n<thead>\n';
            let tableEnd = '</thead>\n';
            let bodyStart = '<tbody>\n';
            let bodyEnd = '</tbody>\n';
            let rowStart = '<tr>\n';
            let rowEnd = '</tr>\n';
            let cellStart = '<td>';
            let cellEnd = '</td>\n';
            let headerRow = rowStart + headerCells.map(cell => `<th>${cell}</th>`).join('\n') + rowEnd;
            let bodyRows = rows.map(row => {
                let cells = row.split('|').map(cell => cell.trim()).filter(cell => cell);
                return rowStart + cells.map(cell => `<td>${cell}</td>`).join('\n') + rowEnd;
            }).join('\n');

            table += tableStart + headerRow + tableEnd + bodyStart + bodyRows + bodyEnd;
            table = table.replace(/<td>[-]+<\/td>/g, '');

            return table;
        } else {
            return text;
        }

    }
}
