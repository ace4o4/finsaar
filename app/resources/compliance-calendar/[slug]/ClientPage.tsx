"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import ContactForm from "@/components/ContactForm";

export function ComplianceCalendarDetailClient() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <Navbar onOpenContact={() => setContactOpen(true)} />
      <ContactForm isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
