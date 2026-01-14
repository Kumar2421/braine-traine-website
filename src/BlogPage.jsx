import { useMemo, useState } from 'react'
import { ArrowUpRight } from '@untitledui/icons'
import { Avatar } from '@/components/base/avatar/avatar'

const articles = [
    {
        id: 'article-1',
        title: 'Dataset versioning that makes training reproducible',
        summary: 'How to lock datasets, track changes, and eliminate “it worked yesterday” regressions in Vision AI pipelines.',
        href: '#',
        category: { name: 'Datasets', href: '#' },
        thumbnailUrl: 'https://www.untitledui.com/marketing/spirals.webp',
        publishedAt: '20 Jan 2025',
        
        author: {
            name: 'ML FORGE Team',
            href: '#',
            avatarUrl: 'https://www.untitledui.com/images/avatars/olivia-rhye?fm=webp&q=80',
        },
        tags: [
            { name: 'Dataset Manager', color: 'brand', href: '#' },
            { name: 'Reproducibility', color: 'indigo', href: '#' },
            { name: 'Audit Trail', color: 'pink', href: '#' },
        ],
        isFeatured: true,
    },
    {
        id: 'article-2',
        title: 'From dataset to YOLO: a desktop-first workflow',
        summary: 'A practical checklist: import data, annotate, train, evaluate, and export a YOLO model locally with full lineage.',
        href: '#',
        category: { name: 'Workflows', href: '#' },
        thumbnailUrl: 'https://www.untitledui.com/marketing/conversation.webp',
        publishedAt: '19 Jan 2025',
        
        author: {
            name: 'ML FORGE Team',
            href: '#',
            avatarUrl: 'https://www.untitledui.com/images/avatars/phoenix-baker?fm=webp&q=80',
        },
        tags: [
            { name: 'YOLO', color: 'blue-light', href: '#' },
            { name: 'Annotation', color: 'pink', href: '#' },
            { name: 'Training', color: 'pink', href: '#' },
        ],
    },
    {
        id: 'article-3',
        title: 'Training run hygiene: configs, seeds, and repeatable results',
        summary: 'What “deterministic” actually means in real Vision AI training—and what to capture to reproduce a run later.',
        href: '#',
        category: { name: 'Training', href: '#' },
        thumbnailUrl: 'https://www.untitledui.com/blog/two-mobile-shapes-pattern.webp',
        publishedAt: '18 Jan 2025',
        
        author: {
            name: 'ML FORGE Team',
            href: '#',
            avatarUrl: 'https://www.untitledui.com/images/avatars/lana-steiner?fm=webp&q=80',
        },
        tags: [
            { name: 'Configs', color: 'success', href: '#' },
            { name: 'Run Lineage', color: 'pink', href: '#' },
        ],
    },
    {
        id: 'article-3.5',
        title: 'Evaluation that survives production: what to track',
        summary: 'Beyond a single metric—how to validate detection models with the same rigor you’ll need after deployment.',
        href: '#',
        category: { name: 'Evaluation', href: '#' },
        thumbnailUrl: 'https://www.untitledui.com/blog/two-people.webp',
        publishedAt: '17 Jan 2025',
        
        author: {
            name: 'ML FORGE Team',
            href: '#',
            avatarUrl: 'https://www.untitledui.com/images/avatars/alec-whitten?fm=webp&q=80',
        },
        tags: [
            { name: 'Metrics', color: 'brand', href: '#' },
            { name: 'Regression', color: 'gray-blue', href: '#' },
        ],
    },
    {
        id: 'article-4',
        title: 'Export formats: ONNX vs TensorRT vs CoreML (when to use what)',
        summary: 'A deployment-focused guide for getting your trained model into the environment that actually runs production.',
        href: '#',
        category: { name: 'Deployment', href: '#' },
        thumbnailUrl: 'https://www.untitledui.com/marketing/smiling-girl-6.webp',
        publishedAt: '16 Jan 2025',
       
        author: {
            name: 'ML FORGE Team',
            href: '#',
            avatarUrl: 'https://www.untitledui.com/images/avatars/demi-wilkinson?fm=webp&q=80',
        },
        tags: [
            { name: 'ONNX', color: 'blue-light', href: '#' },
            { name: 'TensorRT', color: 'indigo', href: '#' },
            { name: 'CoreML', color: 'orange', href: '#' },
        ],
    },
    {
        id: 'article-5',
        title: 'Annotation quality control: labels you can trust',
        summary: 'A practical approach to review, approval, and consistency checks so training data doesn’t silently drift.',
        href: '#',
        category: { name: 'Datasets', href: '#' },
        thumbnailUrl: 'https://www.untitledui.com/marketing/wireframing-layout.webp',
        publishedAt: '15 Jan 2025',
        
        author: {
            name: 'ML FORGE Team',
            href: '#',
            avatarUrl: 'https://www.untitledui.com/images/avatars/candice-wu?fm=webp&q=80',
        },
        tags: [
            { name: 'Annotation', color: 'brand', href: '#' },
            { name: 'QA', color: 'indigo', href: '#' },
        ],
    },
    {
        id: 'article-6',
        title: 'Local-first doesn’t mean “no collaboration”',
        summary: 'How teams use ML FORGE to share workflows and stay audit-ready without sending data to a cloud runtime.',
        href: '#',
        category: { name: 'Workflows', href: '#' },
        thumbnailUrl: 'https://www.untitledui.com/marketing/two-people.webp',
        publishedAt: '14 Jan 2025',
        
        author: {
            name: 'ML FORGE Team',
            href: '#',
            avatarUrl: 'https://www.untitledui.com/images/avatars/natali-craig?fm=webp&q=80',
        },
        tags: [
            { name: 'Teams', color: 'brand', href: '#' },
            { name: 'Governance', color: 'indigo', href: '#' },
        ],
    },
    {
        id: 'article-7',
        title: 'Benchmarking before you ship: latency, throughput, and accuracy',
        summary: 'A deployment checklist for measuring what matters on the target machine—not just in training logs.',
        href: '#',
        category: { name: 'Deployment', href: '#' },
        thumbnailUrl: 'https://www.untitledui.com/marketing/workspace-5.webp',
        publishedAt: '13 Jan 2025',
        
        author: {
            name: 'ML FORGE Team',
            href: '#',
            avatarUrl: 'https://www.untitledui.com/images/avatars/drew-cano?fm=webp&q=80',
        },
        tags: [
            { name: 'Performance', color: 'success', href: '#' },
            { name: 'Export', color: 'pink', href: '#' },
            { name: 'Edge', color: 'pink', href: '#' },
        ],
    },
    {
        id: 'article-8',
        title: 'Offline deployment patterns for Vision AI',
        summary: 'When cloud isn’t an option: how teams ship and update models in regulated or air-gapped environments.',
        href: '#',
        category: { name: 'Deployment', href: '#' },
        thumbnailUrl: 'https://www.untitledui.com/marketing/sythesize.webp',
        publishedAt: '12 Jan 2025',
        author: {
            name: 'ML FORGE Team',
            href: '#',
            avatarUrl: 'https://www.untitledui.com/images/avatars/orlando-diggs?fm=webp&q=80',
        },
        tags: [
            { name: 'Offline', color: 'brand', href: '#' },
            { name: 'On-prem', color: 'gray-blue', href: '#' },
        ],
    },
]

