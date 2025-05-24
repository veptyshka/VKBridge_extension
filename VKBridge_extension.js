Scratch.extensions.register(new (class VKBridgeExtension {
    constructor() {
        this.initialized = false;
        this.userData = {};
        this.viewHidden = false;
        this.bannerAdUpdated = false;

        // VK Bridge load and initialization
        this.loadVKBridge().then(() => {
            console.log("VK Bridge has been succesfully loaded!");
            return this.initVKBridge();
        }).then(() => {
            console.log("VK Bridge has been initialized!");
        }).catch(err => {
            console.error("VK Bridge error:", err);
        });

        // Event subscriptions

        // Hide and restore event
        window.addEventListener("message",  (event) => {
            if (!event.data || !event.data.detail || !event.data.detail.type) return;
            const type = event.data.detail.type;
            if (type === "VKWebAppViewHide") {
                this.viewHidden = true;
            } else if (type === "VKWebAppViewRestore") {
                this.viewHidden = false;
            } else if (type === "VKWebAppBannerAdUpdated") {
                this.bannerAdUpdated = true;
            }
        });

        if (window.vkBridge && window.vkBridge.subscribe) {
            window.vkBridge.subscribe((e) => {
                if (e.detail.type === "VKWebAppViewHide") {
                    this.viewHidden = true;
                } else if (e.detail.type === "VKWebAppViewRestore") {
                    this.viewHidden = false;
                }
            });
        }
    }

    // Load function
    async loadVKBridge() {
        return new Promise(resolve => {
            if (window.vkBridge) return resolve();
            let script = document.createElement("script");
            script.src = "https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js";
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }

    // Init function
    async initVKBridge() {
        try {
            await window.vkBridge.send("VKWebAppInit"); // Init method
            this.initialized = true;
            this.userData = await window.vkBridge.send("VKWebAppGetUserInfo");
        } catch (err) {
            console.error("VK Bridge initialization error:", err);
        }
    }

    // Extension functions

    // General


    // Access and permissions

    // Get access rights from the user
    async getAuthToken(appId, scope) {
        try {
            let data = await window.vkBridge.send("VKWebAppGetAuthToken", {
                app_id: Number(appId),
                scope: scope
            });
            return data.access_token || "Error";
        } catch (err) {
            console.error("Error getting token:", err);
            return "Error";
        }
    }
    // Community token
    // Check data access permission
    async checkAllowedScopes(scopes) {
        try {
            let data = await window.vkBridge.send("VKWebAppCheckAllowedScopes", {
                scopes: scopes.split(",")
            });
    
            return JSON.stringify(data.scopes);
        } catch (err) {
            console.error("Error checking permissions:", err);
            return "Error";
        }
    }
    // Get permission list
    async getGrantedPermissions() {
        try {
            let data = await window.vkBridge.send("VKWebAppGetGrantedPermissions");
            return JSON.stringify(data.permissions);
        } catch (err) {
            console.error("Error getting permissions:", err);
            return "Error";
        }
    }

    // Outlook(?)

    // Navigation

    // Monetization

    // Advertisement
    // Check displayable ads
    async checkNativeAds(adFormat) {
        try {
            let data = await window.vkBridge.send("VKWebAppCheckNativeAds", { ad_format: adFormat });
            return data.result ? "Реклама доступна" : "Реклама недоступна";
        } catch (err) {
            console.error("Error при проверке рекламы:", err);
            return "Error";
        }
    }
    // Show an ad
    async showNativeAds(adFormat) {
        try {
            let data = await window.vkBridge.send("VKWebAppShowNativeAds", { ad_format: adFormat });
            return data.result ? "Реклама показана" : "Error показа рекламы";
        } catch (err) {
            console.error("Error при показе рекламы:", err);
            return "Error";
        }
    }

    // Banners
    // Show banner ad
    async showBannerAd(adFormat) {
        try {
            let data = await window.vkBridge.send("VKWebAppShowBannerAd", {
                banner_location: adFormat // "top" or "bottom"
            });
            return data.result ? "Banner shown" : "Error";
        } catch (err) {
            console.error("Error showung banner:", err);
            return "Error";
        }
    }
    // Check if banner was shown
    async checkBannerAd() {
        try {
            let data = await window.vkBridge.send("VKWebAppCheckBannerAd");
            return data.result ? "Ad open" : "Ad not open";
        } catch (err) {
            console.error("Checking error:", err);
            return "Error";
        }
    }
    // Close banner
    async hideBannerAd() {
        try {
            let data = await window.vkBridge.send("VKWebAppHideBannerAd");
            return data.result ? "Banner closed" : "Error";
        } catch (err) {
            console.error("Error closing banner:", err);
            return "Error";
        }
    }
    // If banner was closed by user
    async checkBannerAdClosedByUser() {
        try {
            let data = await window.vkBridge.send("VKWebAppBannerAdClosedByUser");
            return data.result ? "Banner closed by user" : "Error";
        } catch (err) {
            console.error("Checking error:", err);
            return "Error";
        }
    }

    // Payments

    // Open item purchase window
    async showOrderBox(item) {
        try {
            let data = await window.vkBridge.send("VKWebAppShowOrderBox", { type: "item", item });
            return data.success ? "Payment successfull" : "Error";
        } catch (err) {
            console.error("Payment error:", err);
            return "Error";
        }
    }
    // Open subscription window
    async showSubscriptionBox(item, action) {
        try {
            let data = await window.vkBridge.send("VKWebAppShowSubscriptionBox", {
                item: item,
                action: action // "create", "cancel", "resume"
            });
            return data.result ? `Subscription ${action === "create" ? "created" : action === "cancel" ? "cancelled" : "resumed"}` : "Error";
        } catch (err) {
            console.error("Subscription error:", err);
            return "Error";
        }
    }
    // Open VK Pay window

    // Analytics

    // Users

    // Get user's email
    // Get user's friend list
    async getFriends() {
        try {
            let data = await window.vkBridge.send("VKWebAppGetFriends");
            return data.friends.map(friend => friend.first_name + " " + friend.last_name).join(", ") || "No friends";
        } catch (err) {
            console.error("Error getting friend list:", err);
            return "Error";
        }
    }
    // Get user's geodata
    // Get user's contact card
    // Get user's phone number
    // Get user's profile data
    // Show user's contacts

    // Communities

    // Add app to a community
    // Get permission to send messages from community
    async allowMessagesFromGroup(groupId) {
        try {
            let data = await window.vkBridge.send("VKWebAppAllowMessagesFromGroup", {
                group_id: Number(groupId)
            });
            return data.result ? "Permission granted" : "Error";
        } catch (err) {
            console.error("Error getting permission:", err);
            return "Error";
        }
    }
    // Get access rights
    // Get community info
    // Invite user to join a community
    async joinGroup(groupId) {
        try {
            let data = await window.vkBridge.send("VKWebAppJoinGroup", {
                group_id: Number(groupId)
            });
            return data.result ? "User joined group" : "Error";
        } catch (err) {
            console.error("Error sending invite:", err);
            return "Error";
        }
    }
    // Prompt user to leave a community
    async leaveGroup(groupId) {
        try {
            let data = await window.vkBridge.send("VKWebAppLeaveGroup", {
                group_id: Number(groupId)
            });
            return data.result ? "User left group" : "Error";
        } catch (err) {
            console.error("Error leaving group:", err);
            return "Error";
        }
    }
    // Send event to a community
    // Show community widget before publishing

    // Social mechanics

    // Add app to favorites
    async addToFavorites() {
        try {
            let data = await window.vkBridge.send("VKWebAppAddToFavorites");
            return data.result ? "Added to favorites" : "Error";
        } catch (err) {
            console.error("Error adding to favorites:", err);
            return "Error";
        }
    }
    // Add app to device's home screen
    // Get shortcut info
    // Recommend app to friends
    async recommendApp() {
        try {
            let data = await window.vkBridge.send("VKWebAppRecommend");
            return data.result ? "Recommendation sent" : "Error";
        } catch (err) {
            console.error("Sending error:", err);
            return "Error";
        }
    }
    // Share app link
    async shareLink(link) {
        try {
            let data = await window.vkBridge.send("VKWebAppShare", { link: link });
            return data.result ? "Link sent" : "Error";
        } catch (err) {
            console.error("Sending error:", err);
            return "Error";
        }
    }
    // Open stories editor
    async showStoryBox(backgroundType, url, attachmentType, attachmentUrl, stickerUrl, stickerX, stickerY, stickerWidth) {
        try {
            let stickers = stickerUrl
                ? [{ 
                    sticker_type: "renderable", 
                    content_type: "image", 
                    url: stickerUrl,
                    transform: {
                        translation_x: Number(stickerX), // X-pos (-1 to 1)
                        translation_y: Number(stickerY), // Y-pos (-1 to 1)
                        width: Number(stickerWidth) // Size (0 to 1)
                    }
                }]
                : [];
    
            let data = await window.vkBridge.send("VKWebAppShowStoryBox", {
                background_type: backgroundType, 
                url: url, 
                attachment: attachmentType ? { type: attachmentType, url: attachmentUrl } : null,
                stickers: stickers.length > 0 ? stickers : undefined
            });
    
            return data.result ? "Story published" : "Error";
        } catch (err) {
            console.error("Publishing error:", err);
            return "Error";
        }
    }
    // Subscribe story app
    // Request permission to send notifications
    async allowNotifications() {
        try {
            let data = await window.vkBridge.send("VKWebAppAllowNotifications");
            return data.result ? "Notifications on" : "Error";
        } catch (err) {
            console.error("Error getting permission:", err);
            return "Error";
        }
    }
    // Disable notifications
    async denyNotifications() {
        try {
            let data = await window.vkBridge.send("VKWebAppDenyNotifications");
            return data.result ? "Notifications off" : "Error";
        } catch (err) {
            console.error("Error turning off notifications:", err);
            return "Error";
        }
    }
    // Widget
    // Open a wall post
    async showWallPostBox() {
        try {
            let data = await window.vkBridge.send("VKWebAppShowWallPostBox", {
                message: "Check this game!", // Suggested text
                attachments: "" // Can add url to attachments
            });
            return data.success ? "Post successfully created" : "Error";
        } catch (err) {
            console.error("Error creating post:", err);
            return "Error";
        }
    }
    // Invite friends
    async showInviteBox() {
        try {
            let data = await window.vkBridge.send("VKWebAppShowInviteBox");
            return data.success ? "Invite sent" : "Error";
        } catch (err) {
            console.error("Error sending invite:", err);
            return "Error";
        }
    }

    // Text and media (that's all for now)

    // Copy text
    // Download file
    async downloadFile(url) {
        try {
            let data = await window.vkBridge.send("VKWebAppDownloadFile", { url: url });
            return data.success ? "File downloaded" : "Download error";
        } catch (err) {
            console.error("Download error:", err);
            return "Error";
        }
    }
    // Read a QR code
    //
    //

    // VK Storage

    // Create a key - value
    async storageSet({ KEY, VALUE }) {
        try {
            const data = await window.vkBridge.send("VKWebStorageSet", {
                key: KEY,
                value: VALUE
            });
            return data.result ? "Value saved" : "Error";
        } catch (err) {
            console.error("Storage error:", err);
            return "Error";
        }
    }
    // Get the key value
    async storageGet({ KEY }) {
        try {
            const data = await window.vkBridge.send("VKWebStorageGet", {
                keys: KEY
            });
            if (data.keys && data.keys.length > 0) {
                return data.keys[0].value;
            } else {
                return "";
            }
        } catch (err) {
            console.error("Storage error:", err);
            return "Error";
        }
    }
    // Get all variable names
    async storageGetKeys({ COUNT, OFFSET }) {
        try {
            const data = await window.vkBridge.send("VKWebStorageGetKeys", {
                count: parseInt(COUNT),
                offset: parseInt(OFFSET)
            });
            if (data.keys && data.keys.length > 0) {
                return data.keys.join(", ");
            } else {
                return "";
            }
        } catch (err) {
            console.error("Storage error:", err);
            return "Error";
        }
    }

    // Blocks
    getInfo() {
        return {
            id: "vkbridgeextension",
            name: "VK Bridge",
            blocks: [
                {
                    opcode: "getAuthToken",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "Get token [APP_ID] with permissions [SCOPE]",
                    arguments: {
                        APP_ID: { type: Scratch.ArgumentType.STRING, defaultValue: "1234567" },
                        SCOPE: { type: Scratch.ArgumentType.STRING, defaultValue: "friends" } // Available: photos, video, stories, pages, status, notes, messages, wall, docs, groups, stats, group_messages, market
                    }
                },
                {
                    opcode: "checkAllowedScopes",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "Check access to [SCOPES]",
                    arguments: {
                        SCOPES: { type: Scratch.ArgumentType.STRING, defaultValue: "friends,photos,email" }
                    }
                },
                {
                    opcode: "getGrantedPermissions",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "Get granted permissions"
                },
                {
                    opcode: "checkNativeAds",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "Check ad [FORMAT]",
                    arguments: {
                        FORMAT: { type: Scratch.ArgumentType.STRING, defaultValue: "reward" } // Available: "reward", "interstitial"
                    }
                },
                {
                    opcode: "showNativeAds",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "Show ad [FORMAT]",
                    arguments: {
                        FORMAT: { type: Scratch.ArgumentType.STRING, defaultValue: "reward" }
                    }
                },
                {
                    opcode: "showBannerAd",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "Show banner ad [LOCATION]",
                    arguments: {
                        LOCATION: {
                            type: Scratch.ArgumentType.STRING,
                            menu: "bannerLocations",
                            defaultValue: "bottom"
                        }
                    }
                },
                {
                    opcode: "checkBannerAd",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "Check banner ad open"
                },
                {
                    opcode: "hideBannerAd",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "Hide banner ad"
                },
                {
                    opcode: "isBannerAdUpdatedFlag",
                    blockType: Scratch.BlockType.BOOLEAN,
                    text: "when banner ad updated"
                },
                {
                    opcode: "bannerAdUpdatedHat",
                    blockType: Scratch.BlockType.HAT,
                    text: "When banner ad updated"
                },
                {
                    opcode: "checkBannerAdClosedByUser",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "Check if banner was closed by user"
                },
                {
                    opcode: "showOrderBox",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "Buy [ITEM]",
                    arguments: {
                        ITEM: { type: Scratch.ArgumentType.STRING, defaultValue: "product_id" }
                    }
                },
                {
                    opcode: "showSubscriptionBox",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "[ACTION] subscription [ITEM]",
                    arguments: {
                        ACTION: {
                            type: Scratch.ArgumentType.STRING,
                            menu: "subscriptionActions",
                            defaultValue: "create"
                        },
                        ITEM: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "com.example.subscription"
                        }
                    }
                },
                {
                    opcode: "getFriends",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "Friend list"
                },
                {
                    opcode: "allowMessagesFromGroup",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "Allow messages from group [GROUP_ID]",
                    arguments: {
                        GROUP_ID: { type: Scratch.ArgumentType.STRING, defaultValue: "123456789" }
                    }
                },
                {
                    opcode: "joinGroup",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "Invite to group [GROUP_ID]",
                    arguments: {
                        GROUP_ID: { type: Scratch.ArgumentType.STRING, defaultValue: "123456789" }
                    }
                },
                {
                    opcode: "leaveGroup",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "Leave group [GROUP_ID]",
                    arguments: {
                        GROUP_ID: { type: Scratch.ArgumentType.STRING, defaultValue: "123456789" }
                    }
                },
                {
                    opcode: "addToFavorites",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "Add app to favorites"
                },
                {
                    opcode: "recommendApp",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "Recommend app"
                },
                {
                    opcode: "shareLink",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "Share [LINK]",
                    arguments: {
                        LINK: { type: Scratch.ArgumentType.STRING, defaultValue: "https://vk.com/app1234567" }
                    }
                },
                {
                    opcode: "showStoryBox",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "Share story [BG_TYPE] URL [URL] attachment [ATTACH_TYPE] [ATTACH_URL] sticker [STICKER_URL] X [STICKER_X] Y [STICKER_Y] size [STICKER_W]",
                    arguments: {
                        BG_TYPE: { type: Scratch.ArgumentType.STRING, defaultValue: "image" }, 
                        URL: { type: Scratch.ArgumentType.STRING, defaultValue: "https://example.com/story.jpg" },
                        ATTACH_TYPE: { type: Scratch.ArgumentType.STRING, defaultValue: "" },
                        ATTACH_URL: { type: Scratch.ArgumentType.STRING, defaultValue: "" },
                        STICKER_URL: { type: Scratch.ArgumentType.STRING, defaultValue: "" }, // Sticker link
                        STICKER_X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },  // Pos X (-1 to 1)
                        STICKER_Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },  // Pos Y (-1 to 1)
                        STICKER_W: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.3 } // Size (0 to 1)
                    }
                },
                {
                    opcode: "allowNotifications",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "Turn on notifications"
                },
                {
                    opcode: "denyNotifications",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "Turn off notifications"
                },
                {
                    opcode: "showWallPostBox",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "Share a post"
                },
                {
                    opcode: "showInviteBox",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "Invite friends"
                },
                {
                    opcode: "downloadFile",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "Download file [URL]",
                    arguments: {
                        URL: { type: Scratch.ArgumentType.STRING, defaultValue: "https://example.com/file.jpg" }
                    }
                },
                {
                    opcode: "storageSet",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "Save key [KEY] to storage with value [VALUE]",
                    arguments: {
                        KEY: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "example"
                        },
                        VALUE: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "example_value"
                        }
                    }
                },
                {
                    opcode: "storageGet",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "Get value from storage by key [KEY]",
                    arguments: {
                        KEY: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "example"
                        }
                    }
                },
                {
                    opcode: "storageGetKeys",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "Get [COUNT] keys from storage with offset [OFFSET]",
                    arguments: {
                        COUNT: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 10
                        },
                        OFFSET: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: "isViewHidden",
                    blockType: Scratch.BlockType.BOOLEAN,
                    text: "Is app hidden?"
                }
            ],
            menus: this.menus()
        };
    }
    menus() {
        return {
            bannerLocations: {
                acceptReporters: false,
                items: ["top", "bottom"]
            }
        };
    }

    getUserID() {
        return this.userData.id || "Unknown";
    }

    getUserName() {
        return this.userData.first_name || "Unknown";
    }

    isViewHidden() {
        return this.viewHidden;
    }

    isBannerAdUpdatedFlag() {
        const result = this.bannerAdUpdated;
        this.bannerAdUpdated = false;
        return result;
    }

    bannerAdUpdatedHat() {
        if (this.bannerAdUpdated) {
            this.bannerAdUpdated = false;
            return true;
        }
        return false;
    }
})());