import { vi } from "vitest";

// Mock env pour les tests
process.env.NODE_ENV = "test";
process.env.MONGODB_URI = "mongodb://localhost:27017/contentiq_test";
process.env.REDIS_URL = "redis://localhost:6379";
process.env.JWT_ACCESS_SECRET = "test_access_secret_minimum_32_chars_ok";
process.env.JWT_REFRESH_SECRET = "test_refresh_secret_minimum_32_chars_ok";
process.env.ANTHROPIC_API_KEY = "sk-ant-test-key-placeholder";
process.env.JWT_ACCESS_EXPIRY = "15m";
process.env.JWT_REFRESH_EXPIRY = "7d";
process.env.CLIENT_URL = "http://localhost:5173";
process.env.EMAIL_FROM = "test@contentiq.app";
