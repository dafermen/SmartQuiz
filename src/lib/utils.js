import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines conditional class names and resolves Tailwind conflicts.
 *
 * @param {...import("clsx").ClassValue} inputs - Class values accepted by clsx.
 * @returns {string} Merged className string.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
} 
