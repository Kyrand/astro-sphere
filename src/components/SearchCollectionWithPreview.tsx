import type { CollectionEntry } from "astro:content"
import { createEffect, createSignal, For, onMount } from "solid-js"
import Fuse from "fuse.js"
import ArrowCard from "@components/ArrowCard"
import ArticlePreviewCard from "@components/ArticlePreviewCard"
import { cn } from "@lib/utils"
import SearchBar from "@components/SearchBar"

type Props = {
  entry_name: string
  tags: string[]
  data: CollectionEntry<"blog">[] | CollectionEntry<'projects'>[]
  tagCounts?: Record<string, number>
  editMode?: boolean
  clientEditMode?: boolean
  contents?: Record<string, string> // Mapping of slug to content
}

export default function SearchCollectionWithPreview({ entry_name, data, tags, tagCounts, editMode, clientEditMode, contents = {} }: Props) {
  const coerced = data.map((entry) => entry as CollectionEntry<'blog'>);

  const [query, setQuery] = createSignal("");
  const [collection, setCollection] = createSignal<CollectionEntry<'blog'>[]>([])
  const [descending, setDescending] = createSignal(false);
  const [dynamicEditMode, setDynamicEditMode] = createSignal(editMode || false);
  const [viewMode, setViewMode] = createSignal<'normal' | 'compact'>('normal');
  const [textLimit, setTextLimit] = createSignal(1000);

  // Sort tags by count (most used first)
  const sortedTags = tagCounts 
    ? [...tags].sort((a, b) => (tagCounts[b] || 0) - (tagCounts[a] || 0))
    : tags;

  const fuse = new Fuse(coerced, {
    keys: ["slug", "data.title", "data.summary", "data.tags"],
    includeMatches: true,
    minMatchCharLength: 2,
    threshold: 0.4,
  })

  createEffect(() => {
    const filtered = query().length < 2
      ? coerced
      : fuse.search(query()).map((result) => result.item);
    setCollection(descending() ? filtered.toReversed() : filtered)
  })

  function toggleDescending() {
    setDescending(!descending())
  }

  const onSearchInput = (e: Event) => {
    const target = e.target as HTMLInputElement
    setQuery(target.value)
  }

  onMount(() => {
    const wrapper = document.getElementById("search-collection-wrapper");
    if (wrapper) {
      wrapper.style.minHeight = "unset";
    }

    // Initialize settings from localStorage
    if (typeof window !== "undefined") {
      const getSiteSettings = (window as any).getSiteSettings;
      if (getSiteSettings) {
        const settings = getSiteSettings();
        setViewMode(settings.viewMode || 'normal');
        setTextLimit(settings.frontPageArticleTextLimit || 1000);
      }
    }

    // Initialize edit mode from localStorage if clientEditMode is enabled
    if (clientEditMode && typeof window !== "undefined") {
      const getEditMode = (window as any).getEditMode;
      if (getEditMode) {
        setDynamicEditMode(getEditMode());
      }
      
      // Listen for edit mode changes
      const handleEditModeChange = (event: CustomEvent) => {
        setDynamicEditMode(event.detail.editMode);
      };
      
      // Listen for settings changes
      const handleSettingsChange = (event: CustomEvent) => {
        const settings = event.detail;
        setViewMode(settings.viewMode || 'normal');
        setTextLimit(settings.frontPageArticleTextLimit || 1000);
      };
      
      window.addEventListener('editModeChanged', handleEditModeChange as EventListener);
      window.addEventListener('settingsChanged', handleSettingsChange as EventListener);
      
      // Cleanup listeners
      return () => {
        window.removeEventListener('editModeChanged', handleEditModeChange as EventListener);
        window.removeEventListener('settingsChanged', handleSettingsChange as EventListener);
      };
    }
  })

  const currentEditMode = () => clientEditMode ? dynamicEditMode() : editMode;

  return (
    <div class="flex flex-col gap-6">
      {/* Search and Tags Section */}
      <div class="flex flex-col gap-4">
        {/* Search Bar */}
        <SearchBar onSearchInput={onSearchInput} query={query} setQuery={setQuery} placeholderText={`Search ${entry_name}`} />
        
        {/* Tags */}
        <div class="flex flex-col gap-2">
          <p class="text-sm font-semibold uppercase text-black dark:text-white">Tags</p>
          <div class="flex flex-wrap gap-2 items-center">
            <For each={sortedTags}>
              {(tag) => (
                <a
                  href={`/tags/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                  class={cn(
                    "px-3 py-1 rounded-full text-sm inline-block",
                    "transition-colors duration-300 ease-in-out",
                    "bg-black/5 dark:bg-white/10 hover:bg-black/10 hover:dark:bg-white/15"
                  )}
                >
                  {tag}
                  {tagCounts && (
                    <span class="ml-1 text-xs opacity-60">({tagCounts[tag] || 0})</span>
                  )}
                </a>
              )}
            </For>
            <a 
              href="/tags" 
              class="px-3 py-1 text-sm text-black/60 dark:text-white/60 hover:text-black hover:dark:text-white transition-colors duration-300"
            >
              ...
            </a>
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div class='flex justify-between flex-row'>
        <div class="text-sm uppercase">
          SHOWING {collection().length} OF {data.length} {entry_name}
        </div>
        <button onClick={toggleDescending} class='flex flex-row gap-1 stroke-neutral-400 dark:stroke-neutral-500 hover:stroke-neutral-600 hover:dark:stroke-neutral-300 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 hover:dark:text-neutral-300'>
          <div class="text-sm uppercase">
            {descending() ? "DESCENDING" : "ASCENDING"}
          </div>
          {descending() ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-5">
              <path d="m3 16 4 4 4-4"/>
              <path d="M7 20V4"/>
              <path d="M11 4h10"/>
              <path d="M11 8h7"/>
              <path d="M11 12h4"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-5">
              <path d="m3 8 4-4 4 4"/>
              <path d="M7 4v16"/>
              <path d="M11 12h4"/>
              <path d="M11 16h7"/>
              <path d="M11 20h10"/>
            </svg>
          )}
        </button>
      </div>

      {/* Posts */}
      <div>
        {viewMode() === 'normal' || viewMode() === 'compact' ? (
          // Article Preview Mode
          <For each={collection()}>
            {(entry) => (
              <ArticlePreviewCard 
                entry={entry} 
                editMode={currentEditMode()} 
                viewMode={viewMode()}
                textLimit={textLimit()}
                content={contents[entry.slug] || ''}
              />
            )}
          </For>
        ) : (
          // List Mode (fallback)
          <ul class="flex flex-col">
            {collection().map((entry, index) => (
              <li>
                <ArrowCard entry={entry} editMode={currentEditMode()} />
                {index < collection().length - 1 && (
                  <div class="border-b border-gray-200 dark:border-gray-700 my-3"></div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}