import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validate";
import { authenticate, authorize } from "../middleware/auth";
import { prisma } from "../config/prisma";
import { sendSuccess } from "../utils/response";
import { AppError, NotFoundError } from "../utils/errors";

const router = Router();

// All admin routes require authentication
router.use(authenticate);

// =====================
// Dashboard Stats
// =====================
router.get(
  "/dashboard",
  asyncHandler(async (_req, res) => {
    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      totalPresenters,
      activePrograms,
      totalEpisodes,
      unreadMessages,
      totalInquiries,
      newInquiries,
    ] = await Promise.all([
      prisma.newsArticle.count(),
      prisma.newsArticle.count({ where: { status: "PUBLISHED" } }),
      prisma.newsArticle.count({ where: { status: "DRAFT" } }),
      prisma.presenter.count(),
      prisma.program.count({ where: { status: "ACTIVE" } }),
      prisma.podcastEpisode.count(),
      prisma.contactMessage.count({ where: { status: "UNREAD" } }),
      prisma.advertisingInquiry.count(),
      prisma.advertisingInquiry.count({ where: { status: "NEW" } }),
    ]);

    const recentActivity = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { name: true, email: true } } },
    });

    sendSuccess(res, {
      stats: {
        totalArticles,
        publishedArticles,
        draftArticles,
        totalPresenters,
        activePrograms,
        totalEpisodes,
        unreadMessages,
        totalInquiries,
        newInquiries,
      },
      recentActivity,
    });
  })
);

// =====================
// Programs CRUD
// =====================
const programSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  category: z.string().optional(),
  imageUrl: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  isRecurring: z.boolean().optional(),
  presenterId: z.string().optional().nullable(),
});

router.get(
  "/programs",
  asyncHandler(async (req, res) => {
    const programs = await prisma.program.findMany({
      include: { presenter: true, schedules: true },
      orderBy: { name: "asc" },
    });
    sendSuccess(res, programs);
  })
);

router.get(
  "/programs/:id",
  asyncHandler(async (req, res) => {
    const program = await prisma.program.findUnique({
      where: { id: req.params.id },
      include: { presenter: true, schedules: true },
    });
    if (!program) throw new NotFoundError("Program not found");
    sendSuccess(res, program);
  })
);

router.post(
  "/programs",
  authorize("SUPER_ADMIN", "EDITOR"),
  validate(programSchema),
  asyncHandler(async (req, res) => {
    const program = await prisma.program.create({ data: req.body });
    await prisma.auditLog.create({
      data: { userId: req.user!.userId, action: "CREATE_PROGRAM", entityType: "Program", entityId: program.id },
    });
    sendSuccess(res, program, "Program created", 201);
  })
);

router.put(
  "/programs/:id",
  authorize("SUPER_ADMIN", "EDITOR"),
  validate(programSchema.partial()),
  asyncHandler(async (req, res) => {
    const program = await prisma.program.update({
      where: { id: req.params.id },
      data: req.body,
    });
    await prisma.auditLog.create({
      data: { userId: req.user!.userId, action: "UPDATE_PROGRAM", entityType: "Program", entityId: program.id },
    });
    sendSuccess(res, program, "Program updated");
  })
);

router.delete(
  "/programs/:id",
  authorize("SUPER_ADMIN", "EDITOR"),
  asyncHandler(async (req, res) => {
    await prisma.program.delete({ where: { id: req.params.id } });
    await prisma.auditLog.create({
      data: { userId: req.user!.userId, action: "DELETE_PROGRAM", entityType: "Program", entityId: req.params.id },
    });
    sendSuccess(res, null, "Program deleted");
  })
);

// =====================
// Program Schedules CRUD
// =====================
const scheduleSchema = z.object({
  programId: z.string(),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  isSpecial: z.boolean().optional(),
  specialDate: z.string().optional().nullable(),
  notes: z.string().optional(),
});

