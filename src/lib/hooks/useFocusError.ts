// If error in EditJobModal the error line is automatically focused
import { useEffect } from "react";

type ErrorMap = Record<string, string | undefined>;

export function useFocusError(
  open: boolean,
  errors: ErrorMap,
  refs: Record<string, React.RefObject<HTMLElement | null>>
) {
  useEffect(() => {
    if (!open || !errors) return;

    for (const [field, ref] of Object.entries(refs)) {
      if (errors[field] && ref.current) {
        ref.current.focus();
        break;
      }
    }
  }, [open, errors, refs]);
}