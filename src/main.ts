import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Element Plus样式和图标（自动导入插件会处理组件导入）
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

const app = createApp(App);

// 注册路由
app.use(router);

// 注册Element Plus图标（自动导入插件会处理组件）
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.mount('#app');
