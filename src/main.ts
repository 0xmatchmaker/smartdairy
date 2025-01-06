import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { 
  Tabbar, 
  TabbarItem,
  Tab,
  Tabs,
  Cell,
  CellGroup,
  Button,
  Field,
  NavBar,
  Popup,
  Dialog,
  Toast,
  Tag,
  Progress,
  Space,
  RadioGroup,
  Radio,
  Icon,
  Empty
} from 'vant'
import 'vant/lib/index.css'

const app = createApp(App)

// 注册 Vant 组件
const vantComponents = [
  Tabbar, 
  TabbarItem,
  Tab,
  Tabs,
  Cell,
  CellGroup,
  Button,
  Field,
  NavBar,
  Popup,
  Dialog,
  Toast,
  Tag,
  Progress,
  Space,
  RadioGroup,
  Radio,
  Icon,
  Empty
]

vantComponents.forEach(component => {
  app.use(component)
})

app.use(createPinia())
app.use(router)
app.mount('#app') 