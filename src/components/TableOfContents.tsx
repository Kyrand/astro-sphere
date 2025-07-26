import { createSignal, createEffect, For, Show, onMount } from "solid-js";
import { type TocItem } from "@lib/toc";

interface Props {
  headings: TocItem[];
  title?: string;
}

export default function TableOfContents(props: Props) {
  const [isExpanded, setIsExpanded] = createSignal(true);
  const [activeId, setActiveId] = createSignal("");
  const [isVisible, setIsVisible] = createSignal(true);

  // Check if TOC should be shown based on user settings
  onMount(() => {
    const tocSetting = localStorage.getItem('showToc');
    setIsVisible(tocSetting !== 'false');
  });

  // Watch for changes in expanded state and dispatch events
  createEffect(() => {
    if (typeof window !== 'undefined') {
      // Dispatch custom event to notify layout about TOC state change
      window.dispatchEvent(new CustomEvent('tocToggle', { 
        detail: { expanded: isExpanded() } 
      }));
    }
  });

  // Track active heading based on scroll position
  createEffect(() => {
    const observerOptions = {
      rootMargin: "0px 0px -80% 0px",
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    }, observerOptions);

    // Observe all headings
    const headings = document.querySelectorAll("article h1, article h2, article h3, article h4, article h5, article h6");
    headings.forEach((heading) => {
      if (heading.id) {
        observer.observe(heading);
      }
    });

    return () => {
      headings.forEach((heading) => {
        if (heading.id) {
          observer.unobserve(heading);
        }
      });
    };
  });

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  if (!props.headings || props.headings.length === 0 || !isVisible()) {
    return null;
  }

  return (
    <nav class={`sticky top-24 max-h-[calc(100vh-7rem)] transition-all duration-300 ease-in-out ${
      isExpanded() ? "w-full overflow-y-auto" : "w-12 overflow-hidden"
    }`}>
      <Show when={isExpanded()}>
        <div class="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <button
            onClick={() => setIsExpanded(!isExpanded())}
            class="flex items-center justify-between w-full text-left"
            aria-expanded={isExpanded()}
          >
            <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {props.title || "Table of Contents"}
            </h2>
            <svg
              class="w-4 h-4 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
          
          <ul class="mt-3 space-y-1 text-sm">
            <For each={props.headings}>
              {(heading) => (
                <li
                  style={{
                    "padding-left": `${(heading.depth - 2) * 0.75}rem`
                  }}
                >
                  <button
                    onClick={() => scrollToHeading(heading.slug)}
                    class={`block w-full text-left py-1 px-2 rounded transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      activeId() === heading.slug
                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {heading.text}
                  </button>
                </li>
              )}
            </For>
          </ul>
        </div>
      </Show>
      
      <Show when={!isExpanded()}>
        <div class="p-2">
          <button
            onClick={() => setIsExpanded(!isExpanded())}
            class="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-expanded={isExpanded()}
            title="Show Table of Contents"
          >
            <svg
              class="w-4 h-4 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>
      </Show>
    </nav>
  );
}