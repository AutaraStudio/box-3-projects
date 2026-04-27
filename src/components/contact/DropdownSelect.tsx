/**
 * DropdownSelect
 * ==============
 * Custom dropdown for the contact form. Replaces the native
 * `<select>` so we can fully style the trigger, the menu, and the
 * option states without fighting OS chrome.
 *
 * Behaviour:
 *  - Click the trigger to open / close.
 *  - Click an option to select + close.
 *  - Click outside or hit Escape to close.
 *  - Up / Down arrow keys cycle through options when open;
 *    Enter / Space confirms.
 *  - A hidden `<input>` mirrors the selected value so the form
 *    submits the chosen string just like a native select would.
 *
 * Visual:
 *  - Trigger: hairline-bottom row, label sits above (rendered by
 *    the parent ContactForm), caret rotates 180° when open.
 *  - Menu: absolute panel beneath, animates open via CSS
 *    grid-rows trick, options stagger slightly.
 */

"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import "./DropdownSelect.css";

interface DropdownSelectProps {
  name: string;
  options: ReadonlyArray<string>;
  placeholder: string;
  required?: boolean;
  /** Optional defaultValue. Empty string = nothing selected. */
  defaultValue?: string;
  /** ID applied to the trigger; the label's `htmlFor` should
   *  match this so a click on the label opens the dropdown. */
  id?: string;
}

export default function DropdownSelect({
  name,
  options,
  placeholder,
  required = false,
  defaultValue = "",
  id: idProp,
}: DropdownSelectProps) {
  const generatedId = useId();
  const id = idProp ?? `dropdown-${generatedId}`;
  const menuId = `${id}-menu`;

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [activeIndex, setActiveIndex] = useState(-1);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  /* Click-outside + Escape close. */
  useEffect(() => {
    if (!open) return;

    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /* When opening, focus the active option (or the first matching
     the current value) so keyboard users can immediately arrow. */
  useEffect(() => {
    if (!open) return;
    const initial =
      value === "" ? 0 : Math.max(0, options.indexOf(value));
    setActiveIndex(initial);
    /* Defer focus so the menu has rendered. */
    requestAnimationFrame(() => {
      optionRefs.current[initial]?.focus();
    });
  }, [open, options, value]);

  function selectValue(next: string) {
    setValue(next);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleTriggerKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (
      event.key === "ArrowDown" ||
      event.key === "ArrowUp" ||
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      setOpen(true);
    }
  }

  function handleOptionKey(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = (index + 1) % options.length;
      setActiveIndex(next);
      optionRefs.current[next]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const next = (index - 1 + options.length) % options.length;
      setActiveIndex(next);
      optionRefs.current[next]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      optionRefs.current[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(options.length - 1);
      optionRefs.current[options.length - 1]?.focus();
    }
  }

  const display = value || placeholder;
  const placeholderShown = !value;

  return (
    <div
      ref={rootRef}
      className={`dropdown-select${open ? " is-open" : ""}`}
    >
      {/* Hidden input — syncs the selected value into the form
          submission so server-side handlers see it identically to
          a native <select>. */}
      <input type="hidden" name={name} value={value} />
      {required && !value ? (
        /* Required validation hook — a separate disabled-but-
           required hidden input makes the form fail to submit when
           empty without us having to wire a custom validator. */
        <input
          type="text"
          tabIndex={-1}
          aria-hidden="true"
          required
          value=""
          onChange={() => {}}
          className="dropdown-select__validity"
        />
      ) : null}

      <button
        ref={triggerRef}
        id={id}
        type="button"
        className={`dropdown-select__trigger text-main${
          placeholderShown ? " is-placeholder" : ""
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleTriggerKey}
      >
        <span className="dropdown-select__value">{display}</span>
        <span className="dropdown-select__caret" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
            <polyline
              points="6 10 12 16 18 10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      <div
        id={menuId}
        role="listbox"
        aria-labelledby={id}
        className="dropdown-select__menu"
        aria-hidden={!open}
      >
        <ul className="dropdown-select__list" role="presentation">
          {options.map((opt, index) => {
            const selected = opt === value;
            const active = index === activeIndex;
            return (
              <li key={opt} role="presentation">
                <button
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  tabIndex={-1}
                  className={`dropdown-select__option text-main${
                    selected ? " is-selected" : ""
                  }${active ? " is-active" : ""}`}
                  style={{ "--option-index": index } as React.CSSProperties}
                  onClick={() => selectValue(opt)}
                  onKeyDown={(e) => handleOptionKey(e, index)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <span className="dropdown-select__option-label">
                    {opt}
                  </span>
                  <span
                    className="dropdown-select__option-mark"
                    aria-hidden="true"
                  >
                    {selected ? (
                      <svg
                        viewBox="0 0 24 24"
                        width="12"
                        height="12"
                        fill="none"
                      >
                        <polyline
                          points="5 12 10 17 19 8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
