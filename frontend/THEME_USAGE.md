# 🎨 Dark Mode & Theme Usage Guide

## Tổng quan
Ứng dụng đã được tích hợp Dark Mode/Light Mode với khả năng bật/tắt trong Profile Settings.

## Cách sử dụng Theme trong Component

### 1. Import useTheme hook:
```javascript
import { useTheme } from '../../../contexts/ThemeContext';
```

### 2. Sử dụng trong Component:
```javascript
function YourComponent() {
    const { theme, isDarkMode, toggleTheme } = useTheme();
    
    return (
        <View style={{ backgroundColor: theme.background }}>
            <Text style={{ color: theme.text }}>Hello World</Text>
        </View>
    );
}
```

## Theme Colors Available

### Background Colors
- `theme.background` - Màu nền chính (#000000 dark / #FFFFFF light)
- `theme.backgroundSecondary` - Màu nền phụ (#1A1A1A dark / #FAFAFA light)
- `theme.backgroundTertiary` - Màu nền tertiary (#2D2D2D dark / #F5F5F5 light)

### Card Colors
- `theme.card` - Màu nền card (#1A1A1A dark / #FFFFFF light)
- `theme.cardBorder` - Màu viền card

### Text Colors
- `theme.text` - Màu chữ chính (#FFFFFF dark / #2D2D2D light)
- `theme.textSecondary` - Màu chữ phụ (#B0B0B0 dark / #757575 light)
- `theme.textTertiary` - Màu chữ tertiary

### Input Colors
- `theme.inputBackground` - Màu nền input
- `theme.inputBorder` - Màu viền input
- `theme.inputText` - Màu chữ trong input
- `theme.inputPlaceholder` - Màu placeholder

### Accent Colors (giữ nguyên cả 2 theme)
- `theme.primary` - #00D4FF (Xanh dương)
- `theme.secondary` - #9D4EDD (Tím)
- `theme.accent` - #FF1493 (Hồng)
- `theme.success` - #06FFA5 (Xanh lá)
- `theme.error` - #FF6B6B (Đỏ)
- `theme.warning` - #FFD700 (Vàng)

### Chat Colors
- `theme.chatBubbleOwn` - Màu chat của mình
- `theme.chatBubbleOther` - Màu chat của người khác
- `theme.chatTextOwn` - Màu chữ chat của mình
- `theme.chatTextOther` - Màu chữ chat của người khác

### Borders & Dividers
- `theme.border` - Màu viền
- `theme.divider` - Màu đường phân cách

### Shadow
- `theme.shadowColor` - Màu shadow
- `theme.shadowOpacity` - Độ trong suốt shadow

### Gradients
- `theme.gradients.instagram` - Gradient Instagram
- `theme.gradients.tiktok` - Gradient TikTok
- `theme.gradients.purple` - Gradient tím
- `theme.gradients.blue` - Gradient xanh

## Ví dụ sử dụng với LinearGradient

```javascript
<LinearGradient
    colors={isDarkMode ? theme.gradients.purple : theme.gradients.instagram}
    style={{ flex: 1 }}
>
    {/* Your content */}
</LinearGradient>
```

## Màn hình đã được update
✅ Edit Profile (có toggle switch để bật/tắt)
✅ Comment Screen
✅ Login & Register (có gradient theo theme)

## Lưu ý
- Theme preference được lưu tự động vào AsyncStorage
- Khi bật/tắt dark mode, tất cả màn hình sẽ tự động cập nhật
- Không cần reload app
