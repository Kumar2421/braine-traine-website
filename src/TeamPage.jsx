import { Avatar } from "@/components/base/avatar/avatar";
import { Dribbble, LinkedIn, X } from "@/components/foundations/social-icons";

const teamMembers = [
    {
        name: "Amélie Laurent",
        title: "Founder & Product",
        summary: "Local-first product design. Deterministic workflows. Zero cloud lock-in by default.",
        avatarUrl: "https://www.untitledui.com/images/avatars/amelie-laurent?fm=webp&q=80",
        socials: [
            {
                icon: X,
                href: "https://x.com/",
            },
            {
                icon: LinkedIn,
                href: "https://www.linkedin.com/",
            },
            {
                icon: Dribbble,
                href: "https://dribbble.com/",
            },
        ],
    },
    {
        name: "Nikolas Gibbons",
        title: "Engineering",
        summary: "Builds the desktop-first IDE core: dataset lineage, run reproducibility, and export pipelines.",
        avatarUrl: "https://www.untitledui.com/images/avatars/nikolas-gibbons?fm=webp&q=80",
        socials: [
            {
                icon: X,
                href: "https://x.com/",
            },
            {
                icon: LinkedIn,
                href: "https://www.linkedin.com/",
            },
            {
                icon: Dribbble,
                href: "https://dribbble.com/",
            },
        ],
    },
    {
        name: "Sienna Hewitt",
        title: "Workflows",
        summary: "Turns real production needs into IDE-native flows: datasets → train → evaluate → export.",
        avatarUrl: "https://www.untitledui.com/images/avatars/sienna-hewitt?fm=webp&q=80",
        socials: [
            {
                icon: X,
                href: "https://x.com/",
            },
            {
                icon: LinkedIn,
                href: "https://www.linkedin.com/",
            },
            {
                icon: Dribbble,
                href: "https://dribbble.com/",
            },
        ],
    },
    {
        name: "Lily-Rose Chedjou",
        title: "Frontend",
        summary: "Builds the control-plane UI: dashboards, docs, and the download hub—fast and predictable.",
        avatarUrl: "https://www.untitledui.com/images/avatars/lily-rose-chedjou?fm=webp&q=80",
        socials: [
            {
                icon: X,
                href: "https://x.com/",
            },
            {
                icon: LinkedIn,
                href: "https://www.linkedin.com/",
            },
            {
                icon: Dribbble,
                href: "https://dribbble.com/",
            },
        ],
    },
    {
        name: "Zahra Christensen",
        title: "Backend",
        summary: "Owns auth, licensing, and metadata sync—designed for offline-first and auditability.",
        avatarUrl: "https://www.untitledui.com/images/avatars/zahra-christensen?fm=webp&q=80",
        socials: [
            {
                icon: X,
                href: "https://x.com/",
            },
            {
                icon: LinkedIn,
                href: "https://www.linkedin.com/",
            },
            {
                icon: Dribbble,
                href: "https://dribbble.com/",
            },
        ],
    },
    {
        name: "Caitlyn King",
        title: "Design",
        summary: "Human-first UX for ML workflows—reduce context switching without hiding critical details.",
        avatarUrl: "https://www.untitledui.com/images/avatars/caitlyn-king?fm=webp&q=80",
        socials: [
            {
                icon: X,
                href: "https://x.com/",
            },
            {
                icon: LinkedIn,
                href: "https://www.linkedin.com/",
            },
            {
                icon: Dribbble,
                href: "https://dribbble.com/",
            },
        ],
    },
    {
        name: "Zaid Schwartz",
        title: "Research",
        summary: "Talks to robotics, manufacturing, and security teams to keep ML FORGE production-real.",
        avatarUrl: "https://www.untitledui.com/images/avatars/zaid-schwartz?fm=webp&q=80",
        socials: [
            {
                icon: X,
                href: "https://x.com/",
            },
            {
                icon: LinkedIn,
                href: "https://www.linkedin.com/",
            },
            {
                icon: Dribbble,
                href: "https://dribbble.com/",
            },
        ],
    },
    {
        name: "Marco Kelly",
        title: "Customer Success",
        summary: "Helps teams ship vision models reliably: setup, workflow validation, and export to production.",
        avatarUrl: "https://www.untitledui.com/images/avatars/marco-kelly?fm=webp&q=80",
        socials: [
            {
                icon: X,
                href: "https://x.com/",
            },
            {
                icon: LinkedIn,
                href: "https://www.linkedin.com/",
            },
            {
                icon: Dribbble,
                href: "https://dribbble.com/",
            },
        ],
    },
];

