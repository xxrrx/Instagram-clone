import { FontAwesome5 } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { queryUsersByUsername } from '../../../redux/actions/index';
import { container, text, utils } from '../../styles';
import { useTheme } from '../../../contexts/ThemeContext';

require('firebase/firestore');


function Search(props) {
    const { theme, isDarkMode } = useTheme();
    const [users, setUsers] = useState([])
    return (
        <View style={[container.container, { backgroundColor: theme.background }]}>
            <View style={{ marginVertical: 20, paddingHorizontal: 20 }}>
                <TextInput
                    style={[utils.searchBar, { height: 50, fontSize: 16, backgroundColor: theme.inputBackground, color: theme.inputText }]}
                    placeholder="Search for users... 🔍"
                    placeholderTextColor={theme.inputPlaceholder}
                    onChangeText={(search) => props.queryUsersByUsername(search).then(setUsers)} />
            </View>


            <FlatList
                numColumns={1}
                horizontal={false}
                data={users}
                contentContainerStyle={{ paddingHorizontal: 15 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[container.horizontal, utils.cardSmall, { marginHorizontal: 0, padding: 15, alignItems: 'center', backgroundColor: theme.card }]}
                        onPress={() => props.navigation.navigate("Profile", { uid: item.id, username: undefined })}>

                        {item.image == 'default' ?
                            (
                                <View style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 28,
                                    backgroundColor: '#9D4EDD',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: 15
                                }}>
                                    <FontAwesome5
                                        name="user-circle" size={28} color="white" />
                                </View>

                            )
                            :
                            (
                                <Image
                                    style={[utils.profileImage, { width: 56, height: 56, borderRadius: 28 }]}
                                    source={{
                                        uri: item.image
                                    }}
                                />
                            )
                        }
                        <View style={utils.justifyCenter}>
                            <Text style={[text.username, { fontSize: 16, color: theme.text }]}>{item.username}</Text>
                            <Text style={[text.name, { fontSize: 14, color: theme.textSecondary }]} >{item.name}</Text>
                        </View>
                    </TouchableOpacity>

                )}
            />
        </View>
    )
}

const mapDispatchProps = (dispatch) => bindActionCreators({ queryUsersByUsername }, dispatch);

export default connect(null, mapDispatchProps)(Search);