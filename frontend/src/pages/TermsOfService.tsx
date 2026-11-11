import { Link } from "react-router-dom";
import { LogoIcon } from "../components/icons/LogoIcon";
import { ThemeToggle } from "../components/ui/ThemeToggle";

export function TermsOfService() {
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
                            Terms of Service
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
                            Welcome to Brainscratch (&quot;Brainscratch,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). Brainscratch is a content-sharing platform designed to help users save, organize, preserve, and share links to online content, including YouTube videos, X posts, text, and other supported material.
                        </p>
                        <p>
                            By accessing or using Brainscratch, you agree to these Terms of Service. If you do not agree to these terms, please discontinue using the platform.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            2. Eligibility and Accounts
                        </h2>
                        <p>
                            You must be legally eligible to use Brainscratch under the laws applicable to you.
                        </p>
                        <p>
                            You are responsible for providing accurate account information, maintaining the confidentiality of your login credentials, and protecting access to your account.
                        </p>
                        <p>
                            You are responsible for activities conducted through your account, except where applicable law provides otherwise. You must promptly notify us if you suspect unauthorized access or misuse of your account.
                        </p>
                        <p>
                            We reserve the right to restrict or suspend accounts that violate these terms or threaten the security and integrity of the platform.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            3. Permitted Use
                        </h2>
                        <p>
                            You may use Brainscratch to save, organize, reference, and share supported content for lawful purposes.
                        </p>
                        <p>You agree not to:</p>
                        <ul className="list-disc list-inside space-y-1.5 pl-2">
                            <li>Use the platform for unlawful activities, fraud, harassment, or abuse.</li>
                            <li>Upload or share content that infringes copyright, trademarks, privacy rights, or other legal rights.</li>
                            <li>Distribute malware, malicious links, spam, or deceptive material.</li>
                            <li>Attempt unauthorized access to accounts, databases, systems, or infrastructure.</li>
                            <li>Circumvent security controls, abuse platform features, or interfere with service availability.</li>
                            <li>Use automated methods to scrape, extract, or misuse platform data without authorization.</li>
                            <li>Misrepresent your identity or impersonate another person or organization.</li>
                        </ul>
                        <p>
                            We may investigate suspected violations and take reasonable action to protect the platform and its users.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            4. User-Submitted Content
                        </h2>
                        <p>
                            You retain ownership of content you create and own, subject to the rights of third parties.
                        </p>
                        <p>
                            By submitting or sharing content on Brainscratch, you grant us a limited, non-exclusive, worldwide, royalty-free license to host, store, reproduce, display, and process that content as reasonably necessary to operate, maintain, secure, and provide the platform&apos;s features.
                        </p>
                        <p>
                            This license lasts only as long as reasonably necessary for those purposes, subject to legitimate backups, legal obligations, and applicable law.
                        </p>
                        <p>
                            You confirm that you have the rights and permissions necessary to submit and share the content you provide.
                        </p>
                        <p>
                            You are responsible for the legality, accuracy, and appropriateness of your submissions. Saving a link to third-party content does not give you ownership of that content or permission to redistribute it beyond the rights granted by its owner.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            5. Third-Party Content and Services
                        </h2>
                        <p>
                            Brainscratch may contain links to or integrations with third-party services, including YouTube and X.
                        </p>
                        <p>
                            These services operate independently and are governed by their own terms, policies, and technical restrictions. We do not control the availability, accuracy, legality, or continued existence of third-party content.
                        </p>
                        <p>
                            Content may be removed, restricted, modified, or made unavailable by its original publisher or platform without notice to us.
                        </p>
                        <p>
                            You are responsible for complying with applicable third-party terms when accessing or interacting with external services. Brainscratch does not endorse every opinion, statement, or item of content linked by users.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            6. Intellectual Property and Copyright
                        </h2>
                        <p>
                            The Brainscratch name, branding, original interface, software, and other platform materials are owned by us or used with appropriate authorization, unless otherwise stated.
                        </p>
                        <p>
                            You may not copy, reproduce, distribute, modify, or commercially exploit our protected materials without permission, except as permitted by applicable law.
                        </p>
                        <p>
                            If you believe content on Brainscratch infringes your intellectual property rights, contact us with sufficient information to identify the material and explain your claim. We may remove or restrict access to allegedly infringing material and take appropriate action in accordance with applicable law.
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Submitting a complaint does not guarantee removal, and we may request additional information to assess it.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            7. Privacy and Data
                        </h2>
                        <p>
                            Your use of Brainscratch is also subject to our Privacy Policy, which explains how we collect, use, store, and disclose information.
                        </p>
                        <p>
                            You are responsible for reviewing the Privacy Policy and understanding the visibility settings associated with content you save or share.
                        </p>
                        <p>
                            Do not submit confidential or sensitive information unless you understand the associated risks and have an appropriate basis to do so.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            8. Availability and Changes to the Service
                        </h2>
                        <p>
                            We aim to keep Brainscratch functional and accessible, but we do not guarantee uninterrupted availability, error-free operation, or compatibility with every device or external service.
                        </p>
                        <p>
                            We may update, modify, suspend, or discontinue features when reasonably necessary for maintenance, security, operational, or business reasons, subject to applicable law.
                        </p>
                        <p>
                            We may also introduce new features or modify existing functionality as the platform develops.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            9. Disclaimer and Limitation of Liability
                        </h2>
                        <p>
                            Brainscratch is provided on an &quot;as available&quot; basis, to the extent permitted by applicable law. We do not guarantee that all saved content will remain accessible, that external links will continue to work, or that the platform will always be free from errors, interruptions, or security risks.
                        </p>
                        <p>
                            You use the platform at your own discretion and are responsible for your decisions, the content you submit or share, and your interactions with other users and third-party services. We encourage you to exercise reasonable judgment and take appropriate precautions when using the service.
                        </p>
                        <p>
                            To the extent permitted by applicable law, Brainscratch and its operators shall not be liable for indirect, incidental, special, or consequential losses arising from your use of the platform, third-party actions, user-submitted content, service interruptions, loss of data, or circumstances beyond our reasonable control. Nothing in these terms excludes or limits liability, remedies, or legal responsibilities that cannot lawfully be excluded or limited, and nothing prevents a competent authority from exercising its powers under applicable law.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            10. Indemnification
                        </h2>
                        <p>
                            To the extent permitted by applicable law, you agree to be responsible for losses, claims, and reasonable costs arising from your unlawful use of Brainscratch, your violation of these terms, or your infringement of another party&apos;s rights.
                        </p>
                        <p>
                            This provision does not require you to indemnify us for losses caused by our own conduct where such an obligation would be unlawful or unenforceable.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            11. Suspension and Termination
                        </h2>
                        <p>
                            You may stop using Brainscratch at any time.
                        </p>
                        <p>
                            We may suspend, restrict, or terminate access to an account where reasonably necessary because of violations of these terms, security concerns, unlawful activity, abuse, or other legitimate operational reasons, subject to applicable law.
                        </p>
                        <p>
                            Where appropriate, we may provide notice or an opportunity to address the issue. Termination may result in loss of access to saved content or account features.
                        </p>
                        <p>
                            Provisions that by their nature should continue after termination, including applicable intellectual property, liability, and dispute provisions, will survive to the extent permitted by law.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            12. Changes to These Terms
                        </h2>
                        <p>
                            We may revise these Terms of Service as the platform develops or legal requirements change.
                        </p>
                        <p>
                            Material changes will be communicated through reasonable means where required by law. The updated terms will include a revised effective date.
                        </p>
                        <p>
                            Your continued use of Brainscratch after revised terms become effective will constitute acceptance only to the extent recognized under applicable law. Where affirmative consent is legally required, we will seek it.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            13. Governing Law and Disputes
                        </h2>
                        <p>
                            These terms are subject to the laws applicable to the operation of Brainscratch and the rights of its users.
                        </p>
                        <p>
                            Any dispute will be handled by the courts or other competent forums having jurisdiction under applicable law. Nothing in these terms removes any mandatory consumer protections or statutory rights available to you.
                        </p>
                    </section>

                    <section className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            14. Contact Information
                        </h2>
                        <p>For questions, complaints, copyright concerns, or other matters relating to these terms, contact:</p>
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 text-sm space-y-1">
                            <p><strong>Platform:</strong> Brainscratch</p>
                            <p><strong>Support Email:</strong> supportbrainscratch@gmail.com</p>
                            <p><strong>Website:</strong> https://brainscratch.vercel.app</p>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            We will review inquiries and respond as appropriate under applicable law.
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

