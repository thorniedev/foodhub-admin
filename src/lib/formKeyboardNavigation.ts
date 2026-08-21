import type React from "react";

/**
 * Enables smooth keyboard arrow-key (ArrowDown / ArrowUp) and Enter navigation
 * across input, textarea, select, switch, and submit controls in forms.
 */
export function handleFormArrowKeyNavigation(
  event: React.KeyboardEvent<HTMLElement>,
) {
  if (event.defaultPrevented) return;

  const target = event.target as HTMLElement | null;
  if (!target) return;

  const tagName = target.tagName;
  const isInput = tagName === "INPUT";
  const isTextarea = tagName === "TEXTAREA";
  const isSelect = tagName === "SELECT";
  const isButton = tagName === "BUTTON";

  if (!isInput && !isTextarea && !isSelect && !isButton) return;

  const isArrowDown = event.key === "ArrowDown";
  const isArrowUp = event.key === "ArrowUp";
  const isEnter = event.key === "Enter" && !event.shiftKey && isInput;

  if (!isArrowDown && !isArrowUp && !isEnter) return;

  // Preserve native multiline cursor movements inside textarea
  if (isTextarea && (isArrowUp || isArrowDown)) {
    const textarea = target as HTMLTextAreaElement;
    const { selectionStart, selectionEnd, value } = textarea;

    if (
      isArrowUp &&
      selectionStart > 0 &&
      value.includes("\n") &&
      selectionStart > value.indexOf("\n")
    ) {
      return;
    }

    if (
      isArrowDown &&
      selectionEnd < value.length &&
      value.includes("\n") &&
      selectionEnd <= value.lastIndexOf("\n")
    ) {
      return;
    }
  }

  // Find all focusable form controls within the active form or modal
  const container =
    target.closest("form") ||
    target.closest("[role='dialog']") ||
    document.body;

  const focusableSelector =
    'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled]), button[role="switch"]:not([disabled]), button[type="submit"]:not([disabled])';

  const focusables = Array.from(
    container.querySelectorAll<HTMLElement>(focusableSelector),
  ).filter((el) => {
    return (
      el.offsetParent !== null &&
      !el.hasAttribute("disabled") &&
      el.tabIndex !== -1 &&
      window.getComputedStyle(el).visibility !== "hidden" &&
      window.getComputedStyle(el).display !== "none"
    );
  });

  const currentIndex = focusables.indexOf(target);
  if (currentIndex === -1) return;

  let nextIndex: number | null = null;

  if (isArrowDown || isEnter) {
    if (currentIndex < focusables.length - 1) {
      nextIndex = currentIndex + 1;
    }
  } else if (isArrowUp) {
    if (currentIndex > 0) {
      nextIndex = currentIndex - 1;
    }
  }

  if (nextIndex !== null && focusables[nextIndex]) {
    event.preventDefault();
    const nextElement = focusables[nextIndex];
    nextElement.focus();

    if (
      nextElement instanceof HTMLInputElement &&
      nextElement.type !== "checkbox" &&
      nextElement.type !== "radio" &&
      nextElement.type !== "file"
    ) {
      nextElement.select?.();
    }
  }
}
