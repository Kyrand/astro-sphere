import { formatDate, truncateText } from "@lib/utils"
import type { CollectionEntry } from "astro:content"

type Props = {
  entry: CollectionEntry<"blog"> | CollectionEntry<"projects">
  pill?: boolean
  editMode?: boolean
}

export default function ArrowCard({ entry, pill, editMode }: Props) {
  return (
    <div class="group p-4 gap-3 flex items-center hover:bg-black/5 hover:dark:bg-white/10 transition-colors duration-300 ease-in-out relative">
      <a href={`/${entry.collection}/${entry.slug}`} class="flex-1 flex items-center gap-3">
        <div class="w-full group-hover:text-black group-hover:dark:text-white blend">
          <div class="flex flex-wrap items-center gap-2">
            {pill &&
              <div class="text-sm capitalize px-2 py-0.5 rounded-full border border-black/15 dark:border-white/25">
                {entry.collection === "blog" ? "post" : "project"}
              </div>
            }
            <div class="text-sm uppercase">
              {formatDate(entry.data.date)}
            </div>
          </div>
          <div class="font-semibold mt-3 text-black dark:text-white line-clamp-2">
            {entry.data.title}
          </div>

          <div class="text-sm line-clamp-2">
            {entry.data.summary}
          </div>
          <ul class="flex flex-wrap mt-2 gap-1">
            {entry.data.tags.filter((tag: string) => tag !== '_highlight').map((tag: string) => (
              <li class="text-xs uppercase py-0.5 px-2 rounded bg-black/5 dark:bg-white/20 text-black/75 dark:text-white/75">
                {truncateText(tag, 20)}
              </li>
            ))}
          </ul>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="stroke-current group-hover:stroke-black group-hover:dark:stroke-white">
          <line x1="5" y1="12" x2="19" y2="12" class="scale-x-0 group-hover:scale-x-100 translate-x-4 group-hover:translate-x-1 transition-all duration-300 ease-in-out" />
          <polyline points="12 5 19 12 12 19" class="translate-x-0 group-hover:translate-x-1 transition-all duration-300 ease-in-out" />
        </svg>
      </a>
      
      {editMode && entry.collection === "blog" && (
        <div class="ml-2">
          <a 
            href={`/editor?edit=${entry.slug}`}
            class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition-colors duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            Edit
          </a>
        </div>
      )}
    </div>
  )
}