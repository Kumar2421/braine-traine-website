/**
 * Help Center / FAQ Page
 * Provides comprehensive help documentation and FAQ
 */

import { useState } from 'react'
import { useToast } from '../utils/toast'
import './HelpCenterPage.css'

const faqCategories = [
    {
        id: 'getting-started',
        name: 'Getting Started',
        icon: '🚀',
    },
    {
        id: 'subscription',
        name: 'Subscription & Billing',
        icon: '💳',
    },
    {
        id: 'features',
        name: 'Features & Usage',
        icon: '⚡',
    },
    {
        id: 'troubleshooting',
        name: 'Troubleshooting',
        icon: '🔧',
    },
    {
        id: 'account',
        name: 'Account & Security',
        icon: '🔐',
    },
]

const faqs = {
    'getting-started': [
        {
            question: 'What is ML FORGE?',
            answer: 'ML FORGE is a desktop-first Vision AI IDE designed for local execution and deterministic workflows. It provides an end-to-end pipeline from dataset management to training, evaluation, and export — without requiring a cloud runtime.',
        },
        {
            question: 'How do I get started?',
            answer: '1. Download and install the ML FORGE desktop app\n2. Create a workspace and your first project\n3. Import a dataset\n4. Annotate + review\n5. Lock inputs\n6. Run training, evaluate, and export\n\nSee the documentation for step-by-step guides.',
        },
        {
            question: 'What are the system requirements?',
            answer: 'ML FORGE requires:\n- Windows 10/11, macOS 10.15+, or Linux\n- 8GB RAM minimum (16GB recommended)\n- 10GB free disk space\n- GPU recommended for training (CUDA-compatible)',
        },
        {
            question: 'Is there a free plan?',
            answer: 'Yes. We offer a free plan with core workflow features so you can validate a local, reproducible setup. You can upgrade to Pro plans to unlock advanced dataset tools, deeper training controls, export formats, and priority support.',
        },
    ],
    'subscription': [
        {
            question: 'How does billing work?',
            answer: 'Subscriptions are billed monthly or yearly. You can choose your billing interval when subscribing. All payments are processed securely through Razorpay.',
        },
        {
            question: 'Can I cancel my subscription?',
            answer: 'Yes, you can cancel your subscription at any time from your Subscription page. Your access will continue until the end of your current billing period.',
        },
        {
            question: 'What happens if I upgrade or downgrade?',
            answer: 'Upgrades take effect immediately with prorated billing. Downgrades take effect at the end of your current billing period. You\'ll see the changes reflected in your account immediately.',
        },
        {
            question: 'Do you offer refunds?',
            answer: 'We offer a 14-day money-back guarantee for new subscriptions. Contact support for refund requests.',
        },
        {
            question: 'How do I update my payment method?',
            answer: 'Go to your Subscription page and click "Manage Payment Methods". You can add, update, or remove payment methods there.',
        },
    ],
    'features': [
        {
            question: 'What features are included in each plan?',
            answer: 'Free: Core dataset + training workflow\nData Pro: Advanced dataset preparation and locking\nTrain Pro: Full training controls, tuning, and logs\nDeploy Pro: Production exports, benchmarking, and deployment formats\nEnterprise: Custom features and support',
        },
        {
            question: 'How do I use GPU resources?',
            answer: 'Training runs on your own hardware (local workstation or on-prem machines). If you have a CUDA-capable GPU, ML FORGE can use it for faster training. Usage depends on your machine and workflow, not on cloud GPU allocation.',
        },
        {
            question: 'Can I work offline?',
            answer: 'Yes. The core workflow is designed to run locally and can operate offline. An internet connection may be needed for downloading installers/updates and for account or subscription metadata, depending on your setup.',
        },
        {
            question: 'How do I export my models?',
            answer: 'Go to your project, select the trained model, and click Export. You can export in various formats (ONNX, TensorFlow, PyTorch, etc.) depending on your plan.',
        },
    ],
    'troubleshooting': [
        {
            question: 'I can\'t log in. What should I do?',
            answer: '1. Check your email and password\n2. Try resetting your password\n3. Clear your browser cache\n4. Contact support if the issue persists',
        },
        {
            question: 'My training job failed. Why?',
            answer: 'Common causes:\n- Insufficient GPU memory\n- Invalid dataset format\n- Network connectivity issues\n\nCheck the error logs in your project for detailed information.',
        },
        {
            question: 'The IDE is running slowly. How can I fix it?',
            answer: '1. Close unnecessary projects\n2. Clear cache and temporary files\n3. Check your system resources\n4. Update to the latest version\n5. Contact support for optimization tips',
        },
        {
            question: 'I lost my data. Can I recover it?',
            answer: 'Projects, datasets, runs, and exports are stored in your local workspace. If files were deleted, recovery depends on your local backups and filesystem recovery tools. Support can help you identify workspace locations and best practices for backup.',
        },
    ],
    'account': [
        {
            question: 'How do I change my password?',
            answer: 'Go to your Account Settings and click "Change Password". You\'ll receive an email with instructions.',
        },
        {
            question: 'How do I update my email address?',
            answer: 'Contact support to update your email address. This requires verification for security purposes.',
        },
        {
            question: 'Is my data secure?',
            answer: 'Yes! We use industry-standard encryption, secure authentication, and regular security audits. Your data is encrypted both in transit and at rest.',
        },
        {
            question: 'Can I delete my account?',
            answer: 'Yes, you can delete your website account. This affects account/subscription metadata. Local workspaces and project files on your machine are not automatically deleted.',
        },
        {
            question: 'How do I enable two-factor authentication?',
            answer: 'Two-factor authentication is available for Pro and Enterprise plans. Go to Security Settings to enable it.',
        },
    ],
}

