import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validate";
import { prisma } from "../config/prisma";
import { sendSuccess } from "../utils/response";
import { AppError } from "../utils/errors";

const router = Router();

// GET /api/public/settings
router.get(
  "/settings",
  asyncHandler(async (_req, res) => {
    let settings = await prisma.stationSettings.findFirst();
    if (!settings) {
      settings = await prisma.stationSettings.create({ data: {} });
    }
    // Return only public-safe fields
    const publicSettings = {
      stationName: settings.stationName,
      frequency: settings.frequency,
      tagline: settings.tagline,
      description: settings.description,
      logoUrl: settings.logoUrl,
      faviconUrl: settings.faviconUrl,
      address: settings.address,
      phone: settings.phone,
      email: settings.email,
      whatsappNumber: settings.whatsappNumber,
      timezone: settings.timezone,
      streamUrl: settings.streamUrl,
      streamType: settings.streamType,
      seoTitle: settings.seoTitle,
      seoDescription: settings.seoDescription,
      footerText: settings.footerText,
      socialFacebook: settings.socialFacebook,
      socialTwitter: settings.socialTwitter,
      socialInstagram: settings.socialInstagram,
      socialYoutube: settings.socialYoutube,
      socialTiktok: settings.socialTiktok,
    };
    sendSuccess(res, publicSettings);
  })
);

// GET /api/public/programs
router.get(
  "/programs",
  asyncHandler(async (_req, res) => {
    const programs = await prisma.program.findMany({
      where: { status: "ACTIVE" },
      include: { presenter: true, schedules: true },
      orderBy: { name: "asc" },
    });
    sendSuccess(res, programs);
  })
);

// GET /api/public/programs/:slug
router.get(
  "/programs/:slug",
  asyncHandler(async (req, res) => {
    const program = await prisma.program.findUnique({
      where: { slug: req.params.slug },
      include: { presenter: true, schedules: true },
    });
    if (!program) throw new AppError("Program not found", 404);
    sendSuccess(res, program);
  })
);

// GET /api/public/schedule
router.get(
  "/schedule",
  asyncHandler(async (req, res) => {
    const day = req.query.day ? parseInt(req.query.day as string, 10) : undefined;
    const where: any = {};
    if (day !== undefined) where.dayOfWeek = day;

    const schedules = await prisma.programSchedule.findMany({
      where,
      include: { program: { include: { presenter: true } } },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
    sendSuccess(res, schedules);
  })
);

// GET /api/public/presenters
router.get(
  "/presenters",
  asyncHandler(async (_req, res) => {
    const presenters = await prisma.presenter.findMany({
      where: { isActive: true },
      include: { programs: { where: { status: "ACTIVE" } } },
      orderBy: { fullName: "asc" },
    });
    sendSuccess(res, presenters);
  })
);

// GET /api/public/presenters/:slug
router.get(
  "/presenters/:slug",
  asyncHandler(async (req, res) => {
    const presenter = await prisma.presenter.findUnique({
      where: { slug: req.params.slug },
      include: { programs: { where: { status: "ACTIVE" }, include: { schedules: true } } },
    });
    if (!presenter) throw new AppError("Presenter not found", 404);
    sendSuccess(res, presenter);
  })
);

// GET /api/public/news
router.get(
  "/news",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 10);
    const category = req.query.category as string;
    const search = req.query.search as string;
    const featured = req.query.featured === "true";

    const where: any = { status: "PUBLISHED" };
    if (category) {
      where.category = { slug: category };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, articles] = await Promise.all([
      prisma.newsArticle.count({ where }),
      prisma.newsArticle.findMany({
        where,
        include: { category: true },
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    sendSuccess(res, articles, undefined, 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  })
);

// GET /api/public/news/:slug
router.get(
  "/news/:slug",
  asyncHandler(async (req, res) => {
    const article = await prisma.newsArticle.findUnique({
      where: { slug: req.params.slug },
      include: { category: true },
    });
    if (!article || article.status !== "PUBLISHED") {
      throw new AppError("Article not found", 404);
    }
    sendSuccess(res, article);
  })
);

// GET /api/public/news-categories
router.get(
  "/news-categories",
  asyncHandler(async (_req, res) => {
    const categories = await prisma.newsCategory.findMany({ orderBy: { name: "asc" } });
    sendSuccess(res, categories);
  })
);

// GET /api/public/podcasts
router.get(
  "/podcasts",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 10);
    const category = req.query.category as string;
    const search = req.query.search as string;

    const where: any = { status: "PUBLISHED" };
    if (category) where.category = { slug: category };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, episodes] = await Promise.all([
      prisma.podcastEpisode.count({ where }),
      prisma.podcastEpisode.findMany({
        where,
        include: { category: true },
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    sendSuccess(res, episodes, undefined, 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  })
);

// GET /api/public/podcasts/:slug
router.get(
  "/podcasts/:slug",
  asyncHandler(async (req, res) => {
    const episode = await prisma.podcastEpisode.findUnique({
      where: { slug: req.params.slug },
      include: { category: true },
    });
    if (!episode || episode.status !== "PUBLISHED") {
      throw new AppError("Episode not found", 404);
    }
    sendSuccess(res, episode);
  })
);

// GET /api/public/podcast-categories
router.get(
  "/podcast-categories",
  asyncHandler(async (_req, res) => {
    const categories = await prisma.podcastCategory.findMany({ orderBy: { name: "asc" } });
    sendSuccess(res, categories);
  })
);

// GET /api/public/advertising-packages
router.get(
  "/advertising-packages",
  asyncHandler(async (_req, res) => {
    const packages = await prisma.advertisingPackage.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    sendSuccess(res, packages);
  })
);

// POST /api/public/contact
const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(20).optional(),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(2000),
});

router.post(
  "/contact",
  validate(contactSchema),
  asyncHandler(async (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    const msg = await prisma.contactMessage.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        subject,
        message,
      },
    });
    sendSuccess(res, { id: msg.id }, "Message sent successfully", 201);
  })
);

// POST /api/public/advertising-inquiry
const inquirySchema = z.object({
  businessName: z.string().min(2).max(200),
  contactPerson: z.string().min(2).max(100),
  phone: z.string().min(5).max(20),
  email: z.string().email().optional().or(z.literal("")),
  packageId: z.string().optional(),
  objectives: z.string().max(1000).optional(),
  budgetRange: z.string().max(100).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

router.post(
  "/advertising-inquiry",
  validate(inquirySchema),
  asyncHandler(async (req, res) => {
    const data = req.body;
    const inquiry = await prisma.advertisingInquiry.create({
      data: {
        businessName: data.businessName,
        contactPerson: data.contactPerson,
        phone: data.phone,
        email: data.email || null,
        packageId: data.packageId || null,
        objectives: data.objectives || null,
        budgetRange: data.budgetRange || null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
    sendSuccess(res, { id: inquiry.id }, "Inquiry submitted successfully", 201);
  })
);

export { router as publicRoutes };
export default router;
