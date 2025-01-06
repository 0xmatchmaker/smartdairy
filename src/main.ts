import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

// 如果使用了 Vant UI
import 'vant/lib/index.css'
import { 
  Button,
  NavBar,
  Popup,
  Field,
  RadioGroup,
  Radio,
  Space,
  CellGroup,
  Cell,
  Toast,
  Empty,
  Loading,
  Tag,
  Icon,
  Dialog,
  Notify
} from 'vant'

const app = createApp(App)

// 注册 Vant 组件
const vantComponents = [
  Button,
  NavBar,
  Popup,
  Field,
  RadioGroup,
  Radio,
  Space,
  CellGroup,
  Cell,
  Toast,
  Empty,
  Loading,
  Tag,
  Icon,
  Dialog,
  Notify
]

vantComponents.forEach(component => {
  app.use(component)
})

app.use(createPinia())
app.use(router)

app.mount('#app') 