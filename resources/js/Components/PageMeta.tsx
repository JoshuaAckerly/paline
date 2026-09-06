import { Head, usePage } from '@inertiajs/react';

interface Props {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
}

interface PageSeoOverride {
    title: string | null;
    meta_description: string | null;
    canonical_url: string | null;
    robots: string;
    og_title: string | null;
    og_description: string | null;
    og_image: string | null;
    og_type: string;
    twitter_card: string;
    twitter_title: string | null;
    twitter_description: string | null;
    twitter_image: string | null;
    schema_json: Record<string, unknown> | null;
}

const siteName = 'PA Line';
const defaultDescription = 'PA Line — True Grit Americana Folk from Western New York. Albums, shows, and more.';
const defaultImage = '/images/FB_IMG_1780195233682.jpg';

export default function PageMeta({ title, description, image, url }: Props) {
    const { pageSeo } = usePage().props as unknown as { pageSeo: PageSeoOverride | null };

    // Admin-edited SEO values (if present for this page) take precedence over the page's own defaults.
    const baseTitle = pageSeo?.title || title;
    const fullTitle = baseTitle ? `${baseTitle} — ${siteName}` : siteName;
    const desc = pageSeo?.meta_description || description || defaultDescription;
    const img = pageSeo?.og_image || image || defaultImage;

    return (
        <Head>
            <title>{fullTitle}</title>
            <meta name="description" content={desc} />
            <meta name="robots" content={pageSeo?.robots || 'index,follow'} />
            {pageSeo?.canonical_url && <link rel="canonical" href={pageSeo.canonical_url} />}

            {/* Open Graph */}
            <meta property="og:title" content={pageSeo?.og_title || fullTitle} />
            <meta property="og:description" content={pageSeo?.og_description || desc} />
            <meta property="og:image" content={img} />
            <meta property="og:type" content={pageSeo?.og_type || 'music.musician'} />
            <meta property="og:site_name" content={siteName} />
            {url && <meta property="og:url" content={url} />}

            {/* Twitter */}
            <meta name="twitter:card" content={pageSeo?.twitter_card || 'summary_large_image'} />
            <meta name="twitter:site" content="@PALineOfficial" />
            <meta name="twitter:title" content={pageSeo?.twitter_title || fullTitle} />
            <meta name="twitter:description" content={pageSeo?.twitter_description || desc} />
            <meta name="twitter:image" content={pageSeo?.twitter_image || img} />

            {pageSeo?.schema_json && (
                <script type="application/ld+json">{JSON.stringify(pageSeo.schema_json)}</script>
            )}
        </Head>
    );
}
