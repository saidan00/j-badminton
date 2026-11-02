import { createApp } from 'vue';
import App from './App.vue';
import { i18n } from './i18n.js';
import router from './router.js';
import './styles/base.css';

const app = createApp(App).use(i18n).use(router);
// Chờ router xong để header có tiêu đề ngay lần vẽ đầu.
router.isReady().then(() => app.mount('#app'));
