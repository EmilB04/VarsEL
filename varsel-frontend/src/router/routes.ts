import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue'), meta: { title: 'nav.today' } },
      { path: 'history', component: () => import('pages/HistoryPage.vue'), meta: { title: 'nav.history' } },
      { path: 'notifications', component: () => import('pages/NotificationPage.vue'), meta: { title: 'nav.notifications' } },
      { path: 'about', component: () => import('pages/AboutPage.vue'), meta: { title: 'nav.about' } },
      { path: ':catchAll(.*)*', component: () => import('pages/ErrorNotFound.vue'), meta: { title: 'errorNotFound.title' } },
    ],
  },
];

export default routes;
