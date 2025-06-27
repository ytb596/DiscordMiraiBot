class PermissionManager {
    constructor() {
        this.config = require('../config');
    }

    /**
     * Check if user is main admin
     * @param {string} userId - User ID to check
     * @returns {boolean}
     */
    isMainAdmin(userId) {
        return this.config.admins.main.includes(userId);
    }

    /**
     * Check if user is sub admin
     * @param {string} userId - User ID to check
     * @returns {boolean}
     */
    isSubAdmin(userId) {
        return this.config.admins.sub.includes(userId);
    }

    /**
     * Check if user is any admin level
     * @param {string} userId - User ID to check
     * @returns {boolean}
     */
    isAdmin(userId) {
        return this.isMainAdmin(userId) || this.isSubAdmin(userId);
    }

    /**
     * Check if user is bot owner
     * @param {string} userId - User ID to check
     * @returns {boolean}
     */
    isOwner(userId) {
        return this.config.owners.includes(userId);
    }

    /**
     * Check if user has highest permissions (owner or main admin)
     * @param {string} userId - User ID to check
     * @returns {boolean}
     */
    hasHighestPermissions(userId) {
        return this.isOwner(userId) || this.isMainAdmin(userId);
    }

    /**
     * Get user permission level
     * @param {string} userId - User ID to check
     * @returns {string} Permission level
     */
    getUserLevel(userId) {
        if (this.isOwner(userId)) return 'Owner';
        if (this.isMainAdmin(userId)) return 'Main Admin';
        if (this.isSubAdmin(userId)) return 'Sub Admin';
        return 'User';
    }

    /**
     * Check if guild is approved
     * @param {string} guildId - Guild ID to check
     * @returns {boolean}
     */
    isGuildApproved(guildId) {
        return this.config.guilds.approved.includes(guildId);
    }

    /**
     * Check if guild is blacklisted
     * @param {string} guildId - Guild ID to check
     * @returns {boolean}
     */
    isGuildBlacklisted(guildId) {
        return this.config.guilds.blacklisted.includes(guildId);
    }

    /**
     * Check if guild is pending approval
     * @param {string} guildId - Guild ID to check
     * @returns {boolean}
     */
    isGuildPending(guildId) {
        return this.config.guilds.pending.includes(guildId);
    }

    /**
     * Check if user can use bot in guild
     * @param {string} userId - User ID
     * @param {string} guildId - Guild ID
     * @returns {boolean}
     */
    canUseInGuild(userId, guildId) {
        // Owners and main admins can use bot anywhere
        if (this.hasHighestPermissions(userId)) return true;
        
        // Check if guild is blacklisted
        if (this.isGuildBlacklisted(guildId)) return false;
        
        // Check if guild is approved
        if (this.isGuildApproved(guildId)) return true;
        
        // Sub admins can use in pending guilds
        if (this.isSubAdmin(userId) && this.isGuildPending(guildId)) return true;
        
        return false;
    }

    /**
     * Get guild status
     * @param {string} guildId - Guild ID
     * @returns {string} Guild status
     */
    getGuildStatus(guildId) {
        if (this.isGuildBlacklisted(guildId)) return 'Blacklisted';
        if (this.isGuildApproved(guildId)) return 'Approved';
        if (this.isGuildPending(guildId)) return 'Pending';
        return 'Unknown';
    }

    /**
     * Add guild to approved list
     * @param {string} guildId - Guild ID
     */
    approveGuild(guildId) {
        if (!this.config.guilds.approved.includes(guildId)) {
            this.config.guilds.approved.push(guildId);
        }
        // Remove from pending if exists
        const pendingIndex = this.config.guilds.pending.indexOf(guildId);
        if (pendingIndex > -1) {
            this.config.guilds.pending.splice(pendingIndex, 1);
        }
    }

    /**
     * Add guild to pending list
     * @param {string} guildId - Guild ID
     */
    addPendingGuild(guildId) {
        if (!this.config.guilds.pending.includes(guildId) && 
            !this.config.guilds.approved.includes(guildId) &&
            !this.config.guilds.blacklisted.includes(guildId)) {
            this.config.guilds.pending.push(guildId);
        }
    }

    /**
     * Blacklist a guild
     * @param {string} guildId - Guild ID
     */
    blacklistGuild(guildId) {
        // Add to blacklist
        if (!this.config.guilds.blacklisted.includes(guildId)) {
            this.config.guilds.blacklisted.push(guildId);
        }
        
        // Remove from approved and pending
        const approvedIndex = this.config.guilds.approved.indexOf(guildId);
        if (approvedIndex > -1) {
            this.config.guilds.approved.splice(approvedIndex, 1);
        }
        
        const pendingIndex = this.config.guilds.pending.indexOf(guildId);
        if (pendingIndex > -1) {
            this.config.guilds.pending.splice(pendingIndex, 1);
        }
    }
}

module.exports = new PermissionManager();