import { createRouter, createWebHashHistory } from 'vue-router';
import SplitView from './views/SplitView.vue';
import { SPLIT_RULES } from './lib/split.js';

// Hash history vì GitHub Pages không rewrite đường dẫn về index.html.
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'split',
      component: SplitView,
      meta: {
        docTitle: 'Chia Tiền Cầu Lông',
        title: 'Chia tiền',
        accent: 'cầu lông',
        chips: SPLIT_RULES,
        navLabel: 'Chia tiền cầu lông',
        note: 'Bạn thanh toán, host thank you 🏸',
      },
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('./views/StatsView.vue'),
      meta: {
        docTitle: 'Thành Tích Cầu Lông',
        title: 'Thành tích',
        accent: 'cá nhân',
        navLabel: 'Thành tích cá nhân',
      },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
});

router.afterEach((to) => {
  document.title = to.meta.docTitle ?? 'Cầu Lông';
});

export default router;
