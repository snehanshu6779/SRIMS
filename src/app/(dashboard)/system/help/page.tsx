import PageHeader from "@/components/layout/PageHeader";
import { Mail, Phone, Clock, MessageCircleQuestion } from "lucide-react";

const faqs = [
  {
    q: "How do I create a new requisition?",
    a: "Go to Requisitions → New Requisition, add items to your cart from the catalog, fill in the required date and purpose, then review and submit. You can also save it as a draft and finish later.",
  },
  {
    q: "Who approves my requisition?",
    a: "Requisitions are routed to your department's assigned Approver. You can track the status (Pending, Approved, Rejected) under My Requisitions.",
  },
  {
    q: "What happens after a requisition is approved?",
    a: "It moves to the Issue Queue, where an Inventory Manager processes the physical handover of items. If stock is insufficient, you may receive a Partial issuance.",
  },
  {
    q: "How are low stock items identified?",
    a: "Every item has a minimum stock threshold set by an Inventory Manager. Items below that threshold appear under Inventory → Low Stock Alerts, color-coded by severity.",
  },
  {
    q: "I forgot my password — what do I do?",
    a: "Use the \"Forgot Password\" link on the login screen, or reach out to your system administrator using the contact details below.",
  },
];

export default function HelpSupportPage() {
  return (
    <div>
      <PageHeader
        title="Help & Support"
        subtitle="Get in touch with the SRIMS support team or browse common questions"
      />

      {/* Contact Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <a
          href="mailto:contacts@eduplex.in"
          className="rounded-card border border-border bg-surface-card p-card-padding transition-colors hover:border-brand-primary hover:shadow-sm"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-tint-blue-bg">
            <Mail size={20} className="text-tint-blue-icon" />
          </div>
          <h3 className="text-[14px] font-semibold text-text-primary">General Support</h3>
          <p className="mt-1 text-[13px] text-brand-primary">contacts@eduplex.in</p>
        </a>

        <a
          href="mailto:csr@eduplex.in"
          className="rounded-card border border-border bg-surface-card p-card-padding transition-colors hover:border-brand-primary hover:shadow-sm"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-tint-purple-bg">
            <Mail size={20} className="text-tint-purple-icon" />
          </div>
          <h3 className="text-[14px] font-semibold text-text-primary">Customer Service</h3>
          <p className="mt-1 text-[13px] text-brand-primary">csr@eduplex.in</p>
        </a>

        <a
          href="tel:+918337056594"
          className="rounded-card border border-border bg-surface-card p-card-padding transition-colors hover:border-brand-primary hover:shadow-sm"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-tint-green-bg">
            <Phone size={20} className="text-tint-green-icon" />
          </div>
          <h3 className="text-[14px] font-semibold text-text-primary">Phone Support</h3>
          <p className="mt-1 text-[13px] text-brand-primary">+91 83370 56594</p>
        </a>
      </div>

      {/* Hours note */}
      <div className="mb-8 flex items-center gap-2 rounded-md bg-tint-blue-bg px-4 py-2.5 text-[13px] text-tint-blue-icon">
        <Clock size={14} />
        Support is typically available Monday–Saturday, 9:00 AM – 6:30 PM IST.
      </div>

      {/* FAQs */}
      <div className="rounded-card border border-border bg-surface-card p-card-padding">
        <h3 className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-text-primary">
          <MessageCircleQuestion size={18} className="text-brand-primary" />
          Frequently Asked Questions
        </h3>
        <div className="divide-y divide-border">
          {faqs.map((item, idx) => (
            <div key={idx} className="py-3 first:pt-0 last:pb-0">
              <h4 className="text-[13px] font-semibold text-text-primary">{item.q}</h4>
              <p className="mt-1 text-[13px] text-text-secondary">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