router.get(
  "/schedules",
  asyncHandler(async (req, res) => {
    const programId = req.query.programId as string;
    const where = programId ? { programId } : {};
    const schedules = await prisma.programSchedule.findMany({
      where,
      include: { program: true },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
    sendSuccess(res, schedules);
  })
);

router.post(
  "/schedules",
  authorize("SUPER_ADMIN", "EDITOR"),
  validate(scheduleSchema),
  asyncHandler(async (req, res) => {
    const data = { ...req.body };
    if (data.specialDate) data.specialDate = new Date(data.specialDate);
    const schedule = await prisma.programSchedule.create({ data });
    await prisma.auditLog.create({
      data: { userId: req.user!.userId, action: "CREATE_SCHEDULE", entityType: "ProgramSchedule", entityId: schedule.id },
    });
    sendSuccess(res, schedule, "Schedule created", 201);
  })
);

router.put(
  "/schedules/:id",
  authorize("SUPER_ADMIN", "EDITOR"),
  validate(scheduleSchema.partial()),
  asyncHandler(async (req, res) => {
    const data = { ...req.body };
    if (data.specialDate) data.specialDate = new Date(data.specialDate);
    const schedule = await prisma.programSchedule.update({
      where: { id: req.params.id },
      data,
    });
    sendSuccess(res, schedule, "Schedule updated");
  })
);

router.delete(
  "/schedules/:id",
  authorize("SUPER_ADMIN", "EDITOR"),
  asyncHandler(async (req, res) => {
    await prisma.programSchedule.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, "Schedule deleted");
  })
);

// =====================
// Presenters CRUD
// =====================
const presenterSchema = z.object({
  fullName: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/),
  photoUrl: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  socialFacebook: z.string().optional().nullable(),
  socialTwitter: z.string().optional().nullable(),
  socialInstagram: z.string().optional().nullable(),
  socialTiktok: z.string().optional().nullable(),
});

router.get(
  "/presenters",
  asyncHandler(async (_req, res) => {
    const presenters = await prisma.presenter.findMany({
      include: { programs: true },
      orderBy: { fullName: "asc" },
    });
    sendSuccess(res, presenters);
  })
);

router.get(
  "/presenters/:id",
  asyncHandler(async (req, res) => {
    const presenter = await prisma.presenter.findUnique({
      where: { id: req.params.id },
      include: { programs: { include: { schedules: true } } },
    });
    if (!presenter) throw new NotFoundError("Presenter not found");
    sendSuccess(res, presenter);
  })
);

router.post(
  "/presenters",
  authorize("SUPER_ADMIN", "EDITOR"),
  validate(presenterSchema),
  asyncHandler(async (req, res) => {
    const presenter = await prisma.presenter.create({ data: req.body });
    await prisma.auditLog.create({
      data: { userId: req.user!.userId, action: "CREATE_PRESENTER", entityType: "Presenter", entityId: presenter.id },
    });
    sendSuccess(res, presenter, "Presenter created", 201);
  })
);

router.put(
  "/presenters/:id",
  authorize("SUPER_ADMIN", "EDITOR"),
  validate(presenterSchema.partial()),
  asyncHandler(async (req, res) => {
    const presenter = await prisma.presenter.update({
      where: { id: req.params.id },
      data: req.body,
    });
    sendSuccess(res, presenter, "Presenter updated");
  })
);

router.delete(
  "/presenters/:id",
  authorize("SUPER_ADMIN", "EDITOR"),
  asyncHandler(async (req, res) => {
    await prisma.presenter.delete({ where: { id: req.params.id } });
    await prisma.auditLog.create({
      data: { userId: req.user!.userId, action: "DELETE_PRESENTER", entityType: "Presenter", entityId: req.params.id },
    });
    sendSuccess(res, null, "Presenter deleted");
  })
);

// =====================
// News Categories CRUD
// =====================
const categorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().optional().nullable(),
});

router.get("/news-categories", asyncHandler(async (_req, res) => {
  const categories = await prisma.newsCategory.findMany({ orderBy: { name: "asc" } });
  sendSuccess(res, categories);
}));

router.post("/news-categories", authorize("SUPER_ADMIN", "EDITOR"), validate(categorySchema), asyncHandler(async (req, res) => {
  const category = await prisma.newsCategory.create({ data: req.body });
  sendSuccess(res, category, "Category created", 201);
}));

router.put("/news-categories/:id", authorize("SUPER_ADMIN", "EDITOR"), validate(categorySchema.partial()), asyncHandler(async (req, res) => {
  const category = await prisma.newsCategory.update({ where: { id: req.params.id }, data: req.body });
  sendSuccess(res, category, "Category updated");
}));

