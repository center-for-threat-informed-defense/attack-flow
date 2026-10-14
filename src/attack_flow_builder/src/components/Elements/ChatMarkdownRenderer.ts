import MarkdownIt from "markdown-it";

// Keep "html: false" to prevent raw html from being interpreted, thus preventing dangerous
// script tags from executing.
const markdown = new MarkdownIt({ html: false });

export function renderAssistantMarkdown(content: string) {
    return markdown.render(content);
}
