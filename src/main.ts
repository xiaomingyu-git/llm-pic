import { createApp } from 'vue';
import App from './App.vue';

// Element Plus按需引入
import {
  ElContainer,
  ElHeader,
  ElMain,
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElRadioGroup,
  ElRadioButton,
  ElSelect,
  ElOption,
  ElTag,
  ElIcon,
  ElMessage,
  ElTabs,
  ElTabPane,
  ElButtonGroup,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElDescriptions,
  ElDescriptionsItem,
  ElResult,
  ElEmpty,
  ElDialog,
  ElTooltip,
  ElDivider,
  ElLoading,
} from 'element-plus';
import 'element-plus/dist/index.css';

// 只注册实际使用的图标
import {
  QuestionFilled,
  Setting,
  Refresh,
  InfoFilled,
  CopyDocument,
  FullScreen,
  CircleCheck,
  Loading,
  Connection,
  CircleClose,
  Warning,
  MagicStick,
  Delete,
  Document,
  Download,
  ZoomIn,
  ZoomOut,
  Plus,
  Minus,
} from '@element-plus/icons-vue';

const app = createApp(App);

// 注册Element Plus组件
app.use(ElContainer);
app.use(ElHeader);
app.use(ElMain);
app.use(ElCard);
app.use(ElForm);
app.use(ElFormItem);
app.use(ElInput);
app.use(ElButton);
app.use(ElRadioGroup);
app.use(ElRadioButton);
app.use(ElSelect);
app.use(ElOption);
app.use(ElTag);
app.use(ElIcon);
app.use(ElTabs);
app.use(ElTabPane);
app.use(ElButtonGroup);
app.use(ElDropdown);
app.use(ElDropdownMenu);
app.use(ElDropdownItem);
app.use(ElDescriptions);
app.use(ElDescriptionsItem);
app.use(ElResult);
app.use(ElEmpty);
app.use(ElDialog);
app.use(ElTooltip);
app.use(ElDivider);
app.use(ElLoading);

// 注册图标
app.component('QuestionFilled', QuestionFilled);
app.component('Setting', Setting);
app.component('Refresh', Refresh);
app.component('InfoFilled', InfoFilled);
app.component('CopyDocument', CopyDocument);
app.component('FullScreen', FullScreen);
app.component('CircleCheck', CircleCheck);
app.component('Loading', Loading);
app.component('Connection', Connection);
app.component('CircleClose', CircleClose);
app.component('Warning', Warning);
app.component('Magic', MagicStick);
app.component('Delete', Delete);
app.component('Document', Document);
app.component('Download', Download);
app.component('ZoomIn', ZoomIn);
app.component('ZoomOut', ZoomOut);
app.component('Plus', Plus);
app.component('Minus', Minus);

// 全局配置ElMessage
app.config.globalProperties.$message = ElMessage;

app.mount('#app');
