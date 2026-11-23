import { randomBytes, createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { PasswordReset, Record, User } from "./models.js";

const roles = new Set(["student", "teacher", "admin"]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const resourcePattern = /^[a-z0-9][a-z0-9-]{0,63}$/;
const passwordTokenHash = (token) =>
  createHash("sha256").update(token).digest("hex");

const asyncRoute = (handler) => (request, response, next) => {
  Promise.resolve(handler(request, response, next)).catch(next);
};

const validPayload = (data) =>
  data !== null &&
  typeof data === "object" &&
  !Array.isArray(data) &&
  !Object.hasOwn(data, "_id") &&
  !Object.hasOwn(data, "ownerId") &&
  !Object.hasOwn(data, "resource");

const publicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
});

const createToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }
  return jwt.sign({ role: user.role }, process.env.JWT_SECRET, {
    subject: user._id.toString(),
    expiresIn: "7d",
  });
};

const requireAuth = (request, response, next) => {
  const authorization = request.get("authorization") || "";
  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token) {
    return response.status(401).json({ error: "Please sign in to continue." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    request.auth = { userId: payload.sub, role: payload.role };
    return next();
  } catch {
    return response.status(401).json({ error: "Your session is invalid or expired. Please sign in again." });
  }
};

export const createApp = () => {
  const app = express();
  const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(cors({ origin: frontendOrigin }));
  app.use(express.json({ limit: "4mb" }));

  app.get("/api/health", (_request, response) => {
    const connected = mongoose.connection.readyState === 1;
    response.status(connected ? 200 : 503).json({
      status: connected ? "ok" : "database-unavailable",
    });
  });

  const authRouter = express.Router();
  authRouter.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }));

  authRouter.post("/register", asyncRoute(async (request, response) => {
    const { name, email, password, role } = request.body || {};
    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 120 ||
      typeof email !== "string" ||
      !emailPattern.test(email.trim()) ||
      typeof password !== "string" ||
      password.length < 6 ||
      !roles.has(role)
    ) {
      return response.status(400).json({ error: "Enter a valid name, email, password, and role." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
      return response.status(409).json({ error: "An account with this email already exists. Please sign in." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      role,
      passwordHash,
    });
    return response.status(201).json({ user: publicUser(user), token: createToken(user) });
  }));

  authRouter.post("/login", asyncRoute(async (request, response) => {
    const { email, password, role } = request.body || {};
    if (
      typeof email !== "string" ||
      !emailPattern.test(email.trim()) ||
      typeof password !== "string" ||
      !roles.has(role)
    ) {
      return response.status(400).json({ error: "Please enter your email, password, and role." });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.passwordHash)) || user.role !== role) {
      return response.status(401).json({ error: "Email, password, or role is incorrect." });
    }

    return response.json({ user: publicUser(user), token: createToken(user) });
  }));

  authRouter.post("/password-reset/request", asyncRoute(async (request, response) => {
    const email = request.body?.email;
    if (typeof email !== "string" || !emailPattern.test(email.trim())) {
      return response.status(400).json({ error: "Enter a valid email address." });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return response.json({ resetToken: null });

    await PasswordReset.deleteMany({ userId: user._id });
    const resetToken = randomBytes(32).toString("hex");
    await PasswordReset.create({
      userId: user._id,
      tokenHash: passwordTokenHash(resetToken),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });
    return response.json({ resetToken });
  }));

  authRouter.get("/password-reset/:token", asyncRoute(async (request, response) => {
    const token = request.params.token;
    const valid = typeof token === "string" &&
      await PasswordReset.exists({
        tokenHash: passwordTokenHash(token),
        expiresAt: { $gt: new Date() },
      });
    return response.json({ valid: Boolean(valid) });
  }));

  authRouter.post("/password-reset", asyncRoute(async (request, response) => {
    const { token, password } = request.body || {};
    if (typeof token !== "string" || typeof password !== "string" || password.length < 6) {
      return response.status(400).json({ error: "Enter a valid reset token and a password of at least 6 characters." });
    }

    const reset = await PasswordReset.findOne({
      tokenHash: passwordTokenHash(token),
      expiresAt: { $gt: new Date() },
    });
    if (!reset) {
      return response.status(400).json({ error: "Reset link is invalid or expired. Request a new one." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await User.findByIdAndUpdate(reset.userId, { passwordHash });
    await PasswordReset.deleteMany({ userId: reset.userId });
    return response.json({ message: "Password updated successfully." });
  }));

  app.use("/api/auth", authRouter);

  const recordsRouter = express.Router({ mergeParams: true });
  recordsRouter.use(requireAuth);
  recordsRouter.use((request, response, next) => {
    if (!resourcePattern.test(request.params.resource)) {
      return response.status(400).json({ error: "Invalid record resource." });
    }
    return next();
  });

  recordsRouter.get("/", asyncRoute(async (request, response) => {
    const records = await Record.find({
      ownerId: request.auth.userId,
      resource: request.params.resource,
    }).sort({ createdAt: -1 }).lean();
    return response.json({
      records: records.map(({ _id, data }) => ({ ...data, id: _id.toString() })),
    });
  }));

  recordsRouter.post("/", asyncRoute(async (request, response) => {
    if (!validPayload(request.body?.data)) {
      return response.status(400).json({ error: "Record data must be an object." });
    }

    const record = await Record.create({
      ownerId: request.auth.userId,
      resource: request.params.resource,
      data: request.body.data,
    });
    return response.status(201).json({
      record: { ...record.data, id: record._id.toString() },
    });
  }));

  recordsRouter.put("/:id", asyncRoute(async (request, response) => {
    if (!mongoose.isValidObjectId(request.params.id) || !validPayload(request.body?.data)) {
      return response.status(400).json({ error: "Invalid record ID or record data." });
    }

    const record = await Record.findOneAndUpdate(
      {
        _id: request.params.id,
        ownerId: request.auth.userId,
        resource: request.params.resource,
      },
      { $set: { data: request.body.data } },
      { new: true, runValidators: true }
    ).lean();
    if (!record) return response.status(404).json({ error: "Record not found." });

    return response.json({ record: { ...record.data, id: record._id.toString() } });
  }));

  recordsRouter.delete("/:id", asyncRoute(async (request, response) => {
    if (!mongoose.isValidObjectId(request.params.id)) {
      return response.status(400).json({ error: "Invalid record ID." });
    }
    const result = await Record.deleteOne({
      _id: request.params.id,
      ownerId: request.auth.userId,
      resource: request.params.resource,
    });
    if (!result.deletedCount) return response.status(404).json({ error: "Record not found." });
    return response.json({ deleted: true });
  }));

  app.use("/api/records/:resource", recordsRouter);

  app.use((error, _request, response, _next) => {
    console.error(error);
    if (error.type === "entity.too.large") {
      return response.status(413).json({ error: "Request is too large. Files must be smaller than 2 MB." });
    }
    if (error.code === 11000) {
      return response.status(409).json({ error: "An account with this email already exists. Please sign in." });
    }
    if (error.name === "ValidationError" || error.name === "CastError") {
      return response.status(400).json({ error: "The submitted data is invalid." });
    }
    return response.status(500).json({ error: "The server could not complete the request." });
  });

  return app;
};