const tabs = [
    { id: 'all', label: 'View all' },
    { id: 'datasets', label: 'Datasets' },
    { id: 'workflows', label: 'Workflows' },
    { id: 'training', label: 'Training' },
    { id: 'evaluation', label: 'Evaluation' },
    { id: 'deployment', label: 'Deployment' },
]

const sortByOptions = [
    { id: 'recent', label: 'Most recent' },
    { id: 'popular', label: 'Most popular' },
    { id: 'viewed', label: 'Most viewed' },
]

const featuredArticle = {
    id: 'article-001',
    category: { name: 'Workflows', href: '#' },
    thumbnailUrl: 'https://www.untitledui.com/marketing/blog-featured-post-01.webp',
    title: 'A deterministic Vision AI workflow: from data to deployed artifact',
    summary: 'How ML FORGE structures datasets, runs, and exports so you can reproduce results and ship with confidence.',
    href: '#',
    publishedAt: '10 April 2025',
    author: {
        name: 'ML FORGE Team',
        href: '#',
        avatarUrl: 'https://www.untitledui.com/images/avatars/amelie-laurent?fm=webp&q=80',
    },
    tags: [
        { name: 'Datasets', color: 'gray', href: '#' },
        { name: 'Training Runs', color: 'gray', href: '#' },
        { name: 'Exports', color: 'gray', href: '#' },
    ],
}

function BlogCard({ article }) {
    return (
        <a
            href={article.href}
            className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-4"
        >
            <div className="relative aspect-[16/10] w-full overflow-hidden">
                <img
                    src={article.thumbnailUrl}
                    alt={article.title}
                    className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
            </div>

            <div className="flex flex-1 flex-col gap-4 p-6">
                <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-brand-secondary">{article.category?.name}</span>
                    <span className="text-sm text-tertiary">{article.readingTime}</span>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-semibold text-primary">{article.title}</h3>
                        <ArrowUpRight className="h-5 w-5 shrink-0 text-tertiary" />
                    </div>
                    <p className="line-clamp-2 text-md text-tertiary">{article.summary}</p>
                </div>

                <div className="mt-auto flex items-center gap-3">
                    <Avatar size="md" src={article.author?.avatarUrl} alt={article.author?.name || 'Author'} />
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-primary">{article.author?.name}</span>
                        <span className="text-sm text-tertiary">{article.publishedAt}</span>
                    </div>
                </div>
            </div>
        </a>
    )
}

