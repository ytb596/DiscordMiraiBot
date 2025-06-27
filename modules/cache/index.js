const fs = require('fs');
const path = require('path');
const logger = require('../../utility/logger');

class CacheManager {
    constructor() {
        this.cache = new Map();
        this.cacheDir = path.join(__dirname, 'data');
        this.maxSize = 1000; // Maximum cache entries
        this.defaultTTL = 3600000; // 1 hour in milliseconds
        
        this.init();
    }

    init() {
        // Create cache directory if it doesn't exist
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
        }

        // Load persistent cache
        this.loadPersistentCache();

        // Setup cleanup interval (every 10 minutes)
        setInterval(() => {
            this.cleanup();
        }, 600000);

        logger.info('🗄️  Cache system initialized');
    }

    /**
     * Set a value in cache
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttl - Time to live in milliseconds
     * @param {boolean} persistent - Whether to persist to disk
     */
    set(key, value, ttl = this.defaultTTL, persistent = false) {
        if (this.cache.size >= this.maxSize) {
            this.evictOldest();
        }

        const entry = {
            value,
            createdAt: Date.now(),
            expiresAt: Date.now() + ttl,
            persistent,
            accessed: Date.now(),
            hits: 0
        };

        this.cache.set(key, entry);

        if (persistent) {
            this.saveToDisk(key, entry);
        }

        logger.debug(`📝 Cached: ${key} (TTL: ${ttl}ms, Persistent: ${persistent})`);
    }

    /**
     * Get a value from cache
     * @param {string} key - Cache key
     * @returns {any} Cached value or null if not found/expired
     */
    get(key) {
        const entry = this.cache.get(key);

        if (!entry) {
            logger.debug(`❌ Cache miss: ${key}`);
            return null;
        }

        if (Date.now() > entry.expiresAt) {
            this.delete(key);
            logger.debug(`⏰ Cache expired: ${key}`);
            return null;
        }

        // Update access statistics
        entry.accessed = Date.now();
        entry.hits++;

        logger.debug(`✅ Cache hit: ${key} (hits: ${entry.hits})`);
        return entry.value;
    }

    /**
     * Delete a cache entry
     * @param {string} key - Cache key
     */
    delete(key) {
        const entry = this.cache.get(key);
        
        if (entry && entry.persistent) {
            this.deleteFromDisk(key);
        }

        this.cache.delete(key);
        logger.debug(`🗑️  Cache deleted: ${key}`);
    }

    /**
     * Check if a key exists in cache
     * @param {string} key - Cache key
     * @returns {boolean}
     */
    has(key) {
        const entry = this.cache.get(key);
        
        if (!entry) return false;
        
        if (Date.now() > entry.expiresAt) {
            this.delete(key);
            return false;
        }

        return true;
    }

    /**
     * Clear all cache entries
     * @param {boolean} includePersistent - Whether to clear persistent cache too
     */
    clear(includePersistent = false) {
        if (includePersistent) {
            this.clearPersistentCache();
        } else {
            // Only clear non-persistent entries
            for (const [key, entry] of this.cache.entries()) {
                if (!entry.persistent) {
                    this.cache.delete(key);
                }
            }
        }

        if (includePersistent) {
            this.cache.clear();
        }

        logger.info(`🧹 Cache cleared (persistent: ${includePersistent})`);
    }

    /**
     * Get cache statistics
     * @returns {object} Cache statistics
     */
    getStats() {
        const stats = {
            size: this.cache.size,
            maxSize: this.maxSize,
            entries: {},
            totalHits: 0,
            persistentEntries: 0
        };

        for (const [key, entry] of this.cache.entries()) {
            stats.entries[key] = {
                createdAt: entry.createdAt,
                expiresAt: entry.expiresAt,
                accessed: entry.accessed,
                hits: entry.hits,
                persistent: entry.persistent,
                ttl: entry.expiresAt - Date.now()
            };

            stats.totalHits += entry.hits;
            if (entry.persistent) stats.persistentEntries++;
        }

        return stats;
    }

    /**
     * Cleanup expired entries
     */
    cleanup() {
        const now = Date.now();
        let cleaned = 0;

        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.delete(key);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            logger.debug(`🧹 Cleaned up ${cleaned} expired cache entries`);
        }
    }

    /**
     * Evict the oldest entry when cache is full
     */
    evictOldest() {
        let oldestKey = null;
        let oldestTime = Date.now();

        for (const [key, entry] of this.cache.entries()) {
            if (entry.accessed < oldestTime) {
                oldestTime = entry.accessed;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.delete(oldestKey);
            logger.debug(`♻️  Evicted oldest cache entry: ${oldestKey}`);
        }
    }

    /**
     * Save cache entry to disk
     * @param {string} key - Cache key
     * @param {object} entry - Cache entry
     */
    saveToDisk(key, entry) {
        try {
            const filePath = path.join(this.cacheDir, `${this.sanitizeKey(key)}.json`);
            fs.writeFileSync(filePath, JSON.stringify(entry, null, 2));
        } catch (error) {
            logger.error(`Failed to save cache to disk: ${key}`, error);
        }
    }

    /**
     * Delete cache entry from disk
     * @param {string} key - Cache key
     */
    deleteFromDisk(key) {
        try {
            const filePath = path.join(this.cacheDir, `${this.sanitizeKey(key)}.json`);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            logger.error(`Failed to delete cache from disk: ${key}`, error);
        }
    }

    /**
     * Load persistent cache from disk
     */
    loadPersistentCache() {
        try {
            if (!fs.existsSync(this.cacheDir)) return;

            const files = fs.readdirSync(this.cacheDir).filter(file => file.endsWith('.json'));

            for (const file of files) {
                try {
                    const filePath = path.join(this.cacheDir, file);
                    const entry = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    const key = this.unsanitizeKey(path.basename(file, '.json'));

                    // Check if entry is still valid
                    if (Date.now() < entry.expiresAt) {
                        this.cache.set(key, entry);
                        logger.debug(`📂 Loaded persistent cache: ${key}`);
                    } else {
                        // Remove expired persistent cache
                        fs.unlinkSync(filePath);
                        logger.debug(`🗑️  Removed expired persistent cache: ${key}`);
                    }
                } catch (error) {
                    logger.error(`Failed to load cache file ${file}:`, error);
                }
            }

            logger.info(`📂 Loaded ${this.cache.size} persistent cache entries`);
        } catch (error) {
            logger.error('Failed to load persistent cache:', error);
        }
    }

    /**
     * Clear all persistent cache files
     */
    clearPersistentCache() {
        try {
            if (!fs.existsSync(this.cacheDir)) return;

            const files = fs.readdirSync(this.cacheDir);
            for (const file of files) {
                fs.unlinkSync(path.join(this.cacheDir, file));
            }

            logger.info('🧹 Cleared all persistent cache files');
        } catch (error) {
            logger.error('Failed to clear persistent cache:', error);
        }
    }

    /**
     * Sanitize cache key for filename
     * @param {string} key - Original key
     * @returns {string} Sanitized key
     */
    sanitizeKey(key) {
        return key.replace(/[^a-zA-Z0-9_-]/g, '_');
    }

    /**
     * Unsanitize cache key from filename
     * @param {string} sanitizedKey - Sanitized key
     * @returns {string} Original key (approximation)
     */
    unsanitizeKey(sanitizedKey) {
        return sanitizedKey;
    }
}

module.exports = new CacheManager();
