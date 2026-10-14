import { describe, expect, it } from "vitest";
import { renderAssistantMarkdown } from "./ChatMarkdownRenderer";

describe("renderAssistantMarkdown", () => {
    it("renders Markdown while escaping raw HTML", () => {
        const rendered = renderAssistantMarkdown("**Bold** <script>alert('no')</script>");

        expect(rendered).toContain("<strong>Bold</strong>");
        expect(rendered).toContain("&lt;script&gt;");
        expect(rendered).not.toContain("<script>");
    });
});
