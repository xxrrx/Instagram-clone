# Hướng dẫn Deploy Firebase Cloud Functions cho Followers

## ✅ Đã hoàn thành

1. ✅ Tạo file `package.json` trong `backend/functions`
2. ✅ Cập nhật Cloud Functions code trong `index.js`
3. ⏳ Đang cài đặt dependencies (npm install)

## 📝 Các bước tiếp theo

### Bước 1: Cài đặt dependencies

Nếu `npm install` đang chạy, hãy đợi cho đến khi hoàn tất. Nếu bị treo, hãy:

```bash
# Dừng lệnh hiện tại (Ctrl+C)
# Sau đó chạy lại:
cd "c:\Users\ACER\OneDrive\Desktop\New folder (2)\instagram-expo-sdk-51\instagram-expo-sdk-51\backend\functions"
npm install
```

**Kết quả mong đợi:**
- Thư mục `node_modules` được tạo
- File `package-lock.json` được tạo
- Thông báo "added X packages"

### Bước 2: Cài đặt Firebase CLI (nếu chưa có)

```bash
npm install -g firebase-tools
```

### Bước 3: Login vào Firebase

```bash
firebase login
```

### Bước 4: Khởi tạo Firebase project (nếu chưa có)

```bash
cd "c:\Users\ACER\OneDrive\Desktop\New folder (2)\instagram-expo-sdk-51\instagram-expo-sdk-51\backend"
firebase init
```

**Chọn:**

- ✅ Functions
- ✅ Use existing project: `instagram-clone-9e0f9`
- ✅ JavaScript
- ✅ ESLint: No
- ✅ Install dependencies: Yes

### Bước 5: Deploy Cloud Functions

```bash
firebase deploy --only functions
```

**Functions sẽ được deploy:**
- ✅ `addFollower` - Tự động tạo followers khi follow
- ✅ `removeFollower` - Tự động xóa followers khi unfollow
- ✅ `addLike` - Tự động đếm likes
- ✅ `removeLike` - Tự động giảm likes
- ✅ `addComment` - Tự động đếm comments

### Bước 6: Cập nhật Firestore Rules

Thêm vào Firebase Console → Firestore → Rules:

```javascript
// Followers collection
match /followers/{user}/userFollowers/{follower} {
  allow read: if true;
  allow write: if false; // Only Cloud Functions can write
}
```

Click **Publish**.

### Bước 7: Cập nhật FollowersList.js

Thay thế code trong `frontend/components/main/profile/FollowersList.js`:

```javascript
const fetchFollowers = async () => {
    try {
        const followersRef = collection(
            getFirestore(), 
            "followers", 
            props.route.params.uid, 
            "userFollowers"
        );
        
        const snapshot = await getDocs(followersRef);
        const followersList = snapshot.docs.map(doc => doc.id);
        
        // Fetch user data
        for (const uid of followersList) {
            props.fetchUsersData(uid, false);
        }
        
        setFollowers(followersList);
        setLoading(false);
    } catch (error) {
        console.error("Error fetching followers:", error);
        setLoading(false);
    }
};
```

### Bước 8: Test

1. Trong app, follow một user
2. Kiểm tra Firestore Console:
   - `/following/{yourId}/userFollowing/{userId}` - có document
   - `/followers/{userId}/userFollowers/{yourId}` - có document (mới)
3. Vào profile của user đó
4. Click "Followers" - sẽ thấy tên bạn

## ⚠️ Lưu ý quan trọng

### Chi phí Firebase

Cloud Functions **KHÔNG MIỄN PHÍ**. Bạn cần:
- ✅ Upgrade Firebase plan lên **Blaze (Pay as you go)**
- 💰 Mỗi lần follow/unfollow = 2-3 function invocations
- 💰 Với 1000 follows/day ≈ $0.01 - $0.05/day

### Migrate dữ liệu hiện có

Nếu đã có users đang follow nhau, cần chạy migration script:

```javascript
// migration.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateFollowers() {
    const followingSnapshot = await db.collection('following').get();
    let count = 0;
    
    for (const userDoc of followingSnapshot.docs) {
        const userId = userDoc.id;
        const followingRef = db.collection('following').doc(userId).collection('userFollowing');
        const followingSnapshot = await followingRef.get();
        
        for (const followDoc of followingSnapshot.docs) {
            const followingId = followDoc.id;
            
            await db
                .collection('followers')
                .doc(followingId)
                .collection('userFollowers')
                .doc(userId)
                .set({
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                });
            
            count++;
            if (count % 100 === 0) {
                console.log(`Migrated ${count} relationships...`);
            }
        }
    }
    
    console.log(`Migration complete! Total: ${count} relationships`);
}

migrateFollowers().catch(console.error);
```

Chạy:
```bash
node migration.js
```

## 🎯 Kết quả cuối cùng

Sau khi hoàn tất:
- ✅ Followers list hoạt động nhanh
- ✅ Chỉ 1 query thay vì hàng trăm
- ✅ Tự động sync khi follow/unfollow
- ✅ Follower count luôn chính xác