router.delete("/news-categories/:id", authorize("SUPER_ADMIN", "EDITOR"), asyncHandler(async (req, res) => {
  await prisma.newsCategory.delete({ where: { id: req.params.id } });
  sendSuccess(res, null, "Category deleted");
}));

// =====================
// News Articles CRUD
// =====================
const articleSchema = z.object({
  title: z.string().min(3).max(300),
  slug: z.string().min(3).max(300).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().optional().nullable(),
  content: z.string().min(10),
  featuredImageUrl: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  publishedAt: z.string().optional().nullable(),
  authorName: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
});

router.get(
  "/news",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const status = req.query.status as string;
    const search = req.query.search as string;

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, articles] = await Promise.all([
      prisma.newsArticle.count({ where }),
      prisma.newsArticle.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
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

router.get(
  "/news/:id",
  asyncHandler(async (req, res) => {
    const article = await prisma.newsArticle.findUnique({
      where: { id: req.params.id },
      include: { category: true },
    });
    if (!article) throw new NotFoundError("Article not found");
    sendSuccess(res, article);
  })
);

router.post(
  "/news",
  authorize("SUPER_ADMIN", "EDITOR", "CONTRIBUTOR"),
  validate(articleSchema),
  asyncHandler(async (req, res) => {
    const data = { ...req.body };
    if (data.publishedAt) data.publishedAt = new Date(data.publishedAt);
    if (data.status === "PUBLISHED" && !data.publishedAt) data.publishedAt = new Date();
    const article = await prisma.newsArticle.create({ data });
    await prisma.auditLog.create({
      data: { userId: req.user!.userId, action: "CREATE_ARTICLE", entityType: "NewsArticle", entityId: article.id },
    });
    sendSuccess(res, article, "Article created", 201);
  })
);

router.put(
  "/news/:id",
  authorize("SUPER_ADMIN", "EDITOR", "CONTRIBUTOR"),
  validate(articleSchema.partial()),
  asyncHandler(async (req, res) => {
    const data = { ...req.body };
    if (data.publishedAt) data.publishedAt = new Date(data.publishedAt);
    const article = await prisma.newsArticle.update({
      where: { id: req.params.id },
      data,
    });
    await prisma.auditLog.create({
      data: { userId: req.user!.userId, action: "UPDATE_ARTICLE", entityType: "NewsArticle", entityId: article.id },
    });
    sendSuccess(res, article, "Article updated");
  })
);

router.delete(
  "/news/:id",
  authorize("SUPER_ADMIN", "EDITOR"),
  asyncHandler(async (req, res) => {
    await prisma.newsArticle.delete({ where: { id: req.params.id } });
    await prisma.auditLog.create({
      data: { userId: req.user!.userId, action: "DELETE_ARTICLE", entityType: "NewsArticle", entityId: req.params.id },
    });
    sendSuccess(res, null, "Article deleted");
  })
);

// =====================
// Podcast Categories CRUD
// =====================
router.get("/podcast-categories", asyncHandler(async (_req, res) => {
  const categories = await prisma.podcastCategory.findMany({ orderBy: { name: "asc" } });
  sendSuccess(res, categories);
}));

router.post("/podcast-categories", authorize("SUPER_ADMIN", "EDITOR"), validate(categorySchema), asyncHandler(async (req, res) => {
  const category = await prisma.podcastCategory.create({ data: req.body });
  sendSuccess(res, category, "Category created", 201);
}));

router.put("/podcast-categories/:id", authorize("SUPER_ADMIN", "EDITOR"), validate(categorySchema.partial()), asyncHandler(async (req, res) => {
  const category = await prisma.podcastCategory.update({ where: { id: req.params.id }, data: req.body });
  sendSuccess(res, category, "Category updated");
}));

router.delete("/podcast-categories/:id", authorize("SUPER_ADMIN", "EDITOR"), asyncHandler(async (req, res) => {
  await prisma.podcastCategory.delete({ where: { id: req.params.id } });
  sendSuccess(res, null, "Category deleted");
}));

// =====================
// Podcast Episodes CRUD
// =====================
const episodeSchema = z.object({
  title: z.string().min(3).max(300),
  slug: z.string().min(3).max(300).regex(/^[a-z0-9-]+$/),
  description: z.string().optional().nullable(),
  audioUrl: z.string().url(),
  artworkUrl: z.string().optional().nullable(),
  duration: z.number().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  publishedAt: z.string().optional().nullable(),
  presenterName: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
});

router.get(
  "/podcasts",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const status = req.query.status as string;
    const search = req.query.search as string;

    const where: any = {};
    if (status) where.status = status;
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
        orderBy: { createdAt: "desc" },
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

router.get("/podcasts/:id", asyncHandler(async (req, res) => {
  const episode = await prisma.podcastEpisode.findUnique({
    where: { id: req.params.id },
    include: { category: true },
  });
  if (!episode) throw new NotFoundError("Episode not found");
  sendSuccess(res, episode);
}));

router.post(
  "/podcasts",
  authorize("SUPER_ADMIN", "EDITOR", "CONTRIBUTOR"),
  validate(episodeSchema),
  asyncHandler(async (req, res) => {
    const data = { ...req.body };
    if (data.publishedAt) data.publishedAt = new Date(data.publishedAt);
    if (data.status === "PUBLISHED" && !data.publishedAt) data.publishedAt = new Date();
    const episode = await prisma.podcastEpisode.create({ data });
    sendSuccess(res, episode, "Episode created", 201);
  })
);

router.put(
  "/podcasts/:id",
  authorize("SUPER_ADMIN", "EDITOR", "CONTRIBUTOR"),
  validate(episodeSchema.partial()),
  asyncHandler(async (req, res) => {
    const data = { ...req.body };
    if (data.publishedAt) data.publishedAt = new Date(data.publishedAt);
    const episode = await prisma.podcastEpisode.update({
      where: { id: req.params.id },
      data,
    });
    sendSuccess(res, episode, "Episode updated");
  })
);

router.delete(
  "/podcasts/:id",
  authorize("SUPER_ADMIN", "EDITOR"),
  asyncHandler(async (req, res) => {
    await prisma.podcastEpisode.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, "Episode deleted");
  })
);

// =====================
// Contact Messages
// =====================
router.get(
  "/contact-messages",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const status = req.query.status as string;
    const search = req.query.search as string;

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, messages] = await Promise.all([
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    sendSuccess(res, messages, undefined, 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  })
);

router.patch(
  "/contact-messages/:id/status",
  authorize("SUPER_ADMIN", "EDITOR"),
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    const msg = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { status },
    });
    sendSuccess(res, msg, "Status updated");
  })
);

