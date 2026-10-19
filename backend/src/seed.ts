import { prisma } from "./config/prisma";
import { config } from "./config";
import { hashPassword } from "./utils/password";

export async function seedDatabase() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const existingAdmin = await prisma.adminUser.findUnique({ where: { email: config.adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await hashPassword(config.adminPassword);
    await prisma.adminUser.create({
      data: {
        email: config.adminEmail,
        passwordHash,
        name: config.adminName,
        role: "SUPER_ADMIN",
      },
    });
    console.log(`✅ Admin user created: ${config.adminEmail}`);
  } else {
    console.log(`ℹ️ Admin user already exists: ${config.adminEmail}`);
  }

  // Station settings
  const existingSettings = await prisma.stationSettings.findFirst();
  if (!existingSettings) {
    await prisma.stationSettings.create({
      data: {
        stationName: "Radio Togotane FM",
        frequency: "88.3 FM",
        tagline: "Voice of the Community",
        description: "Radio Togotane FM 88.3 is a community radio station broadcasting from Kehancha, Migori County, Kenya. We bring you the latest news, music, and community programs.",
        address: "Kehancha, Migori County, Kenya",
        phone: "+254 700 000 000",
        email: "info@radiotogotane.co.ke",
        whatsappNumber: "+254 700 000 000",
        timezone: "Africa/Nairobi",
        streamType: "external",
        seoTitle: "Radio Togotane FM 88.3 - Kehancha, Migori",
        seoDescription: "Listen to Radio Togotane FM 88.3 live from Kehancha, Migori County, Kenya. Community radio bringing you news, music, and programs.",
        footerText: "© 2026 Radio Togotane FM 88.3. All rights reserved.",
        socialFacebook: "https://facebook.com/radiotogotane",
        socialTwitter: "https://twitter.com/radiotogotane",
        socialInstagram: "https://instagram.com/radiotogotane",
        socialYoutube: "https://youtube.com/@radiotogotane",
      },
    });
    console.log("✅ Station settings created");
  }

  // News categories
  const newsCats = [
    { name: "Local News", slug: "local-news", description: "News from Kehancha and Migori County" },
    { name: "National News", slug: "national-news", description: "Kenya national news" },
    { name: "Entertainment", slug: "entertainment", description: "Music, events, and entertainment" },
    { name: "Sports", slug: "sports", description: "Sports news and updates" },
    { name: "Health", slug: "health", description: "Health tips and community wellness" },
  ];
  for (const cat of newsCats) {
    await prisma.newsCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("✅ News categories created");

  // Podcast categories
  const podcastCats = [
    { name: "Talk Shows", slug: "talk-shows", description: "In-depth talk shows and discussions" },
    { name: "Music", slug: "music", description: "Music programs and mixes" },
    { name: "Community", slug: "community", description: "Community-focused programs" },
  ];
  for (const cat of podcastCats) {
    await prisma.podcastCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Podcast categories created");

  // Presenters
  const presenters = [
    { fullName: "Warioba Senior", slug: "warioba-senior", bio: "Experienced broadcaster and community voice. Host of morning drive programs.", isActive: true },
    { fullName: "Lucas Magesa", slug: "lucas-magesa", bio: "Music enthusiast and entertainment presenter. Brings the best hits to your radio.", isActive: true },
    { fullName: "Malenga wa Kilimanjaro", slug: "malenga-wa-kilimanjaro", bio: "Veteran presenter known for engaging talk shows and community discussions.", isActive: true },
    { fullName: "Terry Rhobi (Super Lady)", slug: "terry-rhobi-super-lady", bio: "Dynamic presenter and the voice behind popular afternoon programs.", isActive: true },
  ];
  for (const p of presenters) {
    await prisma.presenter.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }
  console.log("✅ Presenters created");

  // Programs
  const presenterMap: Record<string, string> = {};
  const allPresenters = await prisma.presenter.findMany();
  allPresenters.forEach((p) => { presenterMap[p.slug] = p.id; });

  const programs = [
    { name: "Morning Drive", slug: "morning-drive", description: "Start your day with news, music, and community updates.", category: "Talk", presenterId: presenterMap["warioba-senior"], status: "ACTIVE" as const },
    { name: "Mid-Morning Show", slug: "mid-morning-show", description: "Engaging discussions on community issues and lifestyle.", category: "Talk", presenterId: presenterMap["malenga-wa-kilimanjaro"], status: "ACTIVE" as const },
    { name: "Lunch Time Hits", slug: "lunch-time-hits", description: "Your favorite music to accompany your lunch break.", category: "Music", presenterId: presenterMap["lucas-magesa"], status: "ACTIVE" as const },
    { name: "Afternoon Delight", slug: "afternoon-delight", description: "Afternoon entertainment and interactive programs.", category: "Entertainment", presenterId: presenterMap["terry-rhobi-super-lady"], status: "ACTIVE" as const },
    { name: "Evening News", slug: "evening-news", description: "Comprehensive evening news roundup.", category: "News", presenterId: presenterMap["warioba-senior"], status: "ACTIVE" as const },
    { name: "Night Music", slug: "night-music", description: "Relaxing music to end your day.", category: "Music", presenterId: presenterMap["lucas-magesa"], status: "ACTIVE" as const },
  ];
  for (const prog of programs) {
    await prisma.program.upsert({
      where: { slug: prog.slug },
      update: {},
      create: prog,
    });
  }
  console.log("✅ Programs created");

  // Schedules
  const programMap: Record<string, string> = {};
  const allPrograms = await prisma.program.findMany();
  allPrograms.forEach((p) => { programMap[p.slug] = p.id; });

  const schedules = [
    // Monday-Friday
    { programSlug: "morning-drive", days: [1, 2, 3, 4, 5], start: "06:00", end: "09:00" },
    { programSlug: "mid-morning-show", days: [1, 2, 3, 4, 5], start: "09:00", end: "12:00" },
    { programSlug: "lunch-time-hits", days: [1, 2, 3, 4, 5], start: "12:00", end: "14:00" },
    { programSlug: "afternoon-delight", days: [1, 2, 3, 4, 5], start: "14:00", end: "17:00" },
    { programSlug: "evening-news", days: [1, 2, 3, 4, 5], start: "17:00", end: "19:00" },
    { programSlug: "night-music", days: [1, 2, 3, 4, 5], start: "19:00", end: "22:00" },
    // Weekend
    { programSlug: "morning-drive", days: [6, 0], start: "07:00", end: "10:00" },
    { programSlug: "lunch-time-hits", days: [6, 0], start: "12:00", end: "15:00" },
    { programSlug: "night-music", days: [6, 0], start: "18:00", end: "23:00" },
  ];

  // Clear existing schedules
  await prisma.programSchedule.deleteMany({});

  for (const sched of schedules) {
    const programId = programMap[sched.programSlug];
    if (!programId) continue;
    for (const day of sched.days) {
      await prisma.programSchedule.create({
        data: {
          programId,
          dayOfWeek: day,
          startTime: sched.start,
          endTime: sched.end,
        },
      });
    }
  }
  console.log("✅ Schedules created");

  // Advertising packages
  const adPackages = [
    { name: "Spot Ad (30s)", slug: "spot-ad-30s", description: "30-second radio spot advertisement", price: "Contact for pricing", features: JSON.stringify(["30-second spot", "Prime time slots available", "Professional voice-over"]), sortOrder: 1 },
    { name: "Spot Ad (60s)", slug: "spot-ad-60s", description: "60-second radio spot advertisement", price: "Contact for pricing", features: JSON.stringify(["60-second spot", "Prime time slots available", "Professional voice-over"]), sortOrder: 2 },
    { name: "Program Sponsorship", slug: "program-sponsorship", description: "Sponsor an entire program segment", price: "Contact for pricing", features: JSON.stringify(["Brand mention", "Logo display", "Social media shoutout"]), sortOrder: 3 },
    { name: "Event Promotion", slug: "event-promotion", description: "Promote your event on air", price: "Contact for pricing", features: JSON.stringify(["Event announcements", "On-air interviews", "Social media promotion"]), sortOrder: 4 },
  ];
  for (const pkg of adPackages) {
    await prisma.advertisingPackage.upsert({
      where: { slug: pkg.slug },
      update: {},
      create: pkg,
    });
  }
  console.log("✅ Advertising packages created");

  // Sample news articles
  const localNewsCat = await prisma.newsCategory.findUnique({ where: { slug: "local-news" } });
  const entertainmentCat = await prisma.newsCategory.findUnique({ where: { slug: "entertainment" } });

  const articles = [
    {
      title: "Radio Togotane FM Launches New Morning Show",
      slug: "radio-togotane-fm-launches-new-morning-show",
      excerpt: "Radio Togotane FM 88.3 has launched a refreshed morning drive program to better serve the Kehancha community.",
      content: "Radio Togotane FM 88.3 is excited to announce the launch of a refreshed morning drive program. The new show features enhanced community segments, local news updates, and interactive listener call-ins.\n\nHosted by Warioba Senior, the program airs every weekday from 6:00 AM to 9:00 AM, bringing you the best start to your day with news, music, and community discussions.\n\nListeners can tune in on 88.3 FM or stream live online. We welcome your feedback and participation in our community programs.",
      status: "PUBLISHED" as const,
      publishedAt: new Date(),
      authorName: "Station Team",
      categoryId: localNewsCat?.id,
    },
    {
      title: "Community Health Initiative in Migori County",
      slug: "community-health-initiative-migori-county",
      excerpt: "Local health authorities partner with community organizations to improve healthcare access in Migori County.",
      content: "A new community health initiative has been launched in Migori County aimed at improving healthcare access for rural communities. The program focuses on preventive care, maternal health, and disease awareness.\n\nRadio Togotane FM is proud to support this initiative by providing airtime for health education segments every Wednesday at 10:00 AM.\n\nListeners are encouraged to tune in and participate in the weekly health discussions.",
      status: "PUBLISHED" as const,
      publishedAt: new Date(Date.now() - 86400000 * 2),
      authorName: "Station Team",
      categoryId: localNewsCat?.id,
    },
    {
      title: "Weekend Music Marathon Coming Soon",
      slug: "weekend-music-marathon-coming-soon",
      excerpt: "Get ready for a weekend filled with non-stop music on Radio Togotane FM 88.3.",
      content: "Radio Togotane FM 88.3 is gearing up for a weekend music marathon featuring the best of local and international hits. Join us this Saturday and Sunday for non-stop music, listener requests, and special guest DJs.\n\nThe marathon kicks off at 12:00 PM on Saturday and runs through Sunday evening. Don't miss out on the fun!",
      status: "DRAFT" as const,
      authorName: "Station Team",
      categoryId: entertainmentCat?.id,
    },
  ];

  for (const article of articles) {
    await prisma.newsArticle.upsert({
      where: { slug: article.slug },
      update: {},
      create: article,
    });
  }
  console.log("✅ Sample news articles created");

  // Sample podcast episode
  const talkShowCat = await prisma.podcastCategory.findUnique({ where: { slug: "talk-shows" } });
  await prisma.podcastEpisode.upsert({
    where: { slug: "community-voices-episode-1" },
    update: {},
    create: {
      title: "Community Voices - Episode 1",
      slug: "community-voices-episode-1",
      description: "In this first episode of Community Voices, we discuss local development projects in Kehancha and hear from community leaders about their vision for the future.",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      duration: 1800,
      status: "PUBLISHED",
      publishedAt: new Date(),
      presenterName: "Warioba Senior",
      categoryId: talkShowCat?.id,
    },
  });
  console.log("✅ Sample podcast episode created");

  console.log("🎉 Seeding complete!");
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("Done");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seed error:", err);
      process.exit(1);
    });
}
