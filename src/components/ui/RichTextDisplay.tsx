import DOMPurify from 'dompurify';
import { cn } from './utils';

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

// Configure DOMPurify to only allow safe tags
const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'strike',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'blockquote',
  'span',
];

const ALLOWED_ATTR = ['style', 'class', 'dir'];

/**
 * Safely renders HTML content from rich text editor
 * Uses DOMPurify to sanitize and prevent XSS attacks
 */
export function RichTextDisplay({ content, className }: RichTextDisplayProps) {
  // If content is empty or only whitespace, return null
  if (!content || content.trim() === '' || content === '<p></p>') {
    return null;
  }

  // Sanitize the HTML content
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });

  return (
    <div
      className={cn('rich-text-display', className)}
      dir="rtl"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      style={{
        fontFamily: "'Vazirmatn', sans-serif",
        lineHeight: 1.75,
      }}
    />
  );
}

// CSS styles for rich text display - can be imported in global styles or used inline
export const richTextDisplayStyles = `
  .rich-text-display {
    color: inherit;
  }

  .rich-text-display p {
    margin: 0;
  }

  .rich-text-display p + p {
    margin-top: 0.75em;
  }

  .rich-text-display h2 {
    font-size: 1.25em;
    font-weight: 600;
    margin-top: 1em;
    margin-bottom: 0.5em;
  }

  .rich-text-display h3 {
    font-size: 1.1em;
    font-weight: 600;
    margin-top: 0.75em;
    margin-bottom: 0.5em;
  }

  .rich-text-display ul {
    list-style-type: disc;
    list-style-position: inside;
    padding-right: 0.5em;
    padding-left: 0;
    margin: 0.5em 0;
  }

  .rich-text-display ol {
    list-style-type: decimal;
    list-style-position: inside;
    padding-right: 0.5em;
    padding-left: 0;
    margin: 0.5em 0;
  }

  .rich-text-display li {
    margin: 0.25em 0;
    display: list-item;
  }

  .rich-text-display li p {
    display: inline;
  }

  .rich-text-display blockquote {
    border-right: 3px solid var(--accent, #666);
    border-left: none;
    padding-right: 1em;
    padding-left: 0;
    margin: 0.75em 0;
    color: var(--muted-foreground, #888);
    font-style: italic;
  }

  .rich-text-display strong,
  .rich-text-display b {
    font-weight: 700;
  }

  .rich-text-display em,
  .rich-text-display i {
    font-style: italic;
  }

  .rich-text-display u {
    text-decoration: underline;
  }

  .rich-text-display s,
  .rich-text-display strike {
    text-decoration: line-through;
  }
`;

export default RichTextDisplay;
