import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchUsersData } from '../../../redux/actions/index';
import { container, text, utils } from '../../styles';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, getDocs } from 'firebase/firestore';

function FollowingList(props) {
    const [following, setFollowing] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFollowing();
    }, [props.route.params.uid]);

    const fetchFollowing = async () => {
        try {
            // Get all users that this user follows
            const followingSnapshot = await getDocs(
                collection(getFirestore(), "following", props.route.params.uid, "userFollowing")
            );

            const followingList = followingSnapshot.docs.map(doc => doc.id);

            // Fetch user data for each following
            for (const uid of followingList) {
                props.fetchUsersData(uid, false);
            }

            setFollowing(followingList);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching following:", error);
            setLoading(false);
        }
    };

    const getFollowingUser = (uid) => {
        return props.users.find(user => user.uid === uid);
    };

    if (loading) {
        return (
            <View style={[container.container, container.center]}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (following.length === 0) {
        return (
            <View style={[container.container, container.center]}>
                <FontAwesome5 name="user-friends" size={40} color="gray" style={{ marginBottom: 10 }} />
                <Text style={[text.notAvailable]}>Not following anyone yet</Text>
            </View>
        );
    }

    return (
        <View style={[container.container, utils.backgroundWhite]}>
            <FlatList
                data={following}
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                    const user = getFollowingUser(item);
                    if (!user) return null;

                    return (
                        <TouchableOpacity
                            style={[container.horizontal, utils.padding10, utils.alignItemsCenter]}
                            onPress={() => props.navigation.navigate("Profile", { uid: user.uid, username: undefined })}
                        >
                            {user.image === 'default' ? (
                                <FontAwesome5
                                    style={[utils.profileImageSmall]}
                                    name="user-circle"
                                    size={40}
                                    color="black"
                                />
                            ) : (
                                <Image
                                    style={[utils.profileImageSmall]}
                                    source={{ uri: user.image }}
                                />
                            )}
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={[text.bold]}>{user.name}</Text>
                                <Text style={[text.grey, text.small]}>{user.email}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
}

const mapStateToProps = (store) => ({
    users: store.usersState.users,
    currentUser: store.userState.currentUser
});

const mapDispatchProps = (dispatch) => bindActionCreators({ fetchUsersData }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(FollowingList);
