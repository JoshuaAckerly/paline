import { motion } from 'framer-motion';
import MainLayout from '@/Layouts/MainLayout';
import PageMeta from '@/Components/PageMeta';

const members = [
    { name: 'Trever Stribing', role: 'Lead Vocals, Acoustic Guitar, Kick & Tambourine' },
    { name: 'Griffin Brady',   role: 'World & Hand Percussion, Vocals' },
    { name: 'Andrew Moore',    role: 'Bass, Vocals' },
    { name: 'Michael Bloom',   role: 'Drum Kit' },
];

const storySections = [
    {
        heading: 'The Beginning',
        body: `The first incarnation of PA LINE formed around Trever with Lucas Honig on bass and Alyssa Wainwright on violin. That combination established something that would remain central to PA LINE throughout its life. This wasn't going to be a conventional rock band. Trever's acoustic guitar could provide the drive, Lucas's bass could move melodically underneath it, and Alyssa's violin could whisper behind a verse or tear through a chorus. PA LINE could be acoustic without being quiet and folk without being delicate.

That earliest era was captured on LIAR, featuring Trever, Lucas, and Alyssa. Trever produced and engineered the record himself, making it a raw document of three musicians beginning to discover what PA LINE could become.

The circle soon expanded. Josh Ackerley brought keys and mandolin, and the growing instrumentation began pushing Trever's songwriting beyond its original acoustic presentation. That evolution was captured on Breathe, featuring Trever Stribing, Lucas Honig, Alyssa Wainwright, and Josh Ackerley, with Harvey Brice producing and engineering the record.

By the summer of 2015, PA LINE was already beginning to gain momentum outside its immediate circle. The band won Buffalo's Battle of the Bands, earning an opportunity to open for Iron & Wine at Canalside. The road was beginning to call, and PA LINE quickly learned that new cities and unfamiliar audiences were some of the best places to discover whether a song could actually stand on its own.`,
        photos: [
            { src: '/images/FB_IMG_1779126099726.jpg', alt: 'PA Line live — vocals and guitar' },
            { src: '/images/FB_IMG_1779126335133.jpg', alt: 'PA Line outside the venue' },
        ],
    },
    {
        heading: 'Finding the Sound',
        body: `As PA LINE traveled and developed, its musical vocabulary continued to expand. Elijah Peterson brought banjo. Pat Brown brought banjo and keys. Casey Bloom and Adam Nicpon brought mandolin during different chapters, while Pete Caroccio brought electric violin and mandolin. Alex Cousins added cello, opening an entirely different emotional and cinematic space within the band's arrangements. Sara Elizabeth contributed vocals and guitar, and the rhythmic side of the band changed repeatedly through musicians including Michael Vealey, Luke B., Ryan Howze, Jeremy Shields, and others who helped define particular periods of the band's live and recorded sound.

Some musicians stayed for years. Others belonged to a particular season, tour, record, or run of performances. Each brought another musical vocabulary into the same collection of songs, and each left something behind when the next chapter began.

That constant evolution made PA LINE increasingly difficult to categorize. The instrumentation suggested folk, but the intensity often didn't. Americana, alternative rock, roots music, singer-songwriter traditions, world rhythm, and the improvisational spirit of the jam scene all found their way into the sound. Eventually, the band found a description that felt more appropriate than trying to fit neatly into an existing category:

True-Grit Americana Folk.

Western New York seemed to recognize the contradiction early. At the 2016 All WNY Music Awards, PA LINE won both Best Indie/Alternative Band and Best Folk Band/Act, while Trever placed second for Best Lyricist. Being recognized simultaneously as the area's best folk act and its best indie/alternative act was strangely fitting. PA LINE had already become difficult to put into one box.`,
    },
    {
        heading: 'Becoming a Road Band',
        body: `The road became PA LINE's real education. The band performed in bars, breweries, clubs, theaters, listening rooms, festival fields, and outdoor stages, sometimes for packed crowds and sometimes for considerably fewer people. Both kinds of nights mattered.

The smaller rooms taught whether a song actually worked without production, familiarity, or reputation carrying it. Long drives taught whether everyone still believed in what they were doing when the next show was hours away. Touring became less about promoting a record and more about building the identity of the band itself.

What began in Western New York eventually grew into a touring history spanning 28 states, four countries, and two continents, including extensive travel throughout the United States and performances in Canada and the United Kingdom. PA LINE would cross the Atlantic for two separate tours of England, taking music born in Western New York rooms into an entirely different musical culture.

Those miles changed the songs, but they also changed the people playing them.`,
        photos: [
            { src: '/images/FB_IMG_1780195246363.jpg', alt: 'PA Line performing live' },
            { src: '/images/FB_IMG_1758563443626.jpg', alt: 'PA Line — sunset show', position: 'center 42%' },
            { src: '/images/FB_IMG_1752182259573.jpg', alt: 'PA Line at Blue Heron Music Festival' },
        ],
    },
    {
        heading: 'Peace Always',
        body: `By 2018, years of changing arrangements, musicians, relationships, and road miles had accumulated into PA LINE's first full-length album, Peace Always.

The record featured Trever Stribing, Lucas Honig, Jeremy Shields, Pat Brown, Michael Vealey, and Stephany Vealey. Trever produced the album, with Michael Vealey engineering, capturing a version of PA LINE whose sound had grown considerably beyond the band's earliest recordings.

Calling the album Peace Always was more than choosing a title. It connected the growing band directly back to the words that had inspired PA LINE in the first place. Whatever the lineup became, whatever instrumentation entered or left the picture, and however far the road eventually carried the band, those words remained the center.

The music from this period didn't necessarily stop evolving when the original recordings were finished. Ryan Howze later created remixes of "Piece of Love" and "Shut Up," reimagining existing PA LINE material through a different production perspective. It became another example of a philosophy that has followed the band throughout its history: a song doesn't necessarily stop changing simply because one version has been recorded.`,
    },
    {
        heading: 'Bigger Stages, Same Purpose',
        body: `As PA LINE's road widened, so did the stages. The band became part of a broader roots, Americana, and festival community, appearing at events and stages including Music is Art, the Great Blue Heron Music Festival, Borderland Music + Arts Festival, and many others.

PA LINE's 2019 appearance at Borderland placed the band on the main stage during a weekend populated by nationally established Americana, roots, bluegrass, and rock artists. Another recurring chapter developed at Watkins Glen International, where PA LINE appeared as part of the track's summer concert programming before returning in September 2024 for a performance on the Jack Daniel's Concert Stage during NASCAR race weekend.

Along the way, PA LINE has shared stages and bills with artists including Rusted Root, Iron & Wine, The Infamous Stringdusters, John Oates, and Peter Rowan.

Those opportunities became landmarks in the band's history, but they never fundamentally changed the job. A bigger stage doesn't make a lyric more honest. A famous name on the poster doesn't make the harmony work. Whether there are thousands of people beyond the stage or twenty standing directly in front of it, the responsibility remains the same: play the song and mean it.`,
        photos: [
            { src: '/images/FB_IMG_1779126096094.jpg', alt: 'PA Line live — indoor show' },
            { src: '/images/FB_IMG_1779126105420.jpg', alt: 'PA Line live — bass' },
        ],
    },
    {
        heading: 'A Band Built to Change',
        body: `For years, Lucas Honig was one of the defining constants beside Trever, anchoring multiple generations of PA LINE with bass and vocals through enormous portions of the band's touring and recorded history. Around them, however, the musical family continued to move.

Bands that survive long enough eventually collide with real life. People move. Families grow. Careers change. Relationships evolve. Priorities shift. Sometimes a musician needs something different, and sometimes the music itself does.

PA LINE learned not to erase those changes from its story.

Alyssa's violin belongs to PA LINE. Josh's keys and mandolin belong to it. Eli and Pat's banjos belong to it. Casey and Adam's mandolins belong to it. Pete's electric violin belongs to it. Alex's cello belongs to it. Jeremy's percussion belongs to it. Michael's production, engineering, and percussion belong to it. Ryan's performances and remixes belong to it. Sara's voice belongs to it.

Every person changed the music somehow.

The current lineup doesn't replace that history. It inherits it.`,
    },
    {
        heading: 'Ten Years: dENIAL',
        body: `On April 19, 2024, exactly ten years into the PA LINE journey, the band released dENIAL.

It would have been easy to celebrate a decade with nostalgia. Instead, PA LINE made one of its most introspective records.

dENIAL featured Trever Stribing, Lucas Honig, Griffin Brady, Sarah Elizabeth, Alex Cousins, and Maggie Stribing, with Trever handling both production and engineering.

That represented another important evolution. By this point, Trever wasn't simply writing the material and leading the performances. The entire sonic presentation of the record had become part of his creative responsibility. Production and engineering became extensions of the songwriting itself: deciding what should remain exposed, what needed to become enormous, where percussion entered, where cello created tension, where another voice appeared, and where the arrangement simply needed to get out of the lyric's way.

Where Peace Always represented an ideal, dENIAL explored what happens when living up to that ideal becomes difficult. The album wrestled with denial, consequence, faith, anger, relationships, freedom, uncertainty, responsibility, and acceptance. Songs including "Ghost," "Denial," "Lift You Up," "Answers," "Free," "Prime," "Confide," and "Storytellers" captured a songwriter and band that had grown older without pretending that age automatically brings clarity.

Ten years hadn't necessarily produced all the answers. It had produced better questions.`,
        photos: [
            { src: '/images/FB_IMG_1785518888446.jpg', alt: 'Trever Stribing — PA Line' },
            { src: '/images/FB_IMG_1780195239119.jpg', alt: 'PA Line live — percussion' },
        ],
    },
    {
        heading: 'Griffin Brady',
        body: `The arrival of Griffin Brady brought another evolution to PA LINE's rhythmic identity.

Griffin brought a lifetime of cultural study, percussion, education, and touring into the band. An ethnomusicologist and founder of the Slyboots School of Music, Art & Dance, his musical life has included extensive study and collaboration with musicians in Ghana and decades devoted to understanding rhythm not simply as accompaniment, but as communication.

That perspective changed the way percussion could function inside PA LINE. Congas, djembe, bass drum, hand percussion, and other textures could move around Trever's guitar rather than simply sitting underneath it. Rhythm could answer a vocal phrase, challenge the guitar, leave space around a lyric, or suddenly pull the entire arrangement forward.

The heartbeat changed again.`,
    },
    {
        heading: 'Andrew Moore',
        body: `Then came Andrew Moore, bringing bass, vocals, composition, and decades of musicianship into PA LINE. Andrew's journey had taken him from studying upright bass, composition, and music business at SUNY Fredonia through extensive touring and eventually into the professional musical-instrument industry, including years with D'Addario & Company and international work involving Spector Basses and Aguilar Amplification.

Andrew's arrival carried another layer of history because he and Griffin weren't new musical acquaintances. They had met at Fredonia more than two decades earlier, built On the Sly together, toured together, and worked alongside one another through Slyboots. The musical communication between them wasn't something PA LINE needed to manufacture during rehearsals; it already existed.

Suddenly, two long musical journeys intersected: more than a decade of Trever's PA LINE history and more than twenty years of Griffin and Andrew's shared musical language.`,
    },
    {
        heading: 'Michael Bloom and the Current PA LINE',
        body: `The newest chapter brings Michael Bloom of Lancaster, New York into PA LINE on full drum kit.

For much of PA LINE's existence, the band deliberately operated outside the traditional rock rhythm section. Adding Michael doesn't eliminate that identity; it opens another dimension within it. A dedicated kit gives the songs a deeper backbeat and physical drive while allowing Griffin's hand percussion to become even more conversational, textural, and expansive.

Andrew's bass can now move between those rhythmic worlds, while Trever's aggressive acoustic guitar can push against the rhythm rather than carrying so much of it by itself. PA LINE hasn't abandoned the acoustic identity that began with Trever, Lucas, and Alyssa. It has simply found another way to make that identity bigger.

Today, PA LINE is Trever Stribing on lead vocals, acoustic guitar, kick and tambourine; Griffin Brady on world and hand percussion and vocals; Andrew Moore on bass and vocals; and Michael Bloom on drum kit.

Those four musicians stand at the end of a musical lineage extending back to 2014 and involving far more people than can fit into one current band photograph.`,
    },
    {
        heading: 'The Records Tell the Story',
        body: `Looked at together, PA LINE's recordings provide perhaps the clearest timeline of its evolution.

LIAR captured the beginning: Trever, Lucas, and Alyssa establishing the earliest musical language of PA LINE, produced and engineered by Trever.

Breathe captured the expansion: Trever, Lucas, Alyssa, and Josh beginning to discover how much larger those songs could become, produced and engineered by Harvey Brice.

Peace Always captured a road-tested band with a wider musical vocabulary: Trever, Lucas, Jeremy, Pat, Michael, and Stephany, produced by Trever and engineered by Michael Vealey.

dENIAL captured what happened after nearly a decade of actually living the philosophy behind the band's name: Trever, Lucas, Griffin, Sarah, Alex, and Maggie, produced and engineered by Trever.

Each record sounds different because each record should sound different. They weren't made by interchangeable musicians trying to reproduce an established PA LINE formula. They were made by the people who were living inside the music at that particular moment.

Taken together, they tell one continuous story.`,
    },
    {
        heading: 'Roses & Rubies',
        body: `Now another chapter is taking shape with Roses & Rubies.

It isn't PA LINE starting over. It's everything that came before continuing forward through another moment in the band's life.

The perspective is older. The road is longer. The musicians have changed. The scars are different. The questions inside the songs have changed. But the instinct that began this project remains remarkably intact: take something difficult to say, put it into a song, carry that song into a room, and hope somebody recognizes a piece of themselves inside it.

More than a decade of PA LINE can be measured in 28 states, four countries, two continents, two tours of England, multiple records, awards, festivals, and thousands upon thousands of road miles. It can be measured through major stages and nearly empty rooms, through musicians who stayed for years and musicians who belonged to a particular chapter, through records that captured one version of the band just before another version emerged.

But none of those statistics completely explains PA LINE.

The better explanation is the sound itself: an acoustic guitar being played hard enough to become percussion, a bass finding exactly where a song needs weight, a violin screaming through a chorus, a cello underneath a lyric, a mandolin or banjo filling an empty space, hand drums answering a vocal, a full drum kit pushing everything forward, and several voices suddenly becoming one.

It's every musician who walked into this strange musical family, carried part of it for a while, and left something behind. It's the people who listened, sang along, bought a record, drove to another show, offered a place to sleep, or simply stood in a room and gave a song their attention.

PA LINE was never about maintaining a perfect lineup. It has been about maintaining the thread connecting all of those people, records, places, and chapters.

That thread began with two words.

After more than a decade of change, miles, records, friendships, departures, new beginnings, mistakes, victories, and songs, they remain the simplest explanation for why PA LINE exists and why it keeps moving forward.

Peace Always.`,
    },
];

