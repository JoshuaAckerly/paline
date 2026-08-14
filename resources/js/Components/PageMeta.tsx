import { Head } from '@inertiajs/react';

interface Props {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
}

const siteName = 'PA Line';
const defaultDescription = 'PA Line — True Grit Americana Folk from Western New York. Albums, shows, and more.';
const defaultImage = '/images/FB_IMG_1780195233682.jpg';

export default function PageMeta({ title, description, image, url }: Props) {
    const fullTitle = title ? `${title} — ${siteName}` : siteName;
    const desc = description ?? defaultDescription;
    const img = image ?? defaultImage;

    return (
        <Head>
            <title>{fullTitle}</title>
            <meta name="description" content={desc} />

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={desc} />
            <meta property="og:image" content={img} />
            <meta property="og:type" content="music.musician" />
            <meta property="og:site_name" content={siteName} />
            {url && <meta property="og:url" content={url} />}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@PALineOfficial" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={desc} />
            <meta name="twitter:image" content={img} />
        </Head>
    );
}
