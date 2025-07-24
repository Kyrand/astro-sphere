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
      // For compact mode, extract the first paragraph from HTML
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = content
      
      // Find the first paragraph element
      const firstParagraph = tempDiv.querySelector('p')
      const firstParagraphContent = firstParagraph ? firstParagraph.outerHTML : ''
      
      setDisplayContent(firstParagraphContent)
      
      // Get word count from the entire content
      const textContent = tempDiv.textContent || tempDiv.innerText || ''
      setWordCount(textContent.split(/\s+/).filter(word => word.length > 0).length)
    } else {
      // For normal mode, show up to textLimit words
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = content
      const textContent = tempDiv.textContent || tempDiv.innerText || ''
      const words = textContent.split(/\s+/).filter(word => word.length > 0)
      setWordCount(words.length)
      
      if (words.length <= textLimit) {
        setDisplayContent(content)
      } else {
        // Simple truncation: get text content, truncate, then try to preserve some HTML
        const truncatedWords = words.slice(0, textLimit)
        const truncatedText = truncatedWords.join(' ') + '...'
        
        // For now, just use the truncated text wrapped in a paragraph
        // This is simpler and more reliable than trying to preserve complex HTML structure
        setDisplayContent(`<p>${truncatedText}</p>`)
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
        
        {/* Edit and Delete Buttons */}
        <Show when={editMode}>
          <div class="flex gap-2">
            <a 
              href={`/editor?edit=${entry.slug}`}
              class="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              Edit
            </a>
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete "${entry.data.title}"?`)) {
                  fetch('/api/delete-post', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ slug: entry.slug })
                  })
                  .then(res => res.json())
                  .then(result => {
                    if (result.success) {
                      alert('Post deleted successfully');
                      window.location.reload();
                    } else {
                      alert('Error deleting post: ' + result.error);
                    }
                  })
                  .catch(err => alert('Error deleting post: ' + err.message));
                }
              }}
              class="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              Delete
            </button>
          </div>
        </Show>
      </div>
    </article>
  )
}