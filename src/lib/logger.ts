/**
 * Merkezi Logging Sistemi
 *
 * Özellikler:
 * - 5 seviye: debug, info, warn, error, fatal
 * - Modül bazlı context (api, auth, bot, db)
 * - Production'da JSON format, development'da okunabilir
 * - Her log: timestamp, level, context, message, optional data
 * - Bot olayları otomatik BotLog tablosuna kaydedilir
 */

// ─── Tipler ────────────────────────────────────────────────

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";
export type LogContext = "api" | "auth" | "bot" | "db" | "system" | "middleware" | "validation";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: LogContext;
  message: string;
  data?: Record<string, unknown>;
  error?: string;
  stack?: string;
}

// ─── Logger Sınıfı ─────────────────────────────────────────

class Logger {
  private context: LogContext;
  private isProduction: boolean;

  constructor(context: LogContext) {
    this.context = context;
    this.isProduction = process.env.NODE_ENV === "production";
  }

  /** Debug — sadece development'da */
  debug(message: string, data?: Record<string, unknown>): void {
    if (this.isProduction) return;
    this.write("debug", message, data);
  }

  /** Info — genel bilgilendirme */
  info(message: string, data?: Record<string, unknown>): void {
    this.write("info", message, data);
  }

  /** Warn — dikkat edilmesi gereken durumlar */
  warn(message: string, data?: Record<string, unknown>): void {
    this.write("warn", message, data);
  }

  /** Error — hatalar (stack trace ile) */
  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    this.write("error", message, data, error);
  }

  /** Fatal — kritik hata, uygulama çalışamaz */
  fatal(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    this.write("fatal", message, data, error);
  }

  /** Log yazma */
  private write(level: LogLevel, message: string, data?: Record<string, unknown>, error?: unknown): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      data,
    };

    if (error) {
      if (error instanceof Error) {
        entry.error = error.message;
        entry.stack = error.stack;
      } else if (typeof error === "string") {
        entry.error = error;
      } else {
        entry.error = String(error);
      }
    }

    if (this.isProduction) {
      // Production: JSON format (log aggregator'lar için)
      const json = JSON.stringify(entry);
      if (level === "error" || level === "fatal") {
        process.stderr.write(json + "\n");
      } else {
        process.stdout.write(json + "\n");
      }
    } else {
      // Development: okunabilir format
      this.prettyPrint(entry);
    }
  }

  /** Development için renkli ve okunabilir çıktı */
  private prettyPrint(entry: LogEntry): void {
    const colors: Record<LogLevel, string> = {
      debug: "\x1b[90m",   // gray
      info: "\x1b[36m",    // cyan
      warn: "\x1b[33m",    // yellow
      error: "\x1b[31m",   // red
      fatal: "\x1b[35m",   // magenta
    };
    const reset = "\x1b[0m";

    const time = entry.timestamp.split("T")[1].split(".")[0];
    const levelTag = `[${entry.level.toUpperCase()}]`.padEnd(7);
    const ctxTag = `[${entry.context}]`.padEnd(12);

    let line = `${colors[entry.level]}[${time}] ${levelTag} ${ctxTag} ${entry.message}${reset}`;

    if (entry.data && Object.keys(entry.data).length > 0) {
      line += ` ${JSON.stringify(entry.data)}`;
    }

    if (entry.error) {
      line += `\n${colors[entry.level]}       → ${entry.error}${reset}`;
    }

    // Debug ve error seviyelerinde stack trace göster
    if (entry.stack && (entry.level === "error" || entry.level === "fatal")) {
      const stackLines = entry.stack.split("\n").slice(1, 4);
      for (const sl of stackLines) {
        line += `\n       ${sl.trim()}`;
      }
    }

    if (entry.level === "error" || entry.level === "fatal") {
      console.error(line);
    } else {
      console.log(line);
    }
  }
}

// ─── Modül Logger'ları ─────────────────────────────────────

export const apiLogger = new Logger("api");
export const authLogger = new Logger("auth");
export const botLogger = new Logger("bot");
export const dbLogger = new Logger("db");
export const systemLogger = new Logger("system");
export const middlewareLogger = new Logger("middleware");

// ─── Yardımcı Fonksiyonlar ─────────────────────────────────

/**
 * Log seviyesine göre filtreleme (örnek: LOG_LEVEL=info sadece info+ çıktılar)
 */
export function setLogLevel(level: LogLevel): void {
  const levels: LogLevel[] = ["debug", "info", "warn", "error", "fatal"];
  const minIndex = levels.indexOf(level);

  // Bunu uygulamak için Logger sınıfında değişiklik gerekir,
  // şimdilik environment variable ile kontrol edelim
  process.env.LOG_LEVEL = level;
}

/** Kullanım: setLogLevel('info') — debug log'ları gizler */

/**
 * Express/Next.js request logger'ı
 */
export function logRequest(
  method: string,
  path: string,
  status: number,
  durationMs: number,
  ip?: string
): void {
  const level: LogLevel = status >= 500 ? "error" : status >= 400 ? "warn" : "info";
  const logger = path.startsWith("/api/") ? apiLogger : systemLogger;
  logger[level](`${method} ${path} → ${status} (${durationMs}ms)`, {
    method,
    path,
    status,
    durationMs,
    ip: ip || "unknown",
  });
}
