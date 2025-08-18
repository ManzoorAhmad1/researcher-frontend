export const markdownToHTML = async (markdown: string | undefined) => {
  if (markdown) {
    markdown = markdown.replace(/^###### (.*$)/gm, "<h6>$1</h6>");
    markdown = markdown.replace(/^##### (.*$)/gm, "<h5>$1</h5>");
    markdown = markdown.replace(/^#### (.*$)/gm, "<h4>$1</h4>");
    markdown = markdown.replace(/^### (.*$)/gm, "<h3>$1</h3>");
    markdown = markdown.replace(/^## (.*$)/gm, "<h2>$1</h2>");
    markdown = markdown.replace(/^# (.*$)/gm, "<h1>$1</h1>");
    markdown = markdown.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    markdown = markdown.replace(/__(.*?)__/g, "<strong>$1</strong>");
    markdown = markdown.replace(/\*(.*?)\*/g, "<em>$1</em>");
    markdown = markdown.replace(/_(.*?)_/g, "<em>$1</em>");
    markdown = markdown.replace(/~~(.*?)~~/g, "<del>$1</del>");
    markdown = markdown.replace(/`(.*?)`/g, "<code>$1</code>");
    markdown = markdown.replace(
      /```([\s\S]*?)```/g,
      "<pre><code>$1</code></pre>"
    );
    markdown = markdown.replace(/^ {4}(.*$)/gm, "<pre><code>$1</code></pre>");
    markdown = markdown.replace(/^> (.*$)/gm, "<blockquote>$1</blockquote>");
    markdown = markdown.replace(/^\* (.*$)/gm, "<ul><li>$1</li></ul>");
    markdown = markdown.replace(/^\+ (.*$)/gm, "<ul><li>$1</li></ul>");
    markdown = markdown.replace(/^\- (.*$)/gm, "<ul><li>$1</li></ul>");
    markdown = markdown.replace(/^\d+\. (.*$)/gm, "<ol><li>$1</li></ol>");
    markdown = markdown.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
      '<a href="$2">$1</a>'
    );
    markdown = markdown.replace(
      /!\[([^\]]*)\]\((https?:\/\/[^\)]+)\)/g,
      '<img src="$2" alt="$1" />'
    );
    markdown = markdown.replace(/(\*\*\*|\-\-\-|\_\_\_)/g, "<hr/>");
    markdown = markdown.replace(/\n\n/g, "</p><p>");
    markdown = "<p>" + markdown + "</p>";

    return markdown.trim();
  }
};
