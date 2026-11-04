import { createRouter, createWebHashHistory } from 'vue-router';
import SplitView from './views/SplitView.vue';
import { useSplitMode } from './composables/useSplitMode.js';
import { splitRules } from './lib/split.js';

// Hash history vì GitHub Pages không rewrite đường dẫn về index.html.
// meta chứa key i18n (split.*, stats.*) để header/footer/tiêu đề tab đổi theo ngôn ngữ.
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'split',
      component: SplitView,
      meta: { i18nKey: 'split', chips: () => splitRules(useSplitMode().value), note: true },
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('./views/StatsView.vue'),
      meta: { i18nKey: 'stats' },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
});

export default router;
