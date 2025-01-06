import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 导入 Vant
import {
  Button,
  Field,
  Form,
  Cell,
  CellGroup,
  NavBar,
  Popup,
  Progress,
  Collapse,
  CollapseItem,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  Dialog,
  Space,
  Tabbar,
  TabbarItem
} from 'vant'

// 导入 Vant 样式
import 'vant/lib/index.css'
// 导入全局样式
import './style.css'

const app = createApp(App)

// 注册 Vant 组件
const vantComponents = [
  Button, Field, Form, Cell, CellGroup,
  NavBar, Popup, Progress, Collapse,
  CollapseItem, Checkbox, CheckboxGroup,
  Radio, RadioGroup, Dialog, Space,
  Tabbar, TabbarItem
]

vantComponents.forEach(component => {
  app.use(component)
})

// 注册 Pinia
app.use(createPinia())
// 注册路由
app.use(router)

app.mount('#app') 