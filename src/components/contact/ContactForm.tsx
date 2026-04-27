/**
 * ContactForm
 * ===========
 * Box 3 contact form. Field order:
 *
 *   First name *           |  Last name *
 *   Email *
 *   Organisation
 *   Project type *  ← replaces Populous's "Region" dropdown.
 *   Subject *
 *   Message *
 *   [Send]
 *
 * Submission is currently a no-op stub — the onSubmit handler
 * just simulates a success state. Wire to a real endpoint
 * (Sanity action, /api/contact, or 3rd-party form service) when
 * the integration lands.
 */

"use client";

import { useState, type FormEvent } from "react";

import Button from "@/components/ui/Button";
import DropdownSelect from "./DropdownSelect";

import "./ContactForm.css";

const PROJECT_TYPES = [
  "Workplace",
  "Hospitality",
  "Residential",
  "Retail",
  "Other",
] as const;

const SUBJECTS = [
  "Business development",
  "Careers",
  "Media",
  "General",
] as const;

type Status = "idle" | "submitting" | "sent";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    /* Stub. Replace with a real submission once the endpoint
       lands. The 600ms delay is just so the button's "Sending…"
       state is visible in dev. */
    await new Promise((r) => setTimeout(r, 600));
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="contact-form contact-form--sent" role="status">
        <p className="text-h4">Thanks — we'll be in touch.</p>
        <p className="text-large">
          We've received your note and will respond from
          hello@box3projects.co.uk within two working days.
        </p>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      {/* Row 1: First / Last name */}
      <div className="contact-form__row contact-form__row--split">
        <Field
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

      {/* Row 2: Email */}
      <Field
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
      />

      {/* Row 3: Organisation (optional) */}
      <Field
        name="organisation"
        label="Organisation"
        autoComplete="organization"
      />

      {/* Row 4: Project type — replaces Region. */}
      <DropdownField
        name="projectType"
        label="Project type"
        options={PROJECT_TYPES}
        placeholder="Select a project type"
        required
      />

      {/* Row 5: Subject */}
      <DropdownField
        name="subject"
        label="Subject"
        options={SUBJECTS}
        placeholder="Select a subject"
        required
      />

      {/* Row 6: Message */}
      <Textarea name="message" label="Message" rows={6} required />

      <div className="contact-form__actions">
        <Button
          type="submit"
          size="md"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Sending…" : "Send message →"}
        </Button>
      </div>
    </form>
  );
}

/* --------------------------------------------------------------------------
   Subcomponents — keep markup repeatable. Each renders a label-stack
   atop the input with a hairline beneath, no box outline. Editorial
   look, easy to scan.
   -------------------------------------------------------------------------- */

interface FieldProps {
  name: string;
  label: string;
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  required?: boolean;
}

function Field({
  name,
  label,
  type = "text",
  autoComplete,
  required,
}: FieldProps) {
  const id = `contact-${name}`;
  return (
    <div className="contact-form__field">
      <label htmlFor={id} className="contact-form__label text-small text-caps">
        {label}
        {required ? (
          <span className="contact-form__required" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="contact-form__input text-main"
      />
    </div>
  );
}

interface DropdownFieldProps {
  name: string;
  label: string;
  options: ReadonlyArray<string>;
  placeholder: string;
  required?: boolean;
}

function DropdownField({
  name,
  label,
  options,
  placeholder,
  required,
}: DropdownFieldProps) {
  const id = `contact-${name}`;
  return (
    <div className="contact-form__field">
      <label htmlFor={id} className="contact-form__label text-small text-caps">
        {label}
        {required ? (
          <span className="contact-form__required" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      <DropdownSelect
        id={id}
        name={name}
        options={options}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

interface TextareaProps {
  name: string;
  label: string;
  rows?: number;
  required?: boolean;
}

function Textarea({ name, label, rows = 5, required }: TextareaProps) {
  const id = `contact-${name}`;
  return (
    <div className="contact-form__field">
      <label htmlFor={id} className="contact-form__label text-small text-caps">
        {label}
        {required ? (
          <span className="contact-form__required" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        required={required}
        className="contact-form__textarea text-main"
      />
    </div>
  );
}
