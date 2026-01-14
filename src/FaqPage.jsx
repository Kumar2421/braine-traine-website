import { CreditCardRefresh, File05, Heart, Mail01, SlashCircle01, SwitchHorizontal01 } from "@untitledui/icons";
import { Avatar } from "@/components/base/avatar/avatar";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";

const faqs = [
    {
        question: "Does my data leave my machine?",
        answer: "No by default. ML FORGE is local-first: datasets and training run locally/on-prem. The website acts as a control plane and distribution hub—not your training runtime.",
        icon: Heart,
    },
    {
        question: "Do you support offline workflows?",
        answer: "Yes. You can build datasets, train, evaluate, and export locally. Some optional features (updates, license verification, download hub) require internet.",
        icon: SwitchHorizontal01,
    },
    {
        question: "What makes ML FORGE reproducible?",
        answer: "Runs are config-driven with explicit inputs. Exports are tied to run metadata and dataset snapshots so results can be replayed and audited.",
        icon: SlashCircle01,
    },
    {
        question: "What models and workflows are supported?",
        answer: "Today we focus on practical Vision AI workflows (e.g., YOLO detection) end-to-end: datasets → annotation → training → evaluation → export. More pipelines expand over time.",
        icon: File05,
    },
    {
        question: "How do plans work (Free vs Pro tiers)?",
        answer: "Start free to validate your local workflow. Upgrade when you need advanced dataset tooling, training control, collaboration, or production export formats (ONNX/TensorRT/CoreML/etc.).",
        icon: CreditCardRefresh,
    },
    {
        question: "What GPU do I need?",
        answer: "For training, an NVIDIA GPU is recommended. CPU-only works (slower). Export requirements depend on target formats and your deployment stack.",
        icon: Mail01,
    },
];

export const FAQSimple01 = ({ navigate }) => {
    return (
        <div className="bg-primary" style={{ backgroundColor: 'rgba(83,56,158,1)' }}>
            <section className="aboutHero" style={{ backgroundColor: 'rgba(83,56,158,1)', borderBottomColor: 'rgba(255, 255, 255, 0.12)' }}>
                <div className="container aboutHero__inner">
                    <p className="aboutHero__kicker" style={{ color: 'rgba(255, 255, 255, 0.82)' }}>
                        FAQ
                    </p>
                    <h1 className="aboutHero__title" style={{ color: 'rgba(6, 162, 71, 0.98)' }}>
                        Frequently asked questions
                    </h1>
                    <p className="aboutHero__subtitle" style={{ color: 'rgba(255, 255, 255, 0.82)' }}>
                        Everything you need to know about ML FORGE: local-first workflows, reproducibility, and exports.
                    </p>
                </div>
            </section>

            <section className="bg-primary pb-16 md:pb-24">
                <div className="mx-auto max-w-container px-4 md:px-8">
                    <div className="mt-12 md:mt-16">
                        <dl className="grid w-full grid-cols-1 justify-items-center gap-x-8 gap-y-10 sm:grid-cols-2 md:gap-y-16 lg:grid-cols-3">
                            {faqs.map((item) => (
                                <div key={item.question}>
                                    <div className="flex max-w-sm flex-col items-center text-center">
                                        <FeaturedIcon color="gray" theme="modern" className="md:hidden" size="md" icon={item.icon} />
                                        <FeaturedIcon color="gray" theme="modern" className="hidden md:flex" size="lg" icon={item.icon} />

                                        <dt className="mt-4 text-lg font-semibold text-green-400">{item.question}</dt>
                                        <dd className="mt-1 text-md text-indigo-100">{item.answer}</dd>
                                    </div>
                                </div>
                            ))}
                        </dl>
                    </div>

                    <div
                        className="mt-12 flex flex-col items-center gap-6 rounded-2xl bg-[#6941c6] px-6 py-8 text-center ring-1 ring-white/10 md:mt-16 md:gap-8 md:px-8 md:py-10"
                    >
                        <div className="flex items-end -space-x-4">
                            <Avatar
                                src="https://www.untitledui.com/images/avatars/marco-kelly?fm=webp&q=80"
                                alt="Marco Kelly"
                                size="lg"
                                className="ring-[1.5px] ring-fg-white"
                            />
                            <Avatar
                                src="https://www.untitledui.com/images/avatars/amelie-laurent?fm=webp&q=80"
                                alt="Amelie Laurent"
                                size="xl"
                                className="z-10 ring-[1.5px] ring-fg-white"
                            />
                            <Avatar
                                src="https://www.untitledui.com/images/avatars/jaya-willis?fm=webp&q=80"
                                alt="Jaya Willis"
                                size="lg"
                                className="ring-[1.5px] ring-fg-white"
                            />
                        </div>
                        <div>
                            <h4 className="text-xl font-semibold text-white">Still have questions?</h4>
                            <p className="mt-2 text-md text-indigo-100 md:text-lg">
                                Can’t find the answer you’re looking for? Tell us your workflow and we’ll recommend the right plan and export path.
                            </p>
                        </div>
                        <Button
                            size="xl"
                            className="bg-white text-indigo-900 hover:bg-indigo-50"
                            onClick={() => {
                                navigate?.('/request-access?type=pro')
                            }}
                        >
                            Get in touch
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default function FaqPage({ navigate }) {
    return <FAQSimple01 navigate={navigate} />
}
