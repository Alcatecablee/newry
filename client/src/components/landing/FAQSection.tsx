import React, { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  keywords?: string[];
}

const faqData: FAQItem[] = [
  {
    question: "What is NeuroLint and how does it work?",
    answer:
      "NeuroLint is an advanced code analysis and transformation platform that automatically fixes code issues, improves performance, and enforces best practices. It uses a sophisticated 6-layer analysis system combining AST parsing, pattern recognition, and rule-based transformations to identify and fix problems in TypeScript, JavaScript, React, and Next.js codebases. Built with AI-ready architecture for future machine learning integration.",
    keywords: [
      "code analysis",
      "automated fixing",
      "advanced transformation",
      "TypeScript",
      "JavaScript",
      "React",
    ],
  },
  {
    question:
      "Which programming languages and frameworks does NeuroLint support?",
    answer:
      "NeuroLint currently supports TypeScript, JavaScript, React, and Next.js applications. Our platform includes specialized layers for component analysis, hydration fixes, configuration validation, and performance optimization. We're continuously expanding support for additional frameworks and languages.",
    keywords: [
      "TypeScript",
      "JavaScript",
      "React",
      "Next.js",
      "frameworks",
      "programming languages",
    ],
  },
  {
    question: "How secure is my code when using NeuroLint?",
    answer:
      "Security is our top priority. Your code is processed securely and never stored on our servers. All analysis happens in isolated environments, and we use enterprise-grade encryption for data transmission. NeuroLint is SOC 2 compliant and follows industry best practices for data protection.",
    keywords: [
      "security",
      "code protection",
      "encryption",
      "SOC 2",
      "enterprise-grade",
    ],
  },
  {
    question:
      "Can I integrate NeuroLint with my existing development workflow?",
    answer:
      "Yes! NeuroLint offers multiple integration options including a CLI tool, VS Code extension, REST API, and CI/CD integrations. You can integrate with GitHub Actions, Jenkins, GitLab CI, and other popular development tools. We also provide webhooks and Slack notifications for team collaboration.",
    keywords: [
      "CLI",
      "VS Code",
      "API",
      "CI/CD",
      "GitHub Actions",
      "Jenkins",
      "integration",
    ],
  },
  {
    question: "What is the difference between the free and paid plans?",
    answer:
      "The free plan includes 100 transformations per month and access to our core analysis layers. Pro plans offer unlimited transformations, priority support, advanced AI features, team collaboration tools, and enterprise integrations. Enterprise plans add custom rules, dedicated support, and on-premise deployment options.",
    keywords: [
      "pricing",
      "free plan",
      "pro plan",
      "enterprise",
      "transformations",
      "features",
    ],
  },
  {
    question: "How accurate are NeuroLint's code transformations?",
    answer:
      "NeuroLint achieves high accuracy in code transformations through our multi-layer validation system and extensive rule-based pattern matching. Each transformation is tested across multiple scenarios before application using AST parsing and syntax validation. Our transformation rules are continuously refined based on real-world usage and community feedback.",
    keywords: [
      "accuracy",
      "transformations",
      "validation",
      "rule-based",
      "code quality",
    ],
  },
  {
    question: "Can NeuroLint handle large codebases?",
    answer:
      "Absolutely! NeuroLint is designed for enterprise-scale applications. Our platform can analyze and transform codebases with hundreds of thousands of lines of code efficiently. We use parallel processing, intelligent caching, and incremental analysis to ensure fast performance even on large projects.",
    keywords: [
      "large codebases",
      "enterprise-scale",
      "performance",
      "parallel processing",
      "scalability",
    ],
  },
  {
    question: "Do you offer custom rules and configurations?",
    answer:
      "Yes, enterprise customers can create custom analysis rules and configurations tailored to their specific coding standards and requirements. Our platform supports custom rule engines, team-specific configurations, and integration with existing linting tools and style guides.",
    keywords: [
      "custom rules",
      "configurations",
      "enterprise",
      "coding standards",
      "style guides",
    ],
  },
  {
    question: "What kind of support do you provide?",
    answer:
      "We offer comprehensive support including documentation, video tutorials, email support, and live chat. Pro customers get priority support with faster response times. Enterprise customers receive dedicated account management, onboarding assistance, and custom training sessions.",
    keywords: [
      "support",
      "documentation",
      "tutorials",
      "priority support",
      "enterprise support",
    ],
  },
  {
    question: "How do I get started with NeuroLint?",
    answer:
      "Getting started is easy! You can begin with our free plan by signing up and uploading your code for analysis. For teams, we recommend starting with our CLI tool or VS Code extension. Enterprise customers can schedule a demo to explore custom deployment options and advanced features.",
    keywords: [
      "getting started",
      "free plan",
      "CLI tool",
      "VS Code extension",
      "demo",
    ],
  },
];

const FAQItem: React.FC<{
  faq: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ faq, isOpen, onToggle }) => {
  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
      <button
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-zinc-900/50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-inset"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-semibold text-white pr-4">
          {faq.question}
        </h3>
        <div className="flex-shrink-0">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-zinc-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-zinc-400" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <div className="pt-2 border-t border-zinc-800">
            <p className="text-zinc-300 leading-relaxed">{faq.answer}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export const FAQSection: React.FC = () => {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  // Generate JSON-LD structured data for SEO
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="py-20 bg-black border-t border-zinc-800" id="faq">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-zinc-800/50 rounded-xl backdrop-blur-sm mb-6">
              <HelpCircle className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-zinc-400">
                Frequently Asked Questions
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Everything You Need to Know
            </h2>

            <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
              Get answers to common questions about NeuroLint's rule-based code
              analysis, integrations, pricing, and enterprise features.
              Currently in beta with AI integration planned for future releases.
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <FAQItem
                key={index}
                faq={faq}
                isOpen={openItems.has(index)}
                onToggle={() => toggleItem(index)}
              />
            ))}
          </div>

          {/* Additional Help */}
          <div className="mt-16 text-center">
            <div className="p-8 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-4">
                Still have questions?
              </h3>
              <p className="text-zinc-400 mb-6">
                Our team is here to help you get the most out of NeuroLint.
                Reach out for personalized assistance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:support@neurolint.com"
                  className="inline-flex items-center px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Contact Support
                </a>
                <a
                  href="/docs"
                  className="inline-flex items-center px-6 py-3 bg-zinc-800 text-white font-semibold rounded-xl border border-zinc-700 hover:bg-zinc-700 transition-colors"
                >
                  View Documentation
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