function TabsBar({ active, onChange }) {
    return (
        <div className="w-full overflow-auto">
            <div className="flex min-w-max items-center gap-2 border-b border-black/10">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        className={[
                            'px-3 py-2 text-sm font-semibold',
                            active === t.id
                                ? 'border-b-2 border-brand-secondary text-primary'
                                : 'text-tertiary hover:text-primary',
                        ].join(' ')}
                        onClick={() => onChange(t.id)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
        </div>
    )
}

function Pagination({ page, totalPages, onPage }) {
    if (totalPages <= 1) return null

    return (
        <div className="flex w-full items-center justify-between gap-4 pt-6">
            <button
                type="button"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-tertiary ring-1 ring-black/10 hover:text-primary disabled:opacity-50"
                disabled={page <= 1}
                onClick={() => onPage(page - 1)}
            >
                Previous
            </button>
            <div className="text-sm text-tertiary">
                Page <span className="font-semibold text-primary">{page}</span> of {totalPages}
            </div>
            <button
                type="button"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-tertiary ring-1 ring-black/10 hover:text-primary disabled:opacity-50"
                disabled={page >= totalPages}
                onClick={() => onPage(page + 1)}
            >
                Next
            </button>
        </div>
    )
}

export default function BlogPage() {
    const [activeTab, setActiveTab] = useState('all')
    const [sortBy, setSortBy] = useState(sortByOptions[0].id)
    const [page, setPage] = useState(1)

    const filtered = useMemo(() => {
        const base = activeTab === 'all'
            ? articles
            : articles.filter((a) => (a.category?.name || '').toLowerCase().replace(/\s+/g, '-') === activeTab)

        // Placeholder sorting (static content)
        if (sortBy === 'popular' || sortBy === 'viewed') return base
        return base
    }, [activeTab, sortBy])

    const pageSize = 9
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
    const safePage = Math.min(page, totalPages)
    const start = (safePage - 1) * pageSize
    const paged = filtered.slice(start, start + pageSize)

    return (
        <div className="bg-primary">
            <section className="aboutHero">
                <div className="container aboutHero__inner">
                    <p className="aboutHero__kicker">Blog</p>
                    <h1 className="aboutHero__title">Resources for local-first Vision AI</h1>
                    <p className="aboutHero__subtitle">
                        Practical notes on datasets, training, evaluation, and export—written for teams who ship models to production.
                    </p>
                </div>
            </section>

            <main className="mx-auto flex w-full max-w-container flex-col gap-12 px-4 pb-16 md:gap-16 md:px-8 md:pb-24">
                <a
                    href={featuredArticle.href}
                    className="relative hidden w-full overflow-hidden rounded-2xl outline-focus-ring select-none focus-visible:outline-2 focus-visible:outline-offset-4 md:block md:h-145 lg:h-180"
                >
                    <img src={featuredArticle.thumbnailUrl} alt={featuredArticle.title} className="absolute inset-0 size-full object-cover" />

                    <div className="absolute inset-x-0 bottom-0 w-full bg-linear-to-t from-black/40 to-transparent pt-24">
                        <div className="flex w-full flex-col gap-6 p-8">
                            <div className="flex flex-col gap-2">
                                <div className="flex gap-4">
                                    <p className="flex-1 text-display-xs font-semibold text-white">{featuredArticle.title}</p>
                                    <ArrowUpRight className="size-6 shrink-0 text-fg-white" />
                                </div>
                                <p className="line-clamp-2 text-md text-white">{featuredArticle.summary}</p>
                            </div>
                            <div className="flex gap-6">
                                <div className="flex flex-1 gap-8">
                                    <div className="flex flex-col gap-2">
                                        <p className="text-sm font-semibold text-white">Written by</p>
                                        <div className="flex items-center gap-2">
                                            <Avatar size="md" src={featuredArticle.author.avatarUrl} alt={featuredArticle.author.name} />
                                            <p className="text-sm font-semibold text-white">{featuredArticle.author.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <p className="text-sm font-semibold text-white">Published on</p>
                                        <div className="flex h-10 items-center">
                                            <p className="text-md font-semibold text-white">{featuredArticle.publishedAt}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <p className="text-sm font-semibold text-white">File under</p>
                                    <ul className="flex h-10 items-center gap-2">
                                        {featuredArticle.tags.map((tag) => (
                                            <li
                                                key={tag.name}
                                                className="rounded-full bg-transparent px-2 py-0.5 text-xs font-medium text-fg-white ring-1 ring-fg-white ring-inset"
                                            >
                                                {tag.name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </a>

                <div className="flex flex-col items-end gap-8 md:flex-row">
                    <TabsBar
                        active={activeTab}
                        onChange={(id) => {
                            setActiveTab(id)
                            setPage(1)
                        }}
                    />

                    <div className="relative w-full md:max-w-44">
                        <label className="sr-only" htmlFor="blog-sort">
                            Sort by
                        </label>
                        <select
                            id="blog-sort"
                            className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm font-semibold text-primary outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            {sortByOptions.map((o) => (
                                <option key={o.id} value={o.id}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <ul className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 md:gap-y-12 lg:grid-cols-3">
                    {paged.map((article) => (
                        <li key={article.id}>
                            <BlogCard article={article} />
                        </li>
                    ))}
                </ul>

                <Pagination page={safePage} totalPages={totalPages} onPage={setPage} />
            </main>
        </div>
    )
}
