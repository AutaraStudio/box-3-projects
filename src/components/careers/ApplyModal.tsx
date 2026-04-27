/**
 * ApplyModal
 * ==========
 * Full-screen modal triggered from the "Apply now" button on a
 * vacancy row. Captures the candidate's contact details, work
 * experience summary, and a CV upload.
 *
 * Behaviour:
 *  - Opens / closes via the `open` + `onClose` props (controlled).
 *  - Backdrop click + Escape key both close.
 *  - Body scroll locked while open via the `is-modal-open` class
 *    on <html>.
 *  - Submit is currently a no-op stub — replace `submitApplication`
 *    with a real endpoint (Sanity action / /api/apply / 3rd-party
 *    form service) when the integration lands.
 */

"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

import Button from "@/components/ui/Button";

import "./ApplyModal.css";

interface ApplyModalProps {
  open: boolean;
  onClose: () => void;
  /** Role title — displayed in the modal header so the candidate
   *  can confirm what they're applying for. */
  roleTitle: string;
}

type Status = "idle" | "submitting" | "sent";

export default function ApplyModal({
  open,
  onClose,
  roleTitle,
}: ApplyModalProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  /* Reset state every time the modal opens so a returning user
     starts on a fresh form rather than the previous "sent" view. */
  useEffect(() => {
    if (open) {
      setStatus("idle");
      setFileName(null);
      /* Defer focus until the dialog has painted. */
      requestAnimationFrame(() => firstFieldRef.current?.focus());
    }
  }, [open]);

  /* Lock body scroll + Escape-to-close while open. */
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    html.classList.add("is-modal-open");
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      html.classList.remove("is-modal-open");
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    /* Stub — wire to a real endpoint later. */
    await new Promise((r) => setTimeout(r, 800));
    setStatus("sent");
  }

  return (
    <div
      className={`apply-modal${open ? " is-open" : ""}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        className="apply-modal__backdrop"
        aria-label="Close application form"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-modal-title"
        className="apply-modal__dialog"
        /* Force the dark theme on the dialog so the modal reads as
           a tonal break (brown bg, pink text) from the cream
           careers page beneath, regardless of the host page's
           current theme. */
        data-theme="dark"
        /* Opt this subtree out of Lenis's wheel capture so the
           form scrolls natively when content overflows the
           dialog's max-height — without this, mouse-wheel events
           inside the modal would be hijacked by Lenis and try to
           scroll the (locked) underlying page instead. */
        data-lenis-prevent
      >
        <header className="apply-modal__head">
          <div className="apply-modal__head-text">
            <p className="apply-modal__eyebrow text-small text-caps">
              Apply for
            </p>
            <h2
              id="apply-modal-title"
              className="apply-modal__title text-h3"
            >
              {roleTitle}
            </h2>
          </div>
          <button
            type="button"
            className="apply-modal__close"
            aria-label="Close"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </header>

        {status === "sent" ? (
          <div className="apply-modal__sent">
            <h3 className="text-h4">Thanks — application received.</h3>
            <p className="text-large">
              We've got your details for {roleTitle}. Someone from the
              studio will be in touch from
              hello@box3projects.co.uk within five working days.
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        ) : (
          <form className="apply-modal__form" onSubmit={handleSubmit} noValidate>
            <div className="apply-modal__row apply-modal__row--split">
              <Field
                ref={firstFieldRef}
                name="firstName"
                label="First name"
                autoComplete="given-name"
                required
              />
              <Field
                name="lastName"
                label="Last name"
                autoComplete="family-name"
                required
              />
            </div>

            <Field
              name="email"
              label="Email"
              type="email"
              autoComplete="email"
              required
            />

            <div className="apply-modal__row apply-modal__row--split">
              <Field
                name="phone"
                label="Phone"
                type="tel"
                autoComplete="tel"
              />
              <Field
                name="linkedin"
                label="LinkedIn / portfolio URL"
                type="url"
                autoComplete="url"
              />
            </div>

            <Textarea
              name="experience"
              label="Work experience + why this role"
              rows={6}
              required
            />

            <FileField
              name="cv"
              label="Upload CV"
              accept=".pdf,.doc,.docx,application/pdf"
              fileName={fileName}
              onFileChange={setFileName}
              required
            />

            <div className="apply-modal__actions">
              <Button
                type="submit"
                size="md"
                disabled={status === "submitting"}
              >
                {status === "submitting"
                  ? "Submitting…"
                  : "Submit application →"}
              </Button>
              <p className="apply-modal__legal text-small">
                By submitting, you agree to Box 3 Projects retaining
                your details for the purpose of evaluating this
                application.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Subcomponents — same hairline-bottom input language as the contact
   form so the modal feels like part of the same family.
   -------------------------------------------------------------------------- */

import { forwardRef } from "react";

interface FieldProps {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "url";
  autoComplete?: string;
  required?: boolean;
}

const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { name, label, type = "text", autoComplete, required },
  ref,
) {
  const id = `apply-${name}`;
  return (
    <div className="apply-modal__field">
      <label htmlFor={id} className="apply-modal__label text-small text-caps">
        {label}
        {required ? (
          <span className="apply-modal__required" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      <input
        ref={ref}
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="apply-modal__input text-main"
      />
    </div>
  );
});

interface TextareaProps {
  name: string;
  label: string;
  rows?: number;
  required?: boolean;
}

function Textarea({ name, label, rows = 5, required }: TextareaProps) {
  const id = `apply-${name}`;
  return (
    <div className="apply-modal__field">
      <label htmlFor={id} className="apply-modal__label text-small text-caps">
        {label}
        {required ? (
          <span className="apply-modal__required" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        required={required}
        className="apply-modal__textarea text-main"
      />
    </div>
  );
}

interface FileFieldProps {
  name: string;
  label: string;
  accept?: string;
  required?: boolean;
  fileName: string | null;
  onFileChange: (name: string | null) => void;
}

function FileField({
  name,
  label,
  accept,
  required,
  fileName,
  onFileChange,
}: FileFieldProps) {
  const id = `apply-${name}`;
  return (
    <div className="apply-modal__field">
      <label htmlFor={id} className="apply-modal__label text-small text-caps">
        {label}
        {required ? (
          <span className="apply-modal__required" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      <label htmlFor={id} className="apply-modal__file">
        <span className="apply-modal__file-icon" aria-hidden="true">
          <UploadIcon />
        </span>
        <span className="apply-modal__file-text text-main">
          {fileName ?? "Choose a file (PDF or Word)"}
        </span>
        {fileName ? (
          <button
            type="button"
            className="apply-modal__file-clear text-small text-caps"
            onClick={(event) => {
              event.preventDefault();
              onFileChange(null);
              const input = document.getElementById(id) as HTMLInputElement | null;
              if (input) input.value = "";
            }}
          >
            Clear
          </button>
        ) : null}
        <input
          id={id}
          name={name}
          type="file"
          accept={accept}
          required={required}
          className="apply-modal__file-input"
          onChange={(event) =>
            onFileChange(event.target.files?.[0]?.name ?? null)
          }
        />
      </label>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Icons
   -------------------------------------------------------------------------- */

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 4v12" />
      <polyline points="6 10 12 4 18 10" />
      <line x1="4" y1="20" x2="20" y2="20" />
    </svg>
  );
}
