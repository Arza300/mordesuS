"use client";

import { useState, useTransition } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { MagneticButton } from "@/components/common/magnetic-button";
import { Reveal } from "@/components/common/reveal";
import { SectionHeading } from "@/components/common/section-heading";
import { getContent } from "@/content";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
  company: z.string().optional(),
  message: z.string().min(10, "Tell us a bit more about your project"),
});

type ContactValues = z.infer<typeof contactSchema>;

export function ContactSection() {
  const content = getContent().contact;
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = (values: ContactValues) => {
    startTransition(async () => {
      // Client-side mailto fallback until a mail provider is wired
      const subject = encodeURIComponent(`Project inquiry from ${values.name}`);
      const body = encodeURIComponent(
        `Name: ${values.name}\nEmail: ${values.email}\nCompany: ${values.company ?? "—"}\n\n${values.message}`,
      );
      window.location.href = `mailto:${siteConfig.contact.email}?subject=${subject}&body=${body}`;
      setSent(true);
      toast.success(content.form.success);
      reset();
    });
  };

  return (
    <section
      id="contact"
      className="section-pad relative"
      aria-labelledby="contact-title"
    >
      <div className="container-studio grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal>
            <SectionHeading
              eyebrow={content.eyebrow}
              title={content.title}
              description={content.description}
            />
          </Reveal>
          <Reveal delay={0.1} className="mt-10 space-y-4 text-sm text-white/55">
            <p>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                data-cursor="hover"
                className="text-white transition-colors hover:text-[#A855F7]"
              >
                {siteConfig.contact.email}
              </a>
            </p>
            <p>{siteConfig.contact.address}</p>
          </Reveal>
        </div>

        <Reveal delay={0.12} className="lg:col-span-7">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="glass rounded-[2rem] p-6 sm:p-8 md:p-10"
            noValidate
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label={content.form.name}
                error={errors.name?.message}
                {...register("name")}
              />
              <Field
                label={content.form.email}
                type="email"
                error={errors.email?.message}
                {...register("email")}
              />
            </div>
            <div className="mt-5">
              <Field
                label={content.form.company}
                error={errors.company?.message}
                {...register("company")}
              />
            </div>
            <div className="mt-5">
              <label className="block text-xs tracking-[0.18em] text-white/45 uppercase">
                {content.form.message}
                <textarea
                  rows={5}
                  className={cn(
                    "mt-2 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white transition-colors outline-none",
                    "placeholder:text-white/25 focus:border-[#A855F7]/50",
                  )}
                  placeholder="Timeline, goals, links…"
                  {...register("message")}
                />
              </label>
              {errors.message ? (
                <p className="mt-2 text-xs text-red-400">
                  {errors.message.message}
                </p>
              ) : null}
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <MagneticButton type="submit" disabled={pending}>
                {pending ? "Sending…" : content.form.submit}
              </MagneticButton>
              {sent ? (
                <p className="text-sm text-[#A855F7]">{content.form.success}</p>
              ) : null}
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

const Field = ({ label, error, className, ...props }: FieldProps) => (
  <label className="block text-xs tracking-[0.18em] text-white/45 uppercase">
    {label}
    <input
      className={cn(
        "mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white transition-colors outline-none",
        "placeholder:text-white/25 focus:border-[#A855F7]/50",
        className,
      )}
      {...props}
    />
    {error ? (
      <span className="mt-2 block text-xs tracking-normal text-red-400 normal-case">
        {error}
      </span>
    ) : null}
  </label>
);
