import { Link } from "react-router-dom";
import { LogoIcon } from "../components/icons/LogoIcon";
import { ThemeToggle } from "../components/ui/ThemeToggle";

export function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
                        <div className="text-purple-600 dark:text-purple-400">
                            <LogoIcon size="md" />
                        </div>
                        <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                            Brainscratch
                        </span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <Link
                            to="/"
                            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 transition-colors"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </header>

            {/* Document Body */}
            <main className="max-w-3xl mx-auto px-6 py-12 md:py-16">
                <article className="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
                            Privacy Policy
                        </h1>
                        <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                            Last Updated: November 11, 2026
                        </p>
                    </div>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            1. Introduction
                        </h2>
                        <p>
                            Welcome to Brainscratch. Brainscratch is a content-sharing platform that allows users to save, organize, preserve, and share links to content from platforms such as YouTube, X and other supported content.
                        </p>
                        <p>
                            This Privacy Policy explains what information we collect, how we use it, when it may be shared, and the choices available to you when using Brainscratch.
                        </p>
                        <p>
                            By using Brainscratch, you acknowledge that you have read this policy.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            2. Information We Collect
                        </h2>
                        <p>Depending on how you use Brainscratch, we may collect the following information:</p>
                        <div className="space-y-2 pl-4 border-l-2 border-purple-500/40">
                            <p className="font-semibold text-slate-900 dark:text-white">Account Information</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Email address and username.</li>
                                <li>Password credentials stored securely.</li>
                                <li>Profile information you choose to provide.</li>
                            </ul>
                        </div>
                        <div className="space-y-2 pl-4 border-l-2 border-purple-500/40">
                            <p className="font-semibold text-slate-900 dark:text-white">Content You Submit</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>YouTube, X, and other supported content URLs.</li>
                                <li>Text, titles, descriptions, tags, notes, and other information you submit.</li>
                                <li>Content visibility settings and information associated with your saved collections.</li>
                            </ul>
                        </div>
                        <div className="space-y-2 pl-4 border-l-2 border-purple-500/40">
                            <p className="font-semibold text-slate-900 dark:text-white">Technical Information</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>IP address, browser type, device information, access timestamps, and security logs, where collected by our infrastructure.</li>
                                <li>Tokens or similar technologies necessary for authentication, security, or other disclosed purposes, where used.</li>
                            </ul>
                        </div>
                        <p>
                            We aim to collect only the information reasonably necessary to operate and improve the platform.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            3. How We Use Your Information
                        </h2>
                        <p>We may use collected information to:</p>
                        <ul className="list-disc list-inside space-y-1.5 pl-2">
                            <li>Create and manage user accounts.</li>
                            <li>Authenticate users and protect accounts.</li>
                            <li>Save, organize, retrieve, and share content.</li>
                            <li>Display public profiles and shared content according to your settings.</li>
                            <li>Prevent spam, abuse, unauthorized access, and fraudulent activity.</li>
                            <li>Diagnose technical issues and maintain platform reliability.</li>
                            <li>Respond to support requests and comply with applicable legal obligations.</li>
                        </ul>
                        <p>
                            We do not sell your personal information as part of our intended service model.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            4. Public and Private Content
                        </h2>
                        <p>Brainscratch may allow users to share saved content with other people.</p>
                        <ul className="list-disc list-inside space-y-1.5 pl-2">
                            <li><strong>Public content:</strong> Content marked public may be accessible to other users and potentially discoverable through search engines.</li>
                            <li><strong>Private content:</strong> Content marked private should be accessible only to you and authorized systems, subject to the platform&apos;s technical implementation.</li>
                            <li><strong>Shared links:</strong> Anyone with access to a shared link may be able to view the associated content, depending on the sharing settings.</li>
                        </ul>
                        <p>
                            Do not submit sensitive personal information unless it is necessary and you understand the associated risks.
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Changing content visibility may not remove copies, screenshots, cached pages, or information already accessed by other people.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            5. Third-Party Platforms and Links
                        </h2>
                        <p>
                            Brainscratch may store links to or display content from third-party platforms, including YouTube and X.
                        </p>
                        <p>
                            We do not own or control these third-party platforms. When you follow an external link or interact with an embedded post or video, the relevant provider may collect information under its own privacy policy.
                        </p>
                        <p>
                            Saving a link does not necessarily mean that Brainscratch downloads or stores the original media. Our handling of external content depends on the features we implement.
                        </p>
                        <p>
                            Please review the privacy policies of the relevant third-party services.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            6. How We Share Information
                        </h2>
                        <p>We may disclose information in limited circumstances:</p>
                        <ul className="list-disc list-inside space-y-1.5 pl-2">
                            <li><strong>With other users:</strong> When you publish or share content using platform features.</li>
                            <li><strong>With service providers:</strong> Hosting, database, authentication, email, security, and infrastructure providers that help operate Brainscratch.</li>
                            <li><strong>For security:</strong> Where reasonably necessary to investigate abuse, protect users, or safeguard the platform.</li>
                        </ul>
                        <p>
                            We do not authorize service providers to use personal information for unrelated purposes beyond their permitted role and applicable agreements.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            7. Data Storage and Security
                        </h2>
                        <p>
                            We use reasonable technical and organizational measures intended to protect information against unauthorized access, disclosure, alteration, or destruction.
                        </p>
                        <p>
                            We will address security incidents in accordance with applicable legal requirements. Brainscratch is provided for users to save, organize, and share content at their own discretion. Users are responsible for their decisions, the content they submit or share, and how they interact with third-party platforms and other users. To the extent permitted by applicable law, Brainscratch and its operators shall not be liable for indirect, incidental, consequential, or other losses arising from the use of the platform, reliance on user-submitted content, third-party actions, unauthorized access, service interruptions, or circumstances beyond our reasonable control. Users are encouraged to exercise their own judgment and take appropriate precautions when using the service. Nothing in this policy excludes or limits any liability that cannot lawfully be excluded or limited under applicable law.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            8. Data Retention and Account Deletion
                        </h2>
                        <p>
                            We retain information for as long as reasonably necessary to provide the service, maintain security, resolve disputes, and meet applicable legal obligations.
                        </p>
                        <p>
                            You may permanently delete your account and all associated personal information, saved content, and shared links at any time directly through the &quot;Delete Account&quot; feature in your Dashboard or by contacting us.
                        </p>
                        <p>
                            When a deletion request is processed, we immediately delete your user profile, all saved bookmarks, personal notes, and public share links, and invalidate any active authentication tokens.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            9. Your Privacy Rights
                        </h2>
                        <p>Subject to applicable law, you may have the right to:</p>
                        <ul className="list-disc list-inside space-y-1.5 pl-2">
                            <li>Request information about the personal data we process.</li>
                            <li>Request correction or updating of inaccurate information.</li>
                            <li>Request deletion of eligible personal information.</li>
                            <li>Withdraw consent where processing relies on consent.</li>
                            <li>Raise a privacy concern or complaint.</li>
                        </ul>
                        <p>
                            To exercise these rights, contact us using the details below. We may need to verify your identity before fulfilling a request.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            10. Cookies and Similar Technologies
                        </h2>
                        <p>
                            We may use essential tokens, local storage, or cookies necessary to maintain sessions, authenticate users, protect accounts, and support platform functionality.
                        </p>
                        <p>
                            If we introduce analytics, advertising, or other non-essential tracking technologies, we will disclose their relevant purposes and provide any choices or consent mechanisms required by applicable law.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            11. Children&apos;s Privacy
                        </h2>
                        <p>
                            Brainscratch is not intended for children who are prohibited from using the service under applicable law. We do not knowingly collect personal information from children in violation of applicable legal requirements.
                        </p>
                        <p>
                            If you believe a child has provided personal information unlawfully, please contact us so that we can investigate and take appropriate action.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            12. Changes to This Privacy Policy
                        </h2>
                        <p>
                            We may update this Privacy Policy as Brainscratch evolves or legal requirements change.
                        </p>
                        <p>
                            When we make material changes, we will take reasonable steps to notify users where required. The updated policy will display its revised effective date.
                        </p>
                    </section>

                    <section className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            13. Contact Us
                        </h2>
                        <p>For privacy questions, data requests, or complaints, contact:</p>
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 text-sm space-y-1">
                            <p><strong>Platform:</strong> Brainscratch</p>
                            <p><strong>Privacy Contact:</strong> supportbrainscratch@gmail.com </p>
                            <p><strong>Website:</strong> https://brainscratch.vercel.app/</p>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            We will review and respond to privacy requests in accordance with applicable law.
                        </p>
                    </section>
                </article>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 dark:border-slate-800 py-8 px-6 text-center text-xs text-slate-500 dark:text-slate-400">
                <p>© {new Date().getFullYear()} Brainscratch. All rights reserved.</p>
            </footer>
        </div>
    );
}
