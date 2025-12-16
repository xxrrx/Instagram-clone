# ✅ Đã sửa lỗi Followers List

## ❌ Vấn đề ban đầu

Code cũ cố gắng:
1. Đọc **TẤT CẢ** documents trong collection `/following`
2. Với mỗi user, đọc subcollection `/following/{userId}/userFollowing`
3. Kiểm tra xem có follow user hiện tại không

**Kết quả:**
- ❌ Lỗi permissions (collection group query không được phép)
- ❌ Cực kỳ chậm (với 1000 users = 1000+ reads)
- ❌ Tốn tiền Firestore reads
- ❌ Không scale được

## ✅ Giải pháp tạm thời

Đã **tắt tính năng followers list** và hiển thị message thông báo:

```
"This feature requires backend support (Cloud Functions) 
to efficiently track followers."
```

**Kết quả:**
- ✅ Không còn lỗi
- ✅ App chạy bình thường
- ✅ User hiểu tại sao tính năng chưa có
- ⚠️ Chưa thể xem ai đang follow mình

## 🔧 Cách implement đúng (cho Production)

### Bước 1: Tạo Cloud Function để sync followers

Tạo file `backend/functions/index.js` (đã có sẵn):

```javascript
// Thêm vào file này:

exports.addFollower = functions.firestore
    .document('/following/{userId}/userFollowing/{followingId}')
    .onCreate((snap, context) => {
        const db = admin.firestore();
        
        // Khi A follow B:
        // 1. Thêm vào /followers/B/userFollowers/A
        return db
            .collection('followers')
            .doc(context.params.followingId)
            .collection('userFollowers')
            .doc(context.params.userId)
            .set({
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
                // 2. Update follower count
                return db
                    .collection('users')
                    .doc(context.params.followingId)
                    .update({
                        followersCount: admin.firestore.FieldValue.increment(1)
                    });
            });
    });

exports.removeFollower = functions.firestore
    .document('/following/{userId}/userFollowing/{followingId}')
    .onDelete((snap, context) => {
        const db = admin.firestore();
        
        // Khi A unfollow B:
        // 1. Xóa khỏi /followers/B/userFollowers/A
        return db
            .collection('followers')
            .doc(context.params.followingId)
            .collection('userFollowers')
            .doc(context.params.userId)
            .delete()
            .then(() => {
                // 2. Update follower count
                return db
                    .collection('users')
                    .doc(context.params.followingId)
                    .update({
                        followersCount: admin.firestore.FieldValue.increment(-1)
                    });
            });
    });
```

### Bước 2: Deploy Cloud Functions

```bash
cd backend/functions
npm install
firebase deploy --only functions
```

### Bước 3: Update Firestore Rules

Thêm vào `firestore.rules`:

```javascript
// Followers collection
match /followers/{user}/userFollowers/{follower} {
  allow read: if true;
  allow write: if false; // Only Cloud Functions can write
}
```

### Bước 4: Update FollowersList.js

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

### Bước 5: Migrate existing data (one-time)

Chạy script để copy data từ `following` sang `followers`:

```javascript
// migration-script.js
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

async function migrateFollowers() {
    const followingSnapshot = await db.collection('following').get();
    
    for (const userDoc of followingSnapshot.docs) {
        const userId = userDoc.id;
        const followingRef = db.collection('following').doc(userId).collection('userFollowing');
        const followingSnapshot = await followingRef.get();
        
        for (const followDoc of followingSnapshot.docs) {
            const followingId = followDoc.id;
            
            // Add to followers collection
            await db
                .collection('followers')
                .doc(followingId)
                .collection('userFollowers')
                .doc(userId)
                .set({
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                });
        }
    }
    
    console.log('Migration complete!');
}

migrateFollowers();
```

## 📊 So sánh Performance

| Approach | Reads (1000 users) | Speed | Cost |
|----------|-------------------|-------|------|
| **Cũ** (scan all) | 1000+ | Rất chậm | Cao |
| **Mới** (dedicated collection) | 1 | Nhanh | Thấp |

## 🎯 Kết quả hiện tại

- ✅ App không còn lỗi
- ✅ Following list vẫn hoạt động bình thường
- ⚠️ Followers list tạm thời disabled
- 📝 Có roadmap rõ ràng để implement đúng cách

## 📝 TODO

- [ ] Deploy Cloud Functions (addFollower, removeFollower)
- [ ] Update Firestore Rules cho followers collection
- [ ] Run migration script
- [ ] Update FollowersList.js để đọc từ followers collection
- [ ] Test thoroughly