export default function About() {
    return (
        <MainLayout>
            <PageMeta title="About" description="The story of PA Line — founded in Western New York in 2014 by Trever Stribing. True Grit Americana Folk with roots in folk, blues, and American rock." image="/images/IMG_20260518_000900.jpg" />
            <div className="max-w-5xl mx-auto px-6 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: 'var(--primary)' }}>
                        The Band
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold mb-12" style={{ color: 'var(--text)' }}>
                        About
                    </h1>
                </motion.div>

                {/* Band photo */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="w-full aspect-video rounded border mb-12 overflow-hidden"
                    style={{ borderColor: 'var(--border)' }}
                >
                    <img
                        src="/images/IMG_20260518_000900.jpg"
                        alt="PA Line"
                        className="w-full h-full object-cover object-center"
                    />
                </motion.div>

                {/* Intro bio */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="max-w-3xl space-y-5 text-base leading-relaxed mb-16"
                    style={{ color: 'var(--muted)' }}
                >
                    <p>
                        PA LINE has never really been one band so much as one continuously evolving musical story. Founded in Western New York in 2014 by songwriter, vocalist, guitarist, and producer <strong style={{ color: 'var(--text)' }}>Trever Stribing</strong>, the project began with songs that were becoming too big for one person and one acoustic guitar. What followed was not a straight path toward a permanent lineup, but an expanding musical collective shaped by the people, instruments, friendships, records, stages, and thousands of miles that entered the picture along the way.
                    </p>
                    <p>
                        Through every incarnation of PA LINE, two things have remained at the center: the songs and the words <em style={{ color: 'var(--text)' }}>Peace Always</em>.
                    </p>
                    <p>
                        The name PA LINE comes from a phrase used by Trever's late adoptive father, Jeffrey Stribing. "Peace Always" was a personal mantra and sign-off that remained with Trever after his father's passing and eventually became something larger: not a claim that life is always peaceful, but a reminder to continue reaching for peace through grief, anger, uncertainty, and everything that makes doing so difficult. As Trever's songwriting moved deeper into folk music and storytelling, those words became the foundation for the band that would eventually carry them across the country and overseas.
                    </p>
                </motion.div>

                {/* Current members */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="mb-20"
                >
                    <p className="text-xs tracking-[0.3em] uppercase mb-6" style={{ color: 'var(--primary)' }}>
                        Current Lineup
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {members.map((m, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.07 }}
                                className="p-5 border rounded"
                                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
                            >
                                <p className="font-semibold text-lg" style={{ fontFamily: "'six-hands', serif", color: 'var(--text)' }}>{m.name}</p>
                                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{m.role}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>



                {/* Full story */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                >
                    <p className="text-xs tracking-[0.3em] uppercase mb-10" style={{ color: 'var(--primary)' }}>
                        The Full Story
                    </p>
                    <div className="max-w-3xl space-y-12">
                        {storySections.map((section, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.05 }}
                            >
                                <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text)' }}>{section.heading}</h2>
                                {section.body.split('\n\n').map((para, j) => (
                                    <p key={j} className="text-base leading-relaxed mb-4" style={{ color: 'var(--muted)' }}>{para}</p>
                                ))}
                                {section.photos && (
                                    <div
                                        className={`grid gap-3 mt-6 ${
                                            section.photos.length === 1
                                                ? 'grid-cols-1 max-w-sm'
                                                : section.photos.length === 2
                                                  ? 'grid-cols-1 sm:grid-cols-2'
                                                  : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                                        }`}
                                    >
                                        {section.photos.map((photo: {src:string;alt:string}, k: number) => (
                                            <div key={k} className="overflow-hidden rounded" style={{ border: '1px solid var(--border)' }}>
                                                <img
                                                    src={photo.src}
                                                    alt={photo.alt}
                                                    className="w-full object-cover transition-transform duration-500 hover:scale-105"
                                                    style={{
                                                        height: '220px',
                                                        objectPosition: 'position' in photo ? photo.position : 'center',
                                                    }}
                                                    loading="lazy"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </MainLayout>
    );
}
