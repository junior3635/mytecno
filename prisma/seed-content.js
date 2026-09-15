/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function content(intro, sections, conclusion) {
  return `
<div class="article-intro"><p>${intro}</p></div>
${sections
  .map(
    ([heading, paragraphs]) =>
      `<h2>${heading}</h2>\n${paragraphs.map((p) => `<p>${p}</p>`).join('\n')}`
  )
  .join('\n')}
<div class="article-conclusion"><p>${conclusion}</p></div>`;
}

const demoArticles = [
  {
    id: 'demo-food-noodle-bars',
    title: 'The best neighborhood noodle bars worth the queue',
    slug: 'best-neighborhood-noodle-bars-worth-the-queue',
    category: 'Food',
    categorySlug: 'food',
    featuredImage: '/uploads/restaurant-review.svg',
    seoTitle: 'Best Neighborhood Noodle Bars — Editor Picks',
    seoDesc:
      'From hand-pulled lamian to ramen labs, these noodle bars earn their queues. Our editors pick the places that deliver.',
    content: content(
      'The best noodle bars rarely market themselves. They are the storefronts with a single pot on the stove, a laminated menu and a queue that moves slower than anyone would like. That queue is the point.',
      [
        [
          'What makes a noodle bar great',
          [
            'Great noodle bars start with technique, not hype. Hand-pulled noodles get their elasticity from resting and stretching the dough, while a proper broth is layered over hours rather than minutes.',
            'The best shops keep their menus short. If a kitchen offers forty dishes, it is doing forty things average; if it offers five, it does five things brilliantly.',
          ],
        ],
        [
          'Our three current favorites',
          [
            'The first spot is a twelve-stool ramen lab known for its tonkotsu broth and duck-fat chashu. The second is a Cantonese wonton shop where the dumpling skins are rolled by hand each morning.',
            'The third is a new-school lamian counter experimenting with fermented chili oil. All three are best visited before noon, when the queue is still manageable.',
          ],
        ],
      ],
      'A low, soupy, satisfying bowl is worth waiting for. Bring a friend to hold the table and order the extra noodles at the end.'
    ),
    isPublished: true,
  },
  {
    id: 'demo-news-ai-transparency',
    title: 'EU passes landmark AI transparency bill',
    slug: 'eu-passes-landmark-ai-transparency-bill',
    category: 'News',
    categorySlug: 'news',
    featuredImage: '/uploads/news-ai.svg',
    seoTitle: 'EU Passes Landmark AI Transparency Bill',
    seoDesc:
      'The new regulation requires clear labels on AI-generated media and risk assessments for high-impact models. Here is what changes.',
    content: content(
      'After months of negotiation, the European Parliament approved a sweeping transparency framework for artificial intelligence, targeting everything from model documentation to the labeling of synthetic media.',
      [
        [
          'What the bill requires',
          [
            'Providers of high-risk models must publish technical documentation, disclose training-data sources and register with a union-level watchdog before deployment.',
            'Platforms that serve AI-generated images, audio or video will be required to attach persistent, tamper-evident labels, a move campaigners say will blunt deepfake-driven disinformation.',
          ],
        ],
        [
          'Who is affected',
          [
            'The obligations scale with model size and reach. Small open-source projects get lighter rules, while foundation models with wide distribution face the heaviest scrutiny.',
            'Companies operating from outside the EU are covered whenever their services reach European users, mirroring the approach of earlier digital-regulation laws.',
          ],
        ],
        [
          'The reaction',
          [
            'Industry groups warn the reporting burden may slow research, while advocacy organizations argue the enforcement budget is far too small to be credible.',
            'The first compliance deadlines arrive in eighteen months, with the labeling provisions taking effect sooner.',
          ],
        ],
      ],
      'The bill is a milestone, but its success will be measured by enforcement — and by whether the rules keep pace with a technology that changes every quarter.'
    ),
    isPublished: true,
  },
  {
    id: 'demo-news-moon-mission',
    title: 'Private moon mission sets new deep-space record',
    slug: 'private-moon-mission-sets-new-deep-space-record',
    category: 'News',
    categorySlug: 'news',
    featuredImage: null,
    seoTitle: 'Private Moon Mission Sets New Deep-Space Record',
    seoDesc:
      'A commercial lander exceeded previous reach with a fuel-efficient trajectory and a record data return from lunar orbit.',
    content: content(
      'A privately built lunar lander has completed one of the most fuel-efficient flights to the Moon to date, extending a cold-chemical boost from solar pressure to shave propellant and set a record for data returned in a single pass.',
      [
        [
          'The flight profile',
          [
            'Engineers used a long, looping transfer orbit combined with a solar-sail assist, reducing the delta-v budget by roughly a fifth compared with a direct route.',
            'The lander maintained continuous contact with ground stations, beaming back more telemetry in its first orbit than earlier missions sent in a full week.',
          ],
        ],
        [
          'What it means',
          [
            'The demonstration opens cheaper logistics for small payloads, paving the way for more frequent, lower-cost lunar services.',
            'Two companion cubesats rode along and have already released their own instruments for near-space science.',
          ],
        ],
      ],
      'The record is less about speed and more about efficiency — proof that commercial missions can now reach the Moon on a shoestring budget.'
    ),
    isPublished: true,
  },
  {
    id: 'demo-trend-smart-home',
    title: 'Smart home gadgets that actually make life easier',
    slug: 'smart-home-gadgets-that-actually-make-life-easier',
    category: 'Trends',
    categorySlug: 'trends',
    featuredImage: '/uploads/trend-smart-home.svg',
    seoTitle: 'Smart Home Gadgets That Actually Work',
    seoDesc:
      'Skip the gimmicks. These connected devices earn their shelf space with real automation you will use every day.',
    content: content(
      'The smart home has a gimmick problem. Most connected gadgets solve problems nobody had. A handful, though, quietly become daily essentials — not because they are flashy, but because they automate decisions people repeat every morning.',
      [
        [
          'The ones we keep using',
          [
            'A motion-sensing light strip behind the bedroom door has killed the midnight stumbling. It turns on at ten percent brightness and shuts off after ninety seconds, no voice command needed.',
            'A smart plug with energy reporting on the coffee maker now tells us exactly what the morning ritual costs per month — and has nudged the whole household into brew-and-go routines.',
          ],
        ],
        [
          'What to skip',
          [
            'Anything that requires a subscription to do its basic job is a pass. Same for gadgets whose companion app demands an account before a single setting is changed.',
            'Buy for the protocol, not the brand: Matter-certified devices last, because they keep working even when the manufacturer rebrands or dies.',
          ],
        ],
        [
          'A simple setup rule',
          [
            'Start with one room. Wire it well, then add one device a month. The setups that stick are the ones that grew slowly around actual habits.',
          ],
        ],
      ],
      'The best smart home is invisible: sensors fire, lights fade, plugs click — and you only notice the house when you are sitting in it, comfortable.'
    ),
    isPublished: true,
  },
  {
    id: 'demo-trend-earbuds',
    title: 'True wireless earbuds are quietly rewriting how we listen',
    slug: 'true-wireless-earbuds-quietly-rewriting-how-we-listen',
    category: 'Trends',
    categorySlug: 'trends',
    featuredImage: null,
    seoTitle: 'True Wireless Earbuds Are Quietly Rewriting How We Listen',
    seoDesc:
      'Small, light and long-lasting, modern earbuds have replaced the dedicated audio player for most people. Why the category matters now.',
    content: content(
      'Ten years ago, earbuds were what you used when your headphones were charging. Today they are the primary audio device for most listeners, and the hardware has caught up with the habit.',
      [
        [
          'The drivers got better, not just smaller',
          [
            'Single-driver designs have matured, with bigger voice coils and better tuning inside the same compact shell. The result is bass that hits instead of rattles.',
            'Adaptive noise control now runs on-chip, sampling the environment dozens of times per second to balance isolation against awareness of traffic and speech.',
          ],
        ],
        [
          'What the form factor enables',
          [
            'The lightness changed behavior: people now fall asleep listening, wear a single bud on video calls, and keep music going through an entire workday on one charge.',
            'Forcing the format forward, battery engineering has pushed pocket cases to deliver two to three days of total playback without surrendering weight.',
          ],
        ],
      ],
      'The earbud is the new Walkman: personal, portable and almost invisible. Its quiet ubiquity is the biggest story in consumer audio.'
    ),
    isPublished: true,
  },
  {
    id: 'demo-guide-mech-keyboards',
    title: "Beginner's guide to mechanical keyboards",
    slug: 'beginners-guide-to-mechanical-keyboards',
    category: 'Guides',
    categorySlug: 'guides',
    featuredImage: '/uploads/guide-keyboards.svg',
    seoTitle: "Beginner's Guide to Mechanical Keyboards",
    seoDesc:
      'Switches, layouts, hot-swap, mods — a plain-language introduction to building and buying your first mechanical keyboard.',
    content: content(
      'Mechanical keyboards look like a rabbit hole, and they are. But the basics are simple: a switch type, a layout, and a mounting style. Understand those three things and every product page will finally make sense.',
      [
        [
          'Switches: the feel',
          [
            'Linear switches are smooth with no bump; tactile switches offer a small bump at the actuation point; clicky switches add an audible click. Type preference is personal — buy a switch tester before anything else.',
            'Cherry MX, Gateron, Kailh and the rest mostly differ in housing and spring weights, so treat brand as a guide rather than a rule.',
          ],
        ],
        [
          'Layouts: the size',
          [
            'Full-size keeps the numpad, tenkeyless (TKL) drops it, and 65-percent boards lose the function row for compact desks. Smaller is not better — just different.',
            'For a first board, TKL is the sweet spot: full functionality, lower price, and most keycaps fit it out of the box.',
          ],
        ],
        [
          'Hot-swap and mods',
          [
            'A hot-swap PCB lets you change switches with a puller, no soldering. That single feature makes a board future-proof and is the reason it is on every beginner recommendation list.',
            'Simple first mods: foam under the PCB to deepen the sound and new stabilizers to stop the rattle on the spacebar.',
          ],
        ],
      ],
      'Start small, start hot-swap, and buy a switch tester. The hobby rewards patience far more than money.'
    ),
    isPublished: true,
  },
  {
    id: 'demo-guide-digital-kitchen',
    title: 'A greener kitchen starts with smart energy choices',
    slug: 'greener-kitchen-starts-with-smart-energy-choices',
    category: 'Guides',
    categorySlug: 'guides',
    featuredImage: null,
    seoTitle: 'A Greener Kitchen Starts with Smart Energy Choices',
    seoDesc:
      'Small appliances dominate home energy use. A practical guide to induction, smart plugs and cooking habits that cut the bill.',
    content: content(
      'Most kitchens waste energy in unglamorous ways: pilot-heated water, preheating rituals and appliances left on standby. Flipping a few habits — and one or two pieces of hardware — cuts the bill without sacrificing speed.',
      [
        [
          'Induction changes the math',
          [
            'Induction hobs transfer heat directly to the pan, cutting cook times by a third and wasting almost none of the energy as room heat. If your pans are magnetic, the swap is plug-and-play.',
            'Pair it with a smart plug that logs power draw, and you can finally see which cooking modes actually cost money.',
          ],
        ],
        [
          'Standby is the quiet leak',
          [
            'Coffee machines, kettles and toasters draw power all day for minutes of use. A single switchable power strip lets you kill the standby drain with one click.',
            'The rule of thumb: anything with a clock or an LED is still consuming. Group them and switch them off.',
          ],
        ],
      ],
      'You do not need a smart kitchen. You need a few smart decisions — induction on the hob, standby off the grid.'
    ),
    isPublished: true,
  },
  {
    id: 'demo-review-scooter',
    title: 'The electric scooter that rides like a small car',
    slug: 'electric-scooter-that-rides-like-a-small-car',
    category: 'Reviews',
    categorySlug: 'reviews',
    featuredImage: null,
    seoTitle: 'Electric Scooter Review: Comfort, Range, Real-World Speed',
    seoDesc:
      'Stable, twin-suspension and genuinely fast, this scooter blurs the line between commute toy and daily vehicle. We tested it for two weeks.',
    content: content(
      'Most electric scooters are built to be light, which makes them twitchy at speed. This one goes the other way: a heavier frame, twin suspension and fat tires that make potholes disappear. It rides more like a small car than a kick scooter.',
      [
        [
          'Real-world performance',
          [
            'The claimed 70 km range holds up at around 48 km in mixed city riding — impressive, and honest given the weight of the rider and incline of the route.',
            'Top speed is governed to 32 km/h, a sensible limit that keeps the ride legal in most jurisdictions.',
          ],
        ],
        [
          'The trade-offs',
          [
            'At 24 kg, carrying it up stairs is a workout, and you will want a locked shed rather than a hallway. The folding mechanism is solid if not magical.',
            'Braking is progressive and confident, with a regenerative mode that extends range downhill.',
          ],
        ],
      ],
      'If your commute has real hills and rough pavement, this is the scooter to buy. It weighs more, but it earns every kilo.'
    ),
    isPublished: true,
  },
];

async function main() {
  const requiredCats = ['food', 'news', 'trends', 'guides', 'reviews'];
  const missing = [];
  for (const slug of requiredCats) {
    const cat = await prisma.category.findUnique({ where: { slug } });
    if (!cat) missing.push(slug);
  }
  if (missing.length) {
    console.error('Missing categories:', missing.join(', '), '— run `npm run db:seed` first.');
    process.exit(1);
  }

  let created = 0;
  let updated = 0;
  for (const article of demoArticles) {
    const existing = await prisma.article.findUnique({ where: { slug: article.slug } });
    if (existing) {
      await prisma.article.update({ where: { slug: article.slug }, data: article });
      updated += 1;
    } else {
      await prisma.article.create({ data: article });
      created += 1;
    }
  }
  console.log(`Content seed done — created: ${created}, updated: ${updated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());