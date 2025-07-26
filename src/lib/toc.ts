export interface TocItem {
  depth: number;
  text: string;
  slug: string;
}

export function extractHeadings(html: string): TocItem[] {
  const headings: TocItem[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Select all heading elements (h2-h6, typically h1 is the post title)
  const headingElements = doc.querySelectorAll('h2, h3, h4, h5, h6');
  
  headingElements.forEach((heading) => {
    const depth = parseInt(heading.tagName.substring(1));
    const text = heading.textContent || '';
    const id = heading.id || slugify(text);
    
    headings.push({
      depth,
      text: text.trim(),
      slug: id
    });
  });
  
  return headings;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}