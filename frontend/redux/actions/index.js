import * as Notifications from 'expo-notifications';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Platform } from 'react-native';
import { CLEAR_DATA, USERS_DATA_STATE_CHANGE, USERS_LIKES_STATE_CHANGE, USERS_POSTS_STATE_CHANGE, USER_CHATS_STATE_CHANGE, USER_FOLLOWING_STATE_CHANGE, USER_POSTS_STATE_CHANGE, USER_STATE_CHANGE } from '../constants/index';

let unsubscribe = [];

export function clearData() {
    return ((dispatch) => {
        for (let i = unsubscribe; i < unsubscribe.length; i++) {
            unsubscribe[i]();
        }
        dispatch({ type: CLEAR_DATA })
    })
}

export function reload() {
    return ((dispatch) => {
        dispatch(clearData())
        dispatch(fetchUser())
        dispatch(setNotificationService())
        dispatch(fetchUserPosts())
        dispatch(fetchUserFollowing())
        dispatch(fetchUserChats())
    })
}

export const setNotificationService = () => async dispatch => {
    let token;
    const Constants = { isDevice: true }; // Fallback for expo-constants compatibility

    if (Constants.isDevice) {
        const existingStatus = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus.status !== 'granted') {
            const status = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus.status !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
        }

        // Add projectId from Firebase config to fix "No 'projectId' found" error
        token = (await Notifications.getExpoPushTokenAsync({
            projectId: 'b2ec97a6-299f-4d12-adbd-6400eb956a03'  // Get from 'eas init' or app.json
        }));
    } else {
        alert('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
        }),
    });

    if (token != undefined) {
        const db = getFirestore();
        const auth = getAuth();
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, {
            notificationToken: token.data,
        })
    }
}

export const sendNotification = (to, title, body, data) => dispatch => {
    if (to == null) {
        return;
    }

    let response = fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            to,
            sound: 'default',
            title,
            body,
            data
        })
    })
}

export function fetchUser() {
    return ((dispatch) => {
        const db = getFirestore();
        const auth = getAuth();
        const userRef = doc(db, "users", auth.currentUser.uid);

        let listener = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
                dispatch({ type: USER_STATE_CHANGE, currentUser: { uid: auth.currentUser.uid, ...snapshot.data() } })
            }
        })
        unsubscribe.push(listener)
    })
}

export function fetchUserChats() {
    return ((dispatch) => {
        const db = getFirestore();
        const auth = getAuth();
        const chatsRef = collection(db, "chats");
        const q = query(chatsRef, where("users", "array-contains", auth.currentUser.uid), orderBy("lastMessageTimestamp", "desc"));

        let listener = onSnapshot(q, (snapshot) => {
            let chats = snapshot.docs.map(doc => {
                const data = doc.data();
                const id = doc.id;
                return { id, ...data }
            })

            for (let i = 0; i < chats.length; i++) {
                let otherUserId;
                if (chats[i].users[0] == auth.currentUser.uid) {
                    otherUserId = chats[i].users[1];
                } else {
                    otherUserId = chats[i].users[0];
                }
                dispatch(fetchUsersData(otherUserId, false))
            }

            dispatch({ type: USER_CHATS_STATE_CHANGE, chats })
        })
        unsubscribe.push(listener)
    })
}

export function fetchUserPosts() {
    return ((dispatch) => {
        const db = getFirestore();
        const auth = getAuth();
        const postsRef = collection(db, "posts", auth.currentUser.uid, "userPosts");
        const q = query(postsRef, orderBy("creation", "desc"));

        getDocs(q).then((snapshot) => {
            let posts = snapshot.docs.map(doc => {
                const data = doc.data();
                const id = doc.id;
                return { id, ...data }
            })
            dispatch({ type: USER_POSTS_STATE_CHANGE, posts })
        })
    })
}

