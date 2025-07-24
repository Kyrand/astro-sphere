import { formatDate, readingTime } from "@lib/utils"
import type { CollectionEntry } from "astro:content"
import { createSignal, createEffect, Show } from "solid-js"

type Props = {
  entry: CollectionEntry<"blog">
  editMode?: boolean
  viewMode?: 'normal' | 'compact'
  textLimit?: number
  content?: string
}

export default function ArticlePreviewCard({ entry, editMode, viewMode = 'normal', textLimit = 1000, content = '' }: Props) {
  const [displayContent, setDisplayContent] = createSignal('')
  const [wordCount, setWordCount] = createSignal(0)
  
  createEffect(() => {
    if (viewMode === 'compact') {
      // For compact mode, show first paragraph
      const firstParagraph = content.split('\n\n')[0] || ''
      setDisplayContent(firstParagraph)
      setWordCount(content.split(/\s+/).filter(word => word.length > 0).length)
    } else {
      // For normal mode, show up to textLimit words
      const words = content.split(/\s+/).filter(word => word.length > 0)
      setWordCount(words.length)
      
      if (words.length <= textLimit) {
        setDisplayContent(content)
      } else {
        // Truncate at word boundary
        const truncated = words.slice(0, textLimit).join(' ')
        setDisplayContent(truncated)
      }
    }
  })
  
  const showReadMore = () => {
    if (viewMode === 'compact') {
      return wordCount() > 50 // Show if more than first paragraph
    } else {
      return wordCount() > textLimit
    }
  }
  
  return (
    <article class="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700 last:border-0">
      {/* Article Header */}
      <div class="mb-4">
        <div class="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <time datetime={entry.data.date.toISOString()}>
            {formatDate(entry.data.date)}
          </time>
          <span>•</span>
          <span>{readingTime(entry.body)}</span>
        </div>
        
        <h2 class="text-2xl font-bold mb-2">
          <a 
            href={`/blog/${entry.slug}`} 
            class="text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {entry.data.title}
          </a>
        </h2>
        
        <p class="text-gray-600 dark:text-gray-400">
          {entry.data.summary}
        </p>
      </div>
      
      {/* Article Content Preview */}
      <Show when={displayContent().length > 0}>
        <div 
          class="prose prose-neutral dark:prose-invert max-w-none mb-4"
          innerHTML={displayContent()}
        />
      </Show>
      
      {/* Footer */}
      <div class="flex flex-wrap items-center justify-between gap-4">
        {/* Tags and Read More */}
        <div class="flex flex-wrap items-center gap-3">
          {/* Tags */}
          <div class="flex flex-wrap gap-2">
            {entry.data.tags.filter((tag: string) => tag !== '_highlight').map((tag: string) => (
              <a
                href={`/tags/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                class="text-xs uppercase px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {tag}
              </a>
            ))}
          </div>
          
          {/* Read More Link */}
          <Show when={showReadMore()}>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              [... <a 
                href={`/blog/${entry.slug}`}
                class="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {wordCount().toLocaleString()} words
              </a>]
            </span>
          </Show>
        </div>
        
        {/* Edit Button (for normal mode) */}
        <Show when={editMode && viewMode === 'normal'}>
          <a 
            href={`/editor?edit=${entry.slug}`}
            class="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition-colors duration-200"
          >
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            Edit
          </a>
        </Show>
      </div>
    </article>
  )
}