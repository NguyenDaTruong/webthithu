# Frontend Project Structure

## 📁 Cấu trúc thư mục chuẩn

```
frontend/src/
├── components/          # React components tái sử dụng
│   ├── TextType.js     # Typing effect component
│   ├── PracticeExam.js # Main exam component
│   ├── DarkVeil.jsx    # Background animation
│   ├── SplitText.js    # Text animation
│   ├── CardNav.jsx     # Navigation cards
│   └── LogoLoop.jsx    # Logo animation
├── pages/              # Page components
│   ├── HomePage.js     # Trang chủ
│   ├── QuizPage.js     # Trang thi thử
│   └── ExamPage.js     # Trang thi thật
├── styles/             # CSS files
│   ├── PracticeExam.css
│   ├── TextType.css
│   ├── homepage.css
│   ├── CardNav.css
│   ├── DarkVeil.css
│   └── LogoLoop.css
├── services/           # API services
├── store/              # State management
└── public/             # Static assets
```

## 🎯 Quy tắc tổ chức

### **Components** (`/components`)
- Chứa các React components tái sử dụng
- Mỗi component có thể có logic phức tạp
- Không chứa CSS files
- Import CSS từ thư mục `/styles`

### **Pages** (`/pages`)
- Chứa các trang chính của ứng dụng
- Sử dụng components từ `/components`
- Import CSS từ `/styles`

### **Styles** (`/styles`)
- Chứa tất cả CSS files
- Mỗi component có CSS riêng
- Sử dụng naming convention: `ComponentName.css`

### **Services** (`/services`)
- Chứa logic gọi API
- Xử lý data từ backend

### **Store** (`/store`)
- Quản lý state toàn cục
- Redux, Context API, hoặc state management khác

## 🔧 Import Paths

```javascript
// Import component
import TextType from '../components/TextType';

// Import CSS
import '../styles/TextType.css';

// Import page
import HomePage from '../pages/HomePage';
```

## 📝 Naming Convention

- **Components**: PascalCase (ví dụ: `TextType.js`)
- **Pages**: PascalCase (ví dụ: `HomePage.js`)
- **CSS**: PascalCase (ví dụ: `TextType.css`)
- **Services**: camelCase (ví dụ: `apiService.js`)

## 🚀 Best Practices

1. **Tách biệt concerns**: Logic, UI, và styles riêng biệt
2. **Reusable components**: Tạo components có thể tái sử dụng
3. **Consistent imports**: Sử dụng relative paths nhất quán
4. **CSS organization**: Mỗi component có CSS file riêng
5. **Clear structure**: Dễ dàng tìm và maintain code
