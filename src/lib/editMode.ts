import { SITE } from "@consts"

/**
 * Get the current edit mode status from localStorage or fallback to config
 */
export function getEditMode(): boolean {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("editMode")
    if (stored !== null) {
      return stored === "true"
    }
  }
  return SITE.EDIT_MODE || false
}

/**
 * Client-side script to inject edit mode into window for use in components
 */
export const editModeScript = `
  window.getEditMode = function() {
    const stored = localStorage.getItem("editMode")
    if (stored !== null) {
      return stored === "true"
    }
    return ${SITE.EDIT_MODE || false}
  }
`