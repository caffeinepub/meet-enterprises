import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { motion } from "motion/react";

const faqs = [
  {
    id: "item-1",
    question: "How do I place an order?",
    answer:
      "Placing an order is simple! Browse our collection, select your desired product, choose your size and colour, then add it to your cart. Once you're ready, head to your cart and proceed to checkout. Fill in your delivery details and choose your preferred payment method — that's it! You'll receive a confirmation once your order is placed.",
  },
  {
    id: "item-2",
    question: "What payment methods do you accept?",
    answer:
      "We currently accept two payment methods: Cash on Delivery (COD) — pay in cash when your order arrives at your doorstep, and GPay / UPI — scan our QR code at checkout to pay instantly via any UPI app (Google Pay, PhonePe, Paytm, etc.). We do not accept credit/debit cards or net banking at this time.",
  },
  {
    id: "item-3",
    question: "How do I track my order?",
    answer:
      "Once your order is dispatched, our team will send you an update via WhatsApp on the number you registered with. You can also reach out to our support team directly on 97236 41809 or 97236 44472 for a real-time status update on your order.",
  },
  {
    id: "item-4",
    question: "Can I cancel or modify my order?",
    answer:
      "Yes, you can cancel or modify your order within 12 hours of placing it. After 12 hours, your order may already be in processing and cancellations might not be possible. To request a change, please contact us immediately on WhatsApp or call 97236 41809. Once an order has been shipped, it cannot be cancelled.",
  },
  {
    id: "item-5",
    question: "What is your return and exchange policy?",
    answer:
      "We accept returns and exchanges within 7 days of delivery, provided the item is unused, unwashed, and in its original packaging with tags intact. Items purchased during sale or clearance are not eligible for returns. To initiate a return or exchange, contact our support team with your order details and reason for return. Refunds (for prepaid orders) are processed within 5–7 business days after we receive the item.",
  },
  {
    id: "item-6",
    question: "How long does delivery take?",
    answer:
      "Standard delivery typically takes 4–7 business days depending on your location within India. Orders in metro cities like Mumbai, Delhi, Bangalore, and Ahmedabad may arrive faster, within 2–4 business days. You'll be notified via WhatsApp once your order is out for delivery.",
  },
  {
    id: "item-7",
    question: "Do you deliver outside India?",
    answer:
      "Currently, Meet Enterprises delivers only within India. We cover most pin codes across the country. If you're in a remote area, our team will confirm delivery feasibility after you place your order. International shipping is something we're working on — stay tuned for updates!",
  },
  {
    id: "item-8",
    question: "How do I use a coupon code?",
    answer:
      "At checkout, you'll find a field labelled 'Coupon Code'. Enter your valid coupon code there and click Apply. The discount will be automatically reflected in your order total before you confirm the purchase. Coupon codes are case-sensitive, valid for limited periods, and cannot be combined with other offers unless stated otherwise. Check our Schemes & Offers page for active coupon codes.",
  },
  {
    id: "item-9",
    question: "What is the voucher reward system?",
    answer:
      "Meet Enterprises rewards loyal customers with surprise vouchers! When your order total is ₹1,500 or more, you automatically receive a reward voucher worth anywhere between ₹1 and ₹10,000 — it's a lucky draw! This voucher can be applied to your next purchase. Orders below ₹1,500 are not eligible for voucher rewards, so shop a little more to unlock your surprise!",
  },
  {
    id: "item-10",
    question: "How do I contact customer support?",
    answer:
      "Our support team is available Monday to Saturday, 10 AM – 7 PM IST. You can reach us via: Phone/WhatsApp: 97236 41809 or 97236 44472, or Email: support@meetenterprise654@gmail.com. We typically respond within a few hours. For the fastest response, we recommend WhatsApp messaging.",
  },
];

export function SupportFAQPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.45 0.12 75 / 0.15) 0%, transparent 70%)",
          }}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs tracking-[0.3em] uppercase text-gold mb-4 font-semibold"
          >
            Help Centre
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-5 leading-tight"
          >
            Support & <span className="text-gold">FAQ</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed"
          >
            Everything you need to know about shopping with Meet Enterprises.
            Can't find an answer? Reach out and we'll be happy to help.
          </motion.p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <Accordion
            type="single"
            collapsible
            className="w-full flex flex-col gap-3"
            data-ocid="faq.list"
          >
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                data-ocid={`faq.item.${index + 1}`}
                className="border border-gold-border rounded-lg overflow-hidden"
                style={{ backgroundColor: "oklch(0.1 0.005 230)" }}
              >
                <AccordionTrigger className="px-5 py-4 text-left text-sm md:text-base font-medium text-foreground hover:text-gold transition-colors hover:no-underline [&[data-state=open]]:text-gold">
                  <span className="text-gold/50 font-mono text-xs mr-3 flex-shrink-0">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5">
                  <div className="border-t border-gold-border pt-4">
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </section>

      {/* Contact Section */}
      <section
        className="py-14 md:py-20"
        style={{ backgroundColor: "oklch(0.08 0.004 230)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3 font-semibold">
              Still need help?
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-3">
              Get in Touch
            </h2>
            <p className="text-muted-foreground text-sm mb-10 max-w-md mx-auto">
              Our support team is available Monday – Saturday, 10 AM to 7 PM
              IST.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-2xl mx-auto">
              {/* Phone 1 */}
              <a
                href="tel:+919723641809"
                data-ocid="contact.phone.button"
                className="flex flex-col items-center gap-3 p-5 rounded-xl border border-gold-border hover:border-gold transition-all group"
                style={{ backgroundColor: "oklch(0.1 0.005 230)" }}
              >
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "oklch(0.45 0.12 75 / 0.15)" }}
                >
                  <Phone className="w-4 h-4 text-gold" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Call / WhatsApp
                  </p>
                  <p className="text-sm font-medium text-foreground group-hover:text-gold transition-colors">
                    97236 41809
                  </p>
                </div>
              </a>

              {/* Phone 2 */}
              <a
                href="tel:+919723644472"
                data-ocid="contact.phone.button"
                className="flex flex-col items-center gap-3 p-5 rounded-xl border border-gold-border hover:border-gold transition-all group"
                style={{ backgroundColor: "oklch(0.1 0.005 230)" }}
              >
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "oklch(0.45 0.12 75 / 0.15)" }}
                >
                  <MessageCircle className="w-4 h-4 text-gold" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Call / WhatsApp
                  </p>
                  <p className="text-sm font-medium text-foreground group-hover:text-gold transition-colors">
                    97236 44472
                  </p>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:support@meetenterprise654@gmail.com"
                data-ocid="contact.email.button"
                className="flex flex-col items-center gap-3 p-5 rounded-xl border border-gold-border hover:border-gold transition-all group"
                style={{ backgroundColor: "oklch(0.1 0.005 230)" }}
              >
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "oklch(0.45 0.12 75 / 0.15)" }}
                >
                  <Mail className="w-4 h-4 text-gold" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Email
                  </p>
                  <p className="text-sm font-medium text-foreground group-hover:text-gold transition-colors break-all">
                    support@meetenterprise654
                    <br />
                    @gmail.com
                  </p>
                </div>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
