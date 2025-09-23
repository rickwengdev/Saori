<template>
    <div class="container">
        <NavigationBar />
        <button @click="toggleSidebar" class="sidebar-toggle" v-if="isMobile">☰</button>
        <div class="config-container">
            <Sidebar @option-selected="" :class="{ 'hidden': isMobile && isSidebarHidden }" />
            <main class="main-content">
                <section v-if="currentSection === 'tracking'" class="config-section">
                    <h2>Member Tracking Settings</h2>
                    <form @submit.prevent="saveTrackingSettings" class="form">
                        <div class="form-group">
                            <label for="tracking-channel">Tracking Channel:</label>
                            <select id="tracking-channel" v-model="trackingChannel" class="form-select">
                                <option v-if="textChannels.length === 0" disabled>No text channels available</option>
                                <option v-for="channel in textChannels" :key="channel.id" :value="channel.id">{{ channel.name }}</option>
                            </select>
                        </div>
                        <button type="submit" class="save-button">Save</button>
                    </form>
                    <div class="preview">
                        <h3>Current Settings</h3>
                        <p>Tracking Channel: {{ preview.trackingChannel || 'N/A' }}</p>
                    </div>
                </section>
            </main>
        </div>
    </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import NavigationBar from "@/components/NavigationBar.vue";
import apiService from "@/services/apiService";

export default {
    components: { Sidebar, NavigationBar },
    data() {
        return {
            currentSection: "tracking",
            textChannels: [],
            trackingChannel: null,
            preview: {
                trackingChannel: null,
            },
            loading: true,
            isSidebarHidden: false,
            isMobile: window.innerWidth <= 768,
        };
    },
    async created() {
        window.addEventListener('resize', this.checkMobile);
        await this.fetchData();
    },
    async beforeUnmount() {
        window.removeEventListener('resize', this.checkMobile);
    },
    methods: {
        checkMobile() {
            this.isMobile = window.innerWidth <= 768;
        },
        toggleSidebar() {
            if (this.isMobile) {
                this.isSidebarHidden = !this.isSidebarHidden;
            }
        },
        async fetchData() {
            const serverId = this.$route.params.serverId;
            try {
                const channelsResponse = await apiService.get(`/api/${serverId}/channels`);
                const channels = channelsResponse?.channels || [];

                // 過濾文字頻道
                this.textChannels = channels
                    .filter(channel => channel.type === 2)
                    .map(channel => ({
                        id: channel.id,
                        name: channel.name,
                    }));

                const trackingResponse = await apiService.get(`/api/${serverId}/trackingMembers`);
                const config = trackingResponse.config || {};

                // 設置預覽數據
                this.preview = {
                    trackingChannel: this.getChannelName(config.trackingmembers_channel_id),
                };

                this.trackingChannel = config.trackingmembers_channel_id || null;
            } catch (error) {
                console.error("Error fetching data:", error);
                alert("Failed to load data. Please try again.");
            } finally {
                this.loading = false;
            }
        },
        async saveTrackingSettings() {
            const serverId = this.$route.params.serverId;
            try {
                await apiService.post(`/api/${serverId}/trackingMembers`, {
                    trackingChannelId: this.trackingChannel,
                });
                alert("Settings saved successfully!");
                await this.fetchData();
            } catch (error) {
                console.error("Error saving settings:", error);
                alert("Failed to save settings. Please try again.");
            }
        },
        getChannelName(channelId) {
            const channel = this.textChannels.find(channel => channel.id === channelId);
            return channel ? channel.name : "N/A";
        },
    },
};
</script>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: linear-gradient(135deg, #7289da, #4b2c5e);
    color: #ffffff;
}

.sidebar-toggle {
    background: #2e3136;
    color: #ffffff;
    border: none;
    padding: 10px;
    font-size: 18px;
    cursor: pointer;
    position: fixed;
    top: 15px;
    right: 70px;
    z-index: 20;
    border-radius: 5px;
}

.config-container {
    display: flex;
    flex: 1;
}

.sidebar {
    width: 250px;
    background-color: #2e3136;
    padding: 20px;
    transition: transform 0.3s ease;
}

.sidebar.hidden {
    transform: translateX(-100%);
    visibility: hidden;
    position: absolute;
}

.main-content {
    flex: 1;
    padding: 20px;
}

.form {
    background-color: rgba(255, 255, 255, 0.1);
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.form-group {
    margin-bottom: 15px;
}

.form-select {
    width: 100%;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    font-size: 16px;
}

.save-button {
    background-color: #7289da;
    color: #fff;
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    cursor: pointer;
}

.save-button:hover {
    background-color: #5a6bb7;
}

.preview {
    background-color: rgba(255, 255, 255, 0.1);
    padding: 20px;
    border-radius: 8px;
}

h2 {
    margin-bottom: 20px;
    color: #ffffff;
}

@media (min-width: 769px) {
    .sidebar-toggle {
        display: none;
    }
    .sidebar {
        transform: none !important;
        visibility: visible !important;
        position: relative !important;
    }
}
</style>