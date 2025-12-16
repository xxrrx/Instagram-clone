import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchUsersData } from '../../../redux/actions/index';
import { container, text, utils } from '../../styles';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, getDocs, query } from 'firebase/firestore';

function FollowersList(props) {
    const [followers, setFollowers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFollowers();
    }, [props.route.params.uid]);

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

    const getFollowerUser = (uid) => {
        return props.users.find(user => user.uid === uid);
    };

    if (loading) {
        return (
            <View style={[container.container, container.center]}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (followers.length === 0) {
        return (
            <View style={[container.container, container.center, { padding: 20 }]}>
                <FontAwesome5 name="user-friends" size={40} color="gray" style={{ marginBottom: 10 }} />
                <Text style={[text.notAvailable, { marginBottom: 10 }]}>Followers List</Text>
                <Text style={[text.grey, text.center, { fontSize: 14 }]}>
                    This feature requires backend support (Cloud Functions) to efficiently track followers.
                </Text>
                <Text style={[text.grey, text.center, { fontSize: 14, marginTop: 10 }]}>
                    You can view who you're following in the Following tab.
                </Text>
            </View>
        );
    }

    return (
        <View style={[container.container, utils.backgroundWhite]}>
            <FlatList
                data={followers}
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                    const user = getFollowerUser(item);
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

export default connect(mapStateToProps, mapDispatchProps)(FollowersList);
