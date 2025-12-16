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




function Profile(props) {
    const [userPosts, setUserPosts] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [following, setFollowing] = useState(false)

    useEffect(() => {
        const { currentUser, posts } = props;

        if (props.route.params.uid === getAuth().currentUser.uid) {
            setUser(currentUser)
            setUserPosts(posts)
            setLoading(false)
        }
        else {
            getDoc(doc(getFirestore(), "users", props.route.params.uid))
                .then((snapshot) => {
                    if (snapshot.exists) {
                        props.navigation.setOptions({
                            title: snapshot.data().username,
                        })

                        setUser({ uid: props.route.params.uid, ...snapshot.data() });
                    }
                    setLoading(false)

                })
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


        if (props.following.indexOf(props.route.params.uid) > -1) {
            setFollowing(true);
        } else {
            setFollowing(false);
        }

    }, [props.route.params.uid, props.following, props.currentUser, props.posts])

    const onFollow = () => {
        setDoc(doc(getFirestore(), "following", getAuth().currentUser.uid, "userFollowing", props.route.params.uid), {})
            .then(() => {
                // Cloud Functions will automatically update followersCount and followingCount
                props.fetchUserFollowing();

                // Refresh user data to update follower count
                getDoc(doc(getFirestore(), "users", props.route.params.uid))
                    .then((snapshot) => {
                        if (snapshot.exists()) {
                            setUser(snapshot.data());
                        }
                    })
                    .catch((error) => {
                        console.error("Error refreshing user data:", error);
                    });
            })
            .catch((error) => {
                console.error("Error following user:", error);
            });
        props.sendNotification(user.notificationToken, "New Follower", `${props.currentUser.name} Started following you`, { type: 'profile', user: getAuth().currentUser.uid })
    }
    const onUnfollow = () => {
        deleteDoc(doc(getFirestore(), "following", getAuth().currentUser.uid, "userFollowing", props.route.params.uid))
            .then(() => {
                // Cloud Functions will automatically update followersCount and followingCount
                props.fetchUserFollowing();

                // Refresh user data to update follower count
                getDoc(doc(getFirestore(), "users", props.route.params.uid))
                    .then((snapshot) => {
                        if (snapshot.exists()) {
                            setUser(snapshot.data());
                        }
                    })
                    .catch((error) => {
                        console.error("Error refreshing user data:", error);
                    });
            })
            .catch((error) => {
                console.error("Error unfollowing user:", error);
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
        <View>
            <View style={[container.profileInfo]}>

                <View style={[utils.noPadding, container.row]}>

                    {user.image == 'default' ?
                        (
                            <FontAwesome5
                                style={[utils.profileImageBig, utils.marginBottomSmall]}
                                name="user-circle" size={80} color="black" />
                        )
                        :
                        (
                            <Image
                                style={[utils.profileImageBig, utils.marginBottomSmall]}
                                source={{
                                    uri: user.image
                                }}
                            />
                        )
                    }

                    <View style={[container.container, container.horizontal, utils.justifyCenter, utils.padding10Sides]}>

                        <View style={[utils.justifyCenter, text.center, container.containerImage]}>
                            <Text style={[text.bold, text.large, text.center]}>{userPosts.length}</Text>
                            <Text style={[text.center]}>Posts</Text>
                        </View>
                        <TouchableOpacity
                            style={[utils.justifyCenter, text.center, container.containerImage]}
                            onPress={() => props.navigation.navigate("FollowersList", { uid: user.uid })}
                        >
                            <Text style={[text.bold, text.large, text.center]}>{user.followersCount || 0}</Text>
                            <Text style={[text.center]}>Followers</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[utils.justifyCenter, text.center, container.containerImage]}
                            onPress={() => props.navigation.navigate("FollowingList", { uid: user.uid })}
                        >
                            <Text style={[text.bold, text.large, text.center]}>{user.followingCount || 0}</Text>
                            <Text style={[text.center]}>Following</Text>
                        </TouchableOpacity>
                    </View>

                </View>


                <View>
                    <Text style={text.bold}>{user.name}</Text>
                    <Text style={[text.profileDescription, utils.marginBottom]}>{user.description}</Text>

                    {props.route.params.uid !== getAuth().currentUser.uid ? (
                        <View style={[container.horizontal]}>
                            {following ? (
                                <TouchableOpacity
                                    style={[utils.buttonOutlined, container.container, utils.margin15Right]}
                                    title="Following"
                                    onPress={() => onUnfollow()}>
                                    <Text style={[text.bold, text.center, text.green]}>Following</Text>
                                </TouchableOpacity>
                            )
                                :
                                (
                                    <TouchableOpacity
                                        style={[utils.buttonOutlined, container.container, utils.margin15Right]}
                                        title="Follow"
                                        onPress={() => onFollow()}>
                                        <Text style={[text.bold, text.center, { color: '#2196F3' }]}>Follow</Text>
                                    </TouchableOpacity>

                                )}

                            <TouchableOpacity
                                style={[utils.buttonOutlined, container.container]}
                                title="Follow"
                                onPress={() => props.navigation.navigate('Chat', { user })}>
                                <Text style={[text.bold, text.center]}>Message</Text>
                            </TouchableOpacity>
                        </View>
                    ) :
                        <TouchableOpacity
                            style={utils.buttonOutlined}
                            onPress={() => props.navigation.navigate('Edit')}>
                            <Text style={[text.bold, text.center]}>Edit Profile</Text>
                        </TouchableOpacity>}
                </View>
            </View>

            <View style={[utils.borderTopGray]} />
        </View>
    );

    return (
        <View style={[container.container, utils.backgroundWhite]}>
            <FlatList
                ListHeaderComponent={renderHeader}
                numColumns={3}
                data={userPosts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[container.containerImage, utils.borderWhite]}
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


