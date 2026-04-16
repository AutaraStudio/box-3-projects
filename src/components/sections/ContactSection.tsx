/**
 * ContactSection
 * ==============
 * Two-column contact layout: info sidebar (cols 1-4) and form
 * column (cols 5-12) on desktop, stacked on mobile.
 *
 * Form tabs switch between enquiry types. All content via props.
 * The form is client-side interactive (tabs + submission).
 */

"use client";

import React, { useState } from "react";
import Image from "next/image";

import type {
  ContactFormTab,
  ContactFormField,
} from "@/sanity/queries/contactPage";
import { urlFor } from "@/sanity/lib/image";
import { Button } from "@/components/ui/Button";
import type { SanityImageSource } from "@sanity/image-url";

import "./ContactSection.css";

/* --------------------------------------------------------------------------
   Types
   -------------------------------------------------------------------------- */

interface ContactSectionProps {
  tabs?: ContactFormTab[];
  formFields?: ContactFormField[];
  submitLabel?: string;
  infoHeading?: string;
  address?: string;
  phone?: string;
  email?: string;
  infoImage?: SanityImageSource | null;
  infoImageAlt?: string;
}

/* --------------------------------------------------------------------------
   Component
   -------------------------------------------------------------------------- */

export default function ContactSection({
  tabs = [],
  formFields = [],
  submitLabel = "Submit",
  infoHeading,
  address,
  phone,
  email,
  infoImage,
  infoImageAlt,
}: ContactSectionProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? "");

  const imageUrl = infoImage
    ? urlFor(infoImage).width(800).quality(80).auto("format").url()
    : null;

  /* Group half-width fields into pairs for the name row layout */
  const renderFields = () => {
    const result: React.JSX.Element[] = [];
    let i = 0;

    while (i < formFields.length) {
      const field = formFields[i];
      const next = formFields[i + 1];

      if (field.halfWidth && next?.halfWidth) {
        result.push(
          <div className="contact-name-row" key={`pair-${field._key}`}>
            {renderField(field)}
            {renderField(next)}
          </div>,
        );
        i += 2;
      } else {
        result.push(renderField(field));
        i += 1;
      }
    }

    return result;
  };

  const renderField = (field: ContactFormField) => (
    <label className="contact-field" key={field._key} htmlFor={field.name}>
      <span className="font-secondary text-[length:var(--font-size-text-sm)] leading-relaxed text-[color:var(--theme-text)]">
        {field.label}
      </span>
      {field.type === "textarea" ? (
        <textarea
          className="contact-input"
          id={field.name}
          name={field.name}
          placeholder={field.placeholder}
          rows={4}
        />
      ) : (
        <input
          className="contact-input"
          id={field.name}
          name={field.name}
          placeholder={field.placeholder}
          type={field.type ?? "text"}
        />
      )}
    </label>
  );

  return (
    <section
      className="contact-section"
      data-theme="light"
      data-nav-theme="light"
    >
      {/* Info column (left on desktop) */}
      <div className="contact-info-col">
        {infoHeading && (
          <h2 className="contact-desktop-heading font-primary font-regular text-[length:var(--font-size-h5)] leading-none text-[color:var(--theme-text)]">
            {infoHeading}
          </h2>
        )}

        {address && (
          <p className="contact-info-text font-primary font-regular leading-relaxed text-[color:var(--theme-text)]">
            {address.split("\n").map((line, idx) => (
              <span key={idx}>
                {line}
                {idx < address.split("\n").length - 1 && <br />}
              </span>
            ))}
          </p>
        )}

        {phone && (
          <p className="contact-info-text font-primary font-regular leading-relaxed text-[color:var(--theme-text)]">
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="underline">
              {phone}
            </a>
          </p>
        )}

        {email && (
          <p className="contact-info-text font-primary font-regular leading-relaxed text-[color:var(--theme-text)]">
            <a href={`mailto:${email}`} className="underline">
              {email}
            </a>
          </p>
        )}

        {imageUrl && (
          <div className="contact-info-image" data-image-reveal>
            <Image
              src={imageUrl}
              alt={infoImageAlt ?? "Office"}
              fill
              sizes="(min-width: 992px) 25vw, 100vw"
              className="object-cover"
            />
          </div>
        )}
      </div>

      {/* Form column (right on desktop) */}
      <div className="contact-form-col">
        {/* Tabs */}
        {tabs.length > 0 && (
          <div className="contact-tabs">
            {tabs.map((tab) => (
              <button
                key={tab._key}
                type="button"
                className={`contact-tab font-primary font-regular leading-none text-[color:var(--theme-text)] ${
                  activeTab === tab.key ? "is-active" : ""
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Form */}
        <form
          className="contact-form"
          noValidate
          onSubmit={(e) => e.preventDefault()}
        >
          {renderFields()}

          <Button type="submit" variant="primary" size="lg">
            {submitLabel}
          </Button>
        </form>
      </div>
    </section>
  );
}