router.delete(
  "/contact-messages/:id",
  authorize("SUPER_ADMIN", "EDITOR"),
  asyncHandler(async (req, res) => {
    await prisma.contactMessage.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, "Message deleted");
  })
);

// =====================
// Advertising Packages CRUD
// =====================
const adPackageSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/),
  description: z.string().optional().nullable(),
  price: z.string().optional().nullable(),
  features: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

router.get("/advertising-packages", asyncHandler(async (_req, res) => {
  const packages = await prisma.advertisingPackage.findMany({ orderBy: { sortOrder: "asc" } });
  sendSuccess(res, packages);
}));

router.post("/advertising-packages", authorize("SUPER_ADMIN", "EDITOR"), validate(adPackageSchema), asyncHandler(async (req, res) => {
  const pkg = await prisma.advertisingPackage.create({ data: req.body });
  sendSuccess(res, pkg, "Package created", 201);
}));

router.put("/advertising-packages/:id", authorize("SUPER_ADMIN", "EDITOR"), validate(adPackageSchema.partial()), asyncHandler(async (req, res) => {
  const pkg = await prisma.advertisingPackage.update({ where: { id: req.params.id }, data: req.body });
  sendSuccess(res, pkg, "Package updated");
}));

router.delete("/advertising-packages/:id", authorize("SUPER_ADMIN", "EDITOR"), asyncHandler(async (req, res) => {
  await prisma.advertisingPackage.delete({ where: { id: req.params.id } });
  sendSuccess(res, null, "Package deleted");
}));

