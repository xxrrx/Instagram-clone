import { FontAwesome5 } from '@expo/vector-icons';




import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { sendNotification, fetchUserFollowing } from '../../../redux/actions/index';
import { container, text, utils } from '../../styles';
import CachedImage from '../random/CachedImage';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, deleteDoc, addDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useTheme } from '../../../contexts/ThemeContext';




function Profile(props) {
    const { theme, isDarkMode } = useTheme();
    const [userPosts, setUserPosts] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [following, setFollowing] = useState(false)

    // Fetch following list when uid changes
    useEffect(() => {
        props.fetchUserFollowing();
    }, [props.route.params.uid]);

    // Update button state when following list changes
    useEffect(() => {
        if (props.following.indexOf(props.route.params.uid) > -1) {
            setFollowing(true);
        } else {
            setFollowing(false);
        }
    }, [props.following, props.route.params.uid]);

    // Fetch user data and posts
    useEffect(() => {
        const { currentUser, posts } = props;
        let unsubscribeUser = null;

        if (props.route.params.uid === getAuth().currentUser.uid) {
            setUser(currentUser)
            setUserPosts(posts)
            setLoading(false)
        }
        else {
            // Listen to user data changes for real-time follower count updates
            unsubscribeUser = onSnapshot(
                doc(getFirestore(), "users", props.route.params.uid),
                (snapshot) => {
                    if (snapshot.exists()) {
                        props.navigation.setOptions({
                            title: snapshot.data().username,
                        })

                        setUser({ uid: props.route.params.uid, ...snapshot.data() });
                    }
                    setLoading(false)
                },
                (error) => {
                    // Handle permission errors gracefully (e.g., after logout)
                    console.log("Listener error:", error.message);
                    setLoading(false);
                }
            );

            getDocs(query(collection(getFirestore(), "posts", props.route.params.uid, "userPosts"), orderBy("creation", "desc")))
                .then((snapshot) => {
                    let posts = snapshot.docs.map(doc => {
                        const data = doc.data();
                        const id = doc.id;
                        return { id, ...data }
                    })
                    setUserPosts(posts)
                })
        }

        // Cleanup listener on unmount (always runs)
        return () => {
            if (unsubscribeUser) {
                unsubscribeUser();
            }
        };

    }, [props.route.params.uid, props.currentUser, props.posts])

    const onFollow = () => {
        setFollowing(true); // Immediate UI feedback
        setDoc(doc(getFirestore(), "following", getAuth().currentUser.uid, "userFollowing", props.route.params.uid), {})
            .then(() => {
                // Cloud Functions will automatically update followersCount and followingCount
                props.fetchUserFollowing();
                // Real-time listener will update user data automatically
            })
            .catch((error) => {
                console.error("Error following user:", error);
                setFollowing(false); // Revert on error
            });
        props.sendNotification(user.notificationToken, "New Follower", `${props.currentUser.name} Started following you`, { type: 'profile', user: getAuth().currentUser.uid })
    }
    const onUnfollow = () => {
        setFollowing(false); // Immediate UI feedback
        deleteDoc(doc(getFirestore(), "following", getAuth().currentUser.uid, "userFollowing", props.route.params.uid))
            .then(() => {
                // Cloud Functions will automatically update followersCount and followingCount
                props.fetchUserFollowing();
                // Real-time listener will update user data automatically
            })
            .catch((error) => {
                console.error("Error unfollowing user:", error);
                setFollowing(true); // Revert on error
            });
    }

    if (loading) {
        return (
            <View style={{ height: '100%', justifyContent: 'center', margin: 'auto' }}>
                <ActivityIndicator style={{ alignSelf: 'center', marginBottom: 20 }} size="large" color="#00ff00" />
                <Text style={[text.notAvailable]}>Loading</Text>
            </View>
        )
    }
    if (user === null) {
        return (
            <View style={{ height: '100%', justifyContent: 'center', margin: 'auto' }}>
                <FontAwesome5 style={{ alignSelf: 'center', marginBottom: 20 }} name="dizzy" size={40} color="black" />
                <Text style={[text.notAvailable]}>User Not Found</Text>
            </View>
        )
    }
    const renderHeader = () => (
        <View style={{ backgroundColor: theme.background }}>
            <View style={[container.profileInfo, { paddingTop: 30 }]}>

                <View style={[utils.noPadding, container.row]}>

                    {user.image == 'default' ?
                        (
                            <View style={{
                                width: 90,
                                height: 90,
                                borderRadius: 45,
                                backgroundColor: '#9D4EDD',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: 10,
                                shadowColor: '#9D4EDD',
                                shadowOffset: { width: 0, height: 6 },
                                shadowOpacity: 0.3,
                                shadowRadius: 12,
                                elevation: 8
                            }}>
                                <FontAwesome5
                                    name="user-circle" size={50} color="white" />
                            </View>
                        )
                        :
                        (
                            <Image
                                style={[utils.profileImageBig, utils.marginBottomSmall, { width: 90, height: 90, borderRadius: 45 }]}
                                source={{
                                    uri: user.image
                                }}
                            />
                        )
                    }

                    <View style={[container.horizontal, { paddingHorizontal: 10, gap: 8, marginTop: 10, flexWrap: 'nowrap' }]}>

                        <View style={[utils.cardSmall, {
                            flex: 1,
                            backgroundColor: '#FF8C42',
                            borderRadius: 14,
                            paddingVertical: 12,
                            paddingHorizontal: 4,
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 60,
                            maxWidth: 80
                        }]}>
                            <Text style={[text.bold, text.center, { color: '#FFFFFF', fontSize: 20, marginBottom: 2 }]}>{userPosts.length}</Text>
                            <Text style={[text.center, { color: '#FFFFFF', fontSize: 11, fontWeight: '600' }]} numberOfLines={1}>Posts</Text>
                        </View>
                        <TouchableOpacity
                            style={[utils.cardSmall, {
                                flex: 1,
                                backgroundColor: '#9D4EDD',
                                borderRadius: 14,
                                paddingVertical: 12,
                                paddingHorizontal: 4,
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 60,
                                maxWidth: 80
                            }]}
                            onPress={() => props.navigation.navigate("FollowersList", { uid: user.uid })}
                        >
                            <Text style={[text.bold, text.center, { color: '#FFFFFF', fontSize: 20, marginBottom: 2 }]}>{user.followersCount || 0}</Text>
                            <Text style={[text.center, { color: '#FFFFFF', fontSize: 11, fontWeight: '600' }]} numberOfLines={1}>Followers</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[utils.cardSmall, {
                                flex: 1,
                                backgroundColor: '#00D4FF',
                                borderRadius: 14,
                                paddingVertical: 12,
                                paddingHorizontal: 4,
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 60,
                                maxWidth: 80
                            }]}
                            onPress={() => props.navigation.navigate("FollowingList", { uid: user.uid })}
                        >
                            <Text style={[text.bold, text.center, { color: '#FFFFFF', fontSize: 20, marginBottom: 2 }]}>{user.followingCount || 0}</Text>
                            <Text style={[text.center, { color: '#FFFFFF', fontSize: 11, fontWeight: '600' }]} numberOfLines={1}>Following</Text>
                        </TouchableOpacity>
                    </View>

                </View>


                <View style={{ marginTop: 15 }}>
                    <Text style={[text.bold, { fontSize: 18, color: theme.text, marginBottom: 5 }]}>{user.name}</Text>
                    <Text style={[text.profileDescription, utils.marginBottom, { fontSize: 15, color: theme.textSecondary, lineHeight: 22 }]}>{user.description}</Text>

                    {props.route.params.uid !== getAuth().currentUser.uid ? (
                        <View style={[container.horizontal, { gap: 10 }]}>
                            {following ? (
                                <TouchableOpacity
                                    style={[utils.buttonOutlined, container.container, {
                                        flex: 1,
                                        marginRight: 0,
                                        borderRadius: 25,
                                        paddingVertical: 12
                                    }]}
                                    title="Following"
                                    onPress={() => onUnfollow()}>
                                    <Text style={[text.bold, text.center, { color: '#06FFA5', fontSize: 15 }]}>Following</Text>
                                </TouchableOpacity>
                            )
                                :
                                (
                                    <TouchableOpacity
                                        style={[utils.buttonBlue, { flex: 1, marginRight: 0 }]}
                                        title="Follow"
                                        onPress={() => onFollow()}>
                                        <Text style={[text.bold, text.center, { color: '#FFFFFF', fontSize: 15 }]}>Follow</Text>
                                    </TouchableOpacity>

                                )

                            }

                            <TouchableOpacity
                                style={[utils.buttonPurple, { flex: 1 }]}
                                title="Message"
                                onPress={() => props.navigation.navigate('Chat', { user })}>
                                <Text style={[text.bold, text.center, { color: '#FFFFFF', fontSize: 15 }]}>Message</Text>
                            </TouchableOpacity>
                        </View>
                    ) :
                        <TouchableOpacity
                            style={utils.buttonGreen}
                            onPress={() => props.navigation.navigate('Edit')}>
                            <Text style={[text.bold, text.center, { color: '#FFFFFF', fontSize: 15 }]}>Edit Profile</Text>
                        </TouchableOpacity>}
                </View>
            </View>

            <View style={[utils.borderTopGray]} />
        </View >
    );

    return (
        <View style={[container.container, { backgroundColor: theme.background }]}>
            <FlatList
                ListHeaderComponent={renderHeader}
                numColumns={3}
                data={userPosts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[container.containerImage, {
                            borderLeftWidth: 1,
                            borderRightWidth: 1,
                            borderTopWidth: 1,
                            borderColor: '#F5F5F5',
                            overflow: 'hidden'
                        }]}
                        onPress={() => props.navigation.navigate("Post", { item, user })}>

                        {item.type == 0 ?

                            <CachedImage
                                cacheKey={item.id}
                                style={container.image}
                                source={{ uri: item.downloadURLStill }}
                            />

                            :

                            <CachedImage
                                cacheKey={item.id}
                                style={container.image}
                                source={{ uri: item.downloadURL }}
                            />
                        }
                    </TouchableOpacity>

                )}

            />
        </View>

    )
}

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser,
    posts: store.userState.posts,
    following: store.userState.following

})

const mapDispatchProps = (dispatch) => bindActionCreators({ sendNotification, fetchUserFollowing }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Profile);


