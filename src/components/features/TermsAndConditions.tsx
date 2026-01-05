import { X } from "lucide-react";
import { useRef, useEffect } from "react";
import { addSpotlightEffect } from "@/utils/spotlight";

interface TermsAndConditionsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsAndConditions({
  isOpen,
  onClose,
}: TermsAndConditionsProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const cleanup = addSpotlightEffect(modalRef.current);
      return cleanup;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          boxShadow:
            "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/30">
          <h2 className="text-2xl font-bold text-white">
            Terms and Conditions
          </h2>
          <button
            onClick={onClose}
            className="btn-liquid-glass-close w-12 h-12 flex-shrink-0 flex items-center justify-center"
          >
            <span className="relative z-10">
              <X className="h-5 w-5 text-white" strokeWidth={2.5} />
            </span>
          </button>
        </div>

        {/* Content */}
        <div
          className="overflow-y-auto p-6 space-y-6 text-white"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#ffffff transparent",
          }}
        >
          <style>{`
            .overflow-y-auto::-webkit-scrollbar {
              width: 8px;
            }
            .overflow-y-auto::-webkit-scrollbar-track {
              background: transparent;
            }
            .overflow-y-auto::-webkit-scrollbar-thumb {
              background: #ffffff;
              border-radius: 4px;
            }
          `}</style>
          {/* 1. Introduction */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              1. Introduction
            </h3>
            <p className="leading-relaxed">
              Welcome to VietTune Archive. These Terms and Conditions govern
              your use of our platform and services. By accessing or using
              VietTune Archive, you agree to be bound by these terms. If you
              disagree with any part of these terms, you may not access our
              service.
            </p>
          </section>

          {/* 2. Platform purpose */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              2. Platform purpose
            </h3>
            <p className="leading-relaxed mb-2">
              VietTune Archive is a specialized crowdsourced documentation
              platform dedicated to preserving and documenting the musical
              traditions of Vietnam's 54 ethnic minorities. Our platform
              provides:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Comprehensive recording archives</li>
              <li>Intelligent search capabilities</li>
              <li>Collaborative curation tools</li>
              <li>
                Documentation of traditional instruments and master musicians
              </li>
            </ul>
          </section>

          {/* 3. User accounts */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              3. User accounts
            </h3>
            <p className="leading-relaxed mb-2">
              To contribute content to VietTune Archive, you must create an
              account. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your password and account</li>
              <li>
                Promptly update your account information to keep it accurate
              </li>
              <li>
                Accept responsibility for all activities under your account
              </li>
              <li>Not share your account with others</li>
            </ul>
          </section>

          {/* 4. Content guidelines */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              4. Content guidelines
            </h3>
            <p className="leading-relaxed mb-2">
              When uploading content to VietTune Archive, you must ensure:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>You own or have the right to share the content you upload</li>
              <li>
                Content is authentic and relevant to Vietnamese ethnic minority
                musical traditions
              </li>
              <li>
                Content does not infringe on intellectual property rights of
                others
              </li>
              <li>
                Metadata provided is accurate and complete to the best of your
                knowledge
              </li>
              <li>
                Content does not contain harmful, offensive, or illegal material
              </li>
            </ul>
          </section>

          {/* 5. Intellectual property */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              5. Intellectual property
            </h3>
            <p className="leading-relaxed mb-2">
              By uploading content to VietTune Archive, you grant us a
              non-exclusive, worldwide, royalty-free license to:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Store, display, and distribute your content</li>
              <li>
                Make content available for research and educational purposes
              </li>
              <li>
                Create derivative works for preservation and accessibility
              </li>
            </ul>
            <p className="leading-relaxed mt-2">
              You retain all ownership rights to your content. VietTune Archive
              respects the cultural heritage and traditional knowledge of ethnic
              communities.
            </p>
          </section>

          {/* 6. Verification process */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              6. Verification process
            </h3>
            <p className="leading-relaxed">
              All uploaded content goes through a verification process by our
              community of experts and administrators. We reserve the right to
              approve, reject, or request modifications to submitted content to
              ensure accuracy and quality standards. Verified content will be
              marked as such in our archive.
            </p>
          </section>

          {/* 7. Privacy and Data protection */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              7. Privacy and Data protection
            </h3>
            <p className="leading-relaxed">
              We are committed to protecting your privacy. Your personal
              information will be handled in accordance with our Privacy Policy.
              We collect and use data solely for the purpose of operating and
              improving VietTune Archive. We do not sell or share your personal
              information with third parties without your consent.
            </p>
          </section>

          {/* 8. Community conduct */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              8. Community conduct
            </h3>
            <p className="leading-relaxed mb-2">Users are expected to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Treat other users with respect and courtesy</li>
              <li>Contribute constructively to discussions and curation</li>
              <li>Respect cultural sensitivities and traditional knowledge</li>
              <li>
                Report inappropriate content or behavior to administrators
              </li>
              <li>
                Not engage in harassment, discrimination, or abusive behavior
              </li>
            </ul>
          </section>

          {/* 9. Prohibited activities */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              9. Prohibited activities
            </h3>
            <p className="leading-relaxed mb-2">You may not:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                Attempt to gain unauthorized access to our systems or other user
                accounts
              </li>
              <li>Upload malicious code or attempt to disrupt the platform</li>
              <li>
                Scrape or systematically download content without permission
              </li>
              <li>
                Use the platform for commercial purposes without authorization
              </li>
              <li>Misrepresent your identity or affiliation</li>
              <li>Submit false or misleading information</li>
            </ul>
          </section>

          {/* 10. Content moderation */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              10. Content moderation
            </h3>
            <p className="leading-relaxed">
              VietTune Archive reserves the right to remove, modify, or reject
              any content that violates these Terms and Conditions or is deemed
              inappropriate. We may suspend or terminate accounts that
              repeatedly violate our policies. Users will be notified of
              moderation actions when possible.
            </p>
          </section>

          {/* 11. Attribution and Citation */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              11. Attribution and Citation
            </h3>
            <p className="leading-relaxed">
              When using content from VietTune Archive for research or
              educational purposes, proper attribution must be given to:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>The original contributor/uploader</li>
              <li>The performer or tradition bearer (if applicable)</li>
              <li>The ethnic community associated with the tradition</li>
              <li>VietTune Archive as the platform</li>
            </ul>
          </section>

          {/* 12. Disclaimer of warranties */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              12. Disclaimer of warranties
            </h3>
            <p className="leading-relaxed">
              VietTune Archive is provided "as is" without warranties of any
              kind, either express or implied. We do not guarantee that the
              platform will be uninterrupted, secure, or error-free. While we
              strive for accuracy, we cannot guarantee the completeness or
              accuracy of all content.
            </p>
          </section>

          {/* 13. Limitation of liability */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              13. Limitation of liability
            </h3>
            <p className="leading-relaxed">
              VietTune Archive and its operators shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages
              resulting from your use of or inability to use the platform. This
              includes but is not limited to damages for loss of data, profits,
              or other intangible losses.
            </p>
          </section>

          {/* 14. Changes to Terms */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              14. Changes to Terms
            </h3>
            <p className="leading-relaxed">
              We reserve the right to modify these Terms and Conditions at any
              time. We will notify users of significant changes via email or
              prominent notice on the platform. Continued use of VietTune
              Archive after changes constitutes acceptance of the modified
              terms.
            </p>
          </section>

          {/* 15. Termination */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              15. Termination
            </h3>
            <p className="leading-relaxed">
              You may terminate your account at any time by contacting us. We
              may terminate or suspend your account immediately, without prior
              notice, if you breach these Terms and Conditions. Upon
              termination, your right to use the platform will cease
              immediately, but content you've contributed may remain in the
              archive.
            </p>
          </section>

          {/* 16. Governing law */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              16. Governing law
            </h3>
            <p className="leading-relaxed">
              These Terms and Conditions shall be governed by and construed in
              accordance with the laws of Vietnam. Any disputes arising from
              these terms shall be subject to the exclusive jurisdiction of the
              courts of Vietnam.
            </p>
          </section>

          {/* 17. Contact information */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              17. Contact information
            </h3>
            <p className="leading-relaxed">
              If you have questions about these Terms and Conditions, please
              contact us at:
            </p>
            <p className="leading-relaxed mt-2">
              <strong>Email:</strong> contact@viettune.com
            </p>
            <p className="leading-relaxed">
              <strong>Platform:</strong> VietTune Archive
            </p>
          </section>

          {/* Last Updated */}
          <section className="pt-6 border-t border-white/30">
            <p className="text-sm text-white/80 italic">
              Last updated: January 5, 2026
            </p>
            <p className="text-sm text-white/80 mt-2">
              By using VietTune Archive, you acknowledge that you have read,
              understood, and agree to be bound by these Terms and Conditions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