// =====================
// Advertising Inquiries
// =====================
router.get(
  "/advertising-inquiries",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const status = req.query.status as string;

    const where: any = {};
    if (status) where.status = status;

    const [total, inquiries] = await Promise.all([
      prisma.advertisingInquiry.count({ where }),
      prisma.advertisingInquiry.findMany({
        where,
        include: { package: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    sendSuccess(res, inquiries, undefined, 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  })
);

router.patch(
  "/advertising-inquiries/:id",
  authorize("SUPER_ADMIN", "EDITOR"),
  asyncHandler(async (req, res) => {
    const inquiry = await prisma.advertisingInquiry.update({
      where: { id: req.params.id },
      data: req.body,
    });
    sendSuccess(res, inquiry, "Inquiry updated");
  })
);

router.delete(
  "/advertising-inquiries/:id",
  authorize("SUPER_ADMIN"),
  asyncHandler(async (req, res) => {
    await prisma.advertisingInquiry.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, "Inquiry deleted");
  })
);

// =====================
// Station Settings
// =====================
router.get("/settings", asyncHandler(async (_req, res) => {
  let settings = await prisma.stationSettings.findFirst();
  if (!settings) settings = await prisma.stationSettings.create({ data: {} });
  sendSuccess(res, settings);
}));

const settingsSchema = z.object({
  stationName: z.string().optional(),
  frequency: z.string().optional(),
  tagline: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  faviconUrl: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  whatsappNumber: z.string().optional().nullable(),
  timezone: z.string().optional(),
  streamUrl: z.string().optional().nullable(),
  streamType: z.string().optional(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  footerText: z.string().optional().nullable(),
  socialFacebook: z.string().optional().nullable(),
  socialTwitter: z.string().optional().nullable(),
  socialInstagram: z.string().optional().nullable(),
  socialYoutube: z.string().optional().nullable(),
  socialTiktok: z.string().optional().nullable(),
});

router.put(
  "/settings",
  authorize("SUPER_ADMIN"),
  validate(settingsSchema),
  asyncHandler(async (req, res) => {
    let settings = await prisma.stationSettings.findFirst();
    if (!settings) {
      settings = await prisma.stationSettings.create({ data: req.body });
    } else {
      settings = await prisma.stationSettings.update({
        where: { id: settings.id },
        data: req.body,
      });
    }
    await prisma.auditLog.create({
      data: { userId: req.user!.userId, action: "UPDATE_SETTINGS", entityType: "StationSettings", entityId: settings.id },
    });
    sendSuccess(res, settings, "Settings updated");
  })
);

// =====================
// Admin Users Management
// =====================
router.get(
  "/users",
  authorize("SUPER_ADMIN"),
  asyncHandler(async (_req, res) => {
    const users = await prisma.adminUser.findMany({
      select: { id: true, email: true, name: true, role: true, isActive: true, lastLoginAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    sendSuccess(res, users);
  })
);

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(["SUPER_ADMIN", "EDITOR", "CONTRIBUTOR"]).optional(),
});

router.post(
  "/users",
  authorize("SUPER_ADMIN"),
  validate(createUserSchema),
  asyncHandler(async (req, res) => {
    const { password, ...data } = req.body;
    const existing = await prisma.adminUser.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError("Email already in use", 409);

    const passwordHash = await (await import("../utils/password")).hashPassword(password);
    const user = await prisma.adminUser.create({
      data: { ...data, passwordHash },
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
    });

    await prisma.auditLog.create({
      data: { userId: req.user!.userId, action: "CREATE_USER", entityType: "AdminUser", entityId: user.id },
    });

    sendSuccess(res, user, "User created", 201);
  })
);

router.patch(
  "/users/:id",
  authorize("SUPER_ADMIN"),
  asyncHandler(async (req, res) => {
    const { password, ...data } = req.body;
    const updateData: any = { ...data };
    if (password) {
      updateData.passwordHash = await (await import("../utils/password")).hashPassword(password);
    }
    const user = await prisma.adminUser.update({
      where: { id: req.params.id },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
    });
    sendSuccess(res, user, "User updated");
  })
);

router.delete(
  "/users/:id",
  authorize("SUPER_ADMIN"),
  asyncHandler(async (req, res) => {
    if (req.params.id === req.user!.userId) {
      throw new AppError("Cannot delete your own account", 400);
    }
    await prisma.adminUser.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, "User deleted");
  })
);

// =====================
// Audit Logs
// =====================
router.get(
  "/audit-logs",
  authorize("SUPER_ADMIN"),
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 50);

    const [total, logs] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.findMany({
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    sendSuccess(res, logs, undefined, 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  })
);

export { router as adminRoutes };
export default router;
