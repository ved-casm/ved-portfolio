import { Metadata } from "next";
import ContactExperience from "@/components/contact/ContactExperience";
import "@/components/contact/ContactPage.css";

export const metadata: Metadata = {
  title: "Contact | Vedank Gaur",
  description:
    "Start a project with Vedank Gaur: tell me what you're building and I'll reply within 24 hours.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <ContactExperience />;
}