export function fetchUserFollowing() {
    return ((dispatch) => {
        const db = getFirestore();
        const auth = getAuth();
        const followingRef = collection(db, "following", auth.currentUser.uid, "userFollowing");

        let listener = onSnapshot(followingRef, (snapshot) => {
            let following = snapshot.docs.map(doc => {
                const id = doc.id;
                return id
            })
            dispatch({ type: USER_FOLLOWING_STATE_CHANGE, following });
            for (let i = 0; i < following.length; i++) {
                dispatch(fetchUsersData(following[i], true));
            }
        })
        unsubscribe.push(listener)
    })
}

export function fetchUsersData(uid, getPosts) {
    return ((dispatch, getState) => {
        const found = getState().usersState.users.some(el => el.uid === uid);
        if (!found) {
            const db = getFirestore();
            const userRef = doc(db, "users", uid);

            getDoc(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    let user = snapshot.data();
                    user.uid = snapshot.id;
                    dispatch({ type: USERS_DATA_STATE_CHANGE, user });
                }
            })
            if (getPosts) {
                dispatch(fetchUsersFollowingPosts(uid));
            }
        }
    })
}

export function fetchUsersFollowingPosts(uid) {
    return ((dispatch, getState) => {
        const db = getFirestore();
        const postsRef = collection(db, "posts", uid, "userPosts");
        const q = query(postsRef, orderBy("creation", "asc"));

        getDocs(q).then((snapshot) => {
            const uid = snapshot.docs[0].ref.path.split('/')[1];
            const user = getState().usersState.users.find(el => el.uid === uid);

            let posts = snapshot.docs.map(doc => {
                const data = doc.data();
                const id = doc.id;
                return { id, ...data, user }
            })

            for (let i = 0; i < posts.length; i++) {
                dispatch(fetchUsersFollowingLikes(uid, posts[i].id))
            }
            dispatch({ type: USERS_POSTS_STATE_CHANGE, posts, uid })
        })
    })
}

export function fetchUsersFollowingLikes(uid, postId) {
    return ((dispatch, getState) => {
        const db = getFirestore();
        const auth = getAuth();
        const likeRef = doc(db, "posts", uid, "userPosts", postId, "likes", auth.currentUser.uid);

        let listener = onSnapshot(likeRef, (snapshot) => {
            const postId = snapshot.id;
            let currentUserLike = false;
            if (snapshot.exists()) {
                currentUserLike = true;
            }
            dispatch({ type: USERS_LIKES_STATE_CHANGE, postId, currentUserLike })
        })
        unsubscribe.push(listener)
    })
}

export function queryUsersByUsername(username) {
    return ((dispatch, getState) => {
        return new Promise((resolve, reject) => {
            if (username.length == 0) {
                resolve([])
            }
            const db = getFirestore();
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('username', '>=', username), limit(10));

            getDocs(q).then((snapshot) => {
                let users = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const id = doc.id;
                    return { id, ...data }
                });
                resolve(users);
            })
        })
    })
}

export function deletePost(item) {
    return ((dispatch, getState) => {
        return new Promise((resolve, reject) => {
            const db = getFirestore();
            const auth = getAuth();
            const postRef = doc(db, 'posts', auth.currentUser.uid, "userPosts", item.id);

            deleteDoc(postRef).then(() => {
                resolve();
            }).catch(() => {
                reject();
            })
        })
    })
}

// Fetch feed posts (for Feed.js and Chat.js)
export function fetchFeedPosts() {
    return ((dispatch, getState) => {
        return Promise.resolve(getState().usersState.feed);
    })
}

// Update user feed posts (for Edit.js)
export function updateUserFeedPosts(updatedUser) {
    return ((dispatch, getState) => {
        const auth = getAuth();
        const currentUserId = auth.currentUser.uid;
        dispatch({ type: USERS_DATA_STATE_CHANGE, user: { ...updatedUser, uid: currentUserId } });
        return Promise.resolve();
    })
}