export const TeamSectionSimple01 = ({ navigate }) => {
    return (
        <div className="bg-primary">
            <section className="aboutHero" style={{ backgroundColor: 'rgba(83,56,158,1)', borderBottomColor: 'rgba(255, 255, 255, 0.12)' }}>
                <div className="container aboutHero__inner">
                    <p className="aboutHero__kicker" style={{ color: 'rgba(255, 255, 255, 0.82)' }}>
                        Team
                    </p>
                    <h1 className="aboutHero__title" style={{ color: 'rgba(255, 255, 255, 0.98)' }}>
                        Building ML FORGE
                    </h1>
                    <p className="aboutHero__subtitle" style={{ color: 'rgba(255, 255, 255, 0.82)' }}>
                        We’re building a desktop-first Vision AI IDE for teams who need reproducible results—local-first by default, deterministic workflows, and audit-ready
                        exports.
                    </p>

                    <div className="aboutHero__cta">
                        <a
                            className="button button--primary"
                            href="/download"
                            onClick={(e) => {
                                e.preventDefault()
                                navigate?.('/download')
                            }}
                        >
                            Download ML FORGE
                        </a>
                        <a
                            className="button button--outline"
                            href="/why"
                            onClick={(e) => {
                                e.preventDefault()
                                navigate?.('/why')
                            }}
                        >
                            Why ML FORGE
                        </a>
                    </div>
                </div>
            </section>

            <section className="bg-primary py-16 md:py-24">
                <div className="mx-auto max-w-container px-4 md:px-8">
                    <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
                        <span className="text-sm font-semibold text-brand-secondary md:text-md">Team</span>
                        <h1 className="mt-3 text-display-sm font-semibold text-primary md:text-display-md">Building ML FORGE</h1>
                        <p className="mt-4 text-lg text-tertiary md:mt-5 md:text-xl">
                            We’re building a desktop-first Vision AI IDE for teams who need reproducible results.
                            Local-first by default. Deterministic workflows. Audit-ready exports.
                        </p>
                        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-center">
                            <a
                                href="/download"
                                className="inline-flex items-center justify-center rounded-lg bg-brand-secondary px-5 py-3 text-sm font-semibold text-white outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2"
                                onClick={(e) => {
                                    e.preventDefault()
                                    navigate?.('/download')
                                }}
                            >
                                Download for desktop
                            </a>
                            <a
                                href="/why"
                                className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-primary ring-1 ring-black/10 outline-focus-ring hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2"
                                onClick={(e) => {
                                    e.preventDefault()
                                    navigate?.('/why')
                                }}
                            >
                                Why ML FORGE
                            </a>
                        </div>
                    </div>

                    <div className="mx-auto mt-12 grid w-full max-w-5xl grid-cols-1 gap-4 md:mt-16 md:grid-cols-3">
                        <div className="rounded-2xl bg-secondary p-6">
                            <div className="text-sm font-semibold text-primary">Local-first</div>
                            <p className="mt-2 text-md text-tertiary">
                                Training runs where your data lives—on your workstation or on-prem. The website stays a control plane, not your runtime.
                            </p>
                        </div>
                        <div className="rounded-2xl bg-secondary p-6">
                            <div className="text-sm font-semibold text-primary">Deterministic</div>
                            <p className="mt-2 text-md text-tertiary">
                                Explicit configs, locked inputs, and repeatable runs—so “it worked last week” becomes reproducible.
                            </p>
                        </div>
                        <div className="rounded-2xl bg-secondary p-6">
                            <div className="text-sm font-semibold text-primary">Audit-ready</div>
                            <p className="mt-2 text-md text-tertiary">
                                Every export tied to a run, dataset snapshot, and metrics—so you can ship models with confidence.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-primary pb-16 md:pb-24">
                <div className="mx-auto max-w-container px-4 md:px-8">
                    <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
                        <h2 className="text-display-sm font-semibold text-primary md:text-display-md">People behind the product</h2>
                        <p className="mt-4 text-lg text-tertiary md:mt-5 md:text-xl">
                            ML FORGE is built by engineers who care about reproducibility, reliability, and shipping to production.
                        </p>
                    </div>

                    <div className="mt-12 md:mt-16">
                        <ul className="grid w-full grid-cols-1 justify-items-center gap-x-8 gap-y-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {teamMembers.map((item) => (
                                <li key={item.title} className="flex flex-col items-center gap-4 md:gap-5">
                                    <Avatar src={item.avatarUrl} alt={item.name} size="2xl" className="size-20 md:size-24" />
                                    <div className="text-center">
                                        <h3 className="text-lg font-semibold text-primary">{item.name}</h3>
                                        <p className="text-md text-brand-secondary">{item.title}</p>
                                        <p className="mt-2 max-w-[26ch] text-sm text-tertiary">{item.summary}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default function TeamPage({ navigate }) {
    return <TeamSectionSimple01 navigate={navigate} />
}