export default function HelpCenterPage({ navigate }) {
    const toast = useToast()
    const [selectedCategory, setSelectedCategory] = useState('getting-started')
    const [openQuestion, setOpenQuestion] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')

    const filteredFaqs = faqs[selectedCategory]?.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

    return (
        <div className="help-center">
            <div className="helpHero">
                <div className="container helpHero__inner">
                    <h1 className="helpHero__title">Help Center</h1>
                    <p className="helpHero__subtitle">
                        Find answers to common questions and learn how to get the most out of ML FORGE
                    </p>

                    {/* Search */}
                    <div className="helpSearch">
                        <input
                            type="text"
                            placeholder="Search for help..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="helpSearch__input"
                        />
                        <span className="helpSearch__icon">🔍</span>
                    </div>
                </div>
            </div>

            <section className="helpSection">
                <div className="container">
                    <div className="helpLayout">
                        {/* Categories Sidebar */}
                        <aside className="helpSidebar">
                            <h2 className="helpSidebar__title">Categories</h2>
                            <nav className="helpNav">
                                {faqCategories.map((category) => (
                                    <button
                                        key={category.id}
                                        className={`helpNav__item ${selectedCategory === category.id ? 'helpNav__item--active' : ''}`}
                                        onClick={() => {
                                            setSelectedCategory(category.id)
                                            setOpenQuestion(null)
                                            setSearchQuery('')
                                        }}
                                    >
                                        <span className="helpNav__icon">{category.icon}</span>
                                        <span className="helpNav__text">{category.name}</span>
                                    </button>
                                ))}
                            </nav>
                        </aside>

                        {/* FAQ Content */}
                        <main className="helpContent">
                            <h2 className="helpContent__title">
                                {faqCategories.find(c => c.id === selectedCategory)?.name}
                            </h2>

                            {filteredFaqs.length === 0 ? (
                                <div className="helpEmpty">
                                    <p>No results found for "{searchQuery}"</p>
                                    <button
                                        className="button button--outline"
                                        onClick={() => setSearchQuery('')}
                                    >
                                        Clear Search
                                    </button>
                                </div>
                            ) : (
                                <div className="helpFaqList">
                                    {filteredFaqs.map((faq, index) => (
                                        <div key={index} className="helpFaq">
                                            <button
                                                className="helpFaq__question"
                                                onClick={() => setOpenQuestion(openQuestion === index ? null : index)}
                                            >
                                                <span>{faq.question}</span>
                                                <span className="helpFaq__icon">
                                                    {openQuestion === index ? '−' : '+'}
                                                </span>
                                            </button>
                                            {openQuestion === index && (
                                                <div className="helpFaq__answer">
                                                    {faq.answer.split('\n').map((line, i) => (
                                                        <p key={i}>{line}</p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Contact Support */}
                            <div className="helpSupport">
                                <h3 className="helpSupport__title">Still need help?</h3>
                                <p className="helpSupport__text">
                                    Can't find what you're looking for? Our support team is here to help.
                                </p>
                                <div className="helpSupport__actions">
                                    <a
                                        href="mailto:support@mlforge.com"
                                        className="button button--primary"
                                    >
                                        Contact Support
                                    </a>
                                    <a
                                        href="/docs"
                                        className="button button--outline"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            navigate('/docs')
                                        }}
                                    >
                                        View Documentation
                                    </a>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </section>
        </div>
    )
}

