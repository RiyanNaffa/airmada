/**
 * Satu bubble pesan dalam ChatWindow.
 *
 * @location apps/web/src/components/ai/ChatMessage.tsx
 * Displays chat messages with markdown support
 */
'use client'

import React from 'react'

type Props = {
  role: 'user' | 'assistant'
  content: string
}

// Simple markdown to JSX renderer
function MarkdownToJSX({ content }: { content: string }) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Heading h1
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className="mt-3 mb-2 text-lg font-bold">
          {line.replace(/^# /, '')}
        </h1>
      )
      i++
      continue
    }

    // Heading h2
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="mt-2 mb-1 text-base font-bold">
          {line.replace(/^## /, '')}
        </h2>
      )
      i++
      continue
    }

    // Heading h3
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="mt-2 mb-1 text-sm font-semibold">
          {line.replace(/^### /, '')}
        </h3>
      )
      i++
      continue
    }

    // Unordered list
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const listItems: string[] = []
      while (
        i < lines.length &&
        (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))
      ) {
        const itemText = lines[i].trim().replace(/^[-*] /, '')
        listItems.push(itemText)
        i++
      }
      elements.push(
        <ul key={`ul-${i}`} className="mb-2 ml-2 list-inside list-disc">
          {listItems.map((item, idx) => (
            <li key={idx} className="mb-1">
              {item}
            </li>
          ))}
        </ul>
      )
      continue
    }

    // Ordered list
    if (/^\d+\. /.test(line.trim())) {
      const listItems: string[] = []
      while (i < lines.length && /^\d+\. /.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^\d+\. /, '')
        listItems.push(itemText)
        i++
      }
      elements.push(
        <ol key={`ol-${i}`} className="mb-2 ml-2 list-inside list-decimal">
          {listItems.map((item, idx) => (
            <li key={idx} className="mb-1">
              {item}
            </li>
          ))}
        </ol>
      )
      continue
    }

    // Code block (triple backticks)
    if (line.trim().startsWith('```')) {
      i++
      const codeLines: string[] = []
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // Skip closing ```
      elements.push(
        <pre
          key={`code-${i}`}
          className="mb-2 overflow-x-auto rounded-lg bg-gray-200 p-3 font-mono text-xs"
        >
          <code>{codeLines.join('\n')}</code>
        </pre>
      )
      continue
    }

    // Blockquote
    if (line.trim().startsWith('> ')) {
      elements.push(
        <blockquote key={`quote-${i}`} className="my-2 border-l-4 border-gray-400 pl-3 italic">
          {line.trim().replace(/^> /, '')}
        </blockquote>
      )
      i++
      continue
    }

    // Horizontal rule
    if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
      elements.push(<hr key={`hr-${i}`} className="my-2 border-gray-300" />)
      i++
      continue
    }

    // Regular paragraph (non-empty lines)
    if (line.trim().length > 0) {
      const paragraph = renderInlineMarkdown(line)
      elements.push(
        <p key={`p-${i}`} className="mb-2 leading-relaxed">
          {paragraph}
        </p>
      )
      i++
      continue
    }

    // Empty line
    i++
  }

  return <>{elements}</>
}

// Render inline markdown (bold, italic, code, links)
function renderInlineMarkdown(text: string) {
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let keyCounter = 0

  // Combine all patterns
  const combinedRegex = /\*\*(.*?)\*\*|__(.*?)__|`(.*?)`|\[(.*?)\]\((.*?)\)/g
  let match

  while ((match = combinedRegex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }

    if (match[1] || match[2]) {
      // Bold
      parts.push(
        <strong key={`bold-${keyCounter++}`} className="font-semibold">
          {match[1] || match[2]}
        </strong>
      )
    } else if (match[3]) {
      // Inline code
      parts.push(
        <code
          key={`icode-${keyCounter++}`}
          className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-xs"
        >
          {match[3]}
        </code>
      )
    } else if (match[4] && match[5]) {
      // Link
      parts.push(
        <a
          key={`link-${keyCounter++}`}
          href={match[5]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {match[4]}
        </a>
      )
    }

    lastIndex = combinedRegex.lastIndex
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts.length > 0 ? parts : text
}

export function ChatMessage({ role, content }: Props) {
  const isUser = role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-md rounded-xl px-4 py-3 text-sm ${
          isUser ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-800'
        }`}
      >
        {isUser ? (
          // Plain text for user messages
          <div className="overflow-hidden whitespace-pre-wrap">{content}</div>
        ) : (
          // Markdown for assistant messages
          <div className="space-y-2">
            <MarkdownToJSX content={content} />
          </div>
        )}
      </div>
    </div>
  )
}
