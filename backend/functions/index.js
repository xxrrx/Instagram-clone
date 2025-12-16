const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

exports.addLike = functions.firestore.document('/posts/{creatorId}/userPosts/{postId}/likes/{userId}')
    .onCreate((snap, context) => {
        return db
            .collection("posts")
            .doc(context.params.creatorId)
            .collection("userPosts")
            .doc(context.params.postId)
            .update({
                likesCount: admin.firestore.FieldValue.increment(1)
            })
    });
exports.removeLike = functions.firestore.document('/posts/{creatorId}/userPosts/{postId}/likes/{userId}')
    .onDelete((snap, context) => {
        return db
            .collection('posts')
            .doc(context.params.creatorId)
            .collection('userPosts')
            .doc(context.params.postId)
            .update({
                likesCount: admin.firestore.FieldValue.increment(-1)
            })
    })


exports.addFollower = functions.firestore
    .document('/following/{userId}/userFollowing/{followingId}')
    .onCreate((snap, context) => {
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

exports.addComment = functions.firestore.document('/posts/{creatorId}/userPosts/{postId}/comments/{userId}')
    .onCreate((snap, context) => {
        return db
            .collection("posts")
            .doc(context.params.creatorId)
            .collection("userPosts")
            .doc(context.params.postId)
            .update({
                commentsCount: admin.firestore.FieldValue.increment(1)
            })
    });
