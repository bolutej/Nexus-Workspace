
import { useEffect, useRef } from "react";

export function useModalAccessibility(
  isOpen: boolean,
  onClose: () => void
) {
  const modalRef = useRef<HTMLElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElement.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const modal = modalRef.current;
    const firstInput = modal?.querySelector<HTMLElement>(
  "#task-title"
);

if (firstInput) {
  firstInput.focus();
} else {
  modal?.focus();
}
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || !modal) return;

      const focusableElements = modal.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      const elements = Array.from(focusableElements).filter(
        (element) => element.offsetParent !== null
      );

      if (elements.length === 0) {
        event.preventDefault();
        modal.focus();
        return;
      }

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === lastElement
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElement.current?.focus();
    };
  }, [isOpen]);

  return modalRef;
}
