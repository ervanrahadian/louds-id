const URL_PATTERN = /(https?:\/\/[^\s]+)/gi;

export interface MessagePart {
  type: "text" | "link";
  value: string;
}

/** Splits a message into plain text and link segments. */
export function parseMessageParts(message: string): MessagePart[] {
  const parts: MessagePart[] = [];
  let lastIndex = 0;

  for (const match of message.matchAll(URL_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push({ type: "text", value: message.slice(lastIndex, index) });
    }
    parts.push({ type: "link", value: match[0] });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < message.length) {
    parts.push({ type: "text", value: message.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: "text", value: message }];
}

const REPLY_SNIPPET_LENGTH = 140;

/** Short preview used when quoting a message. */
export function messageSnippet(message: string): string {
  const trimmed = message.trim().replace(/\s+/g, " ");
  if (trimmed.length <= REPLY_SNIPPET_LENGTH) {
    return trimmed;
  }
  return `${trimmed.slice(0, REPLY_SNIPPET_LENGTH).trimEnd()}…`;
}
