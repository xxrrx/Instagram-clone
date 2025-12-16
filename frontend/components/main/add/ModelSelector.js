import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const WINDOW_WIDTH = Dimensions.get('window').width;
const ITEM_SIZE = (WINDOW_WIDTH - 50) / 5;

// Built-in shapes
const BUILTIN_MODELS = [
    {
        id: 'cube',
        name: 'Cube',
        type: 'builtin',
        color: '#00ff88',
    },
    {
        id: 'sphere',
        name: 'Sphere',
        type: 'builtin',
        color: '#ff6b6b',
    },
    {
        id: 'heart',
        name: 'Heart',
        type: 'builtin',
        color: '#ff4757',
    },
    {
        id: 'star',
        name: 'Star',
        type: 'builtin',
        color: '#ffd93d',
    },
];

// GLB Models from assets/models folder (removed: Car, Shiba, Spiny mouse)
const GLB_MODELS = [
    {
        id: 'avocado',
        name: 'Avocado',
        type: 'glb',
        color: '#4CAF50',
        source: require('../../../assets/models/AVOCADO.glb'),
    },
    {
        id: 'houseplant',
        name: 'Plant',
        type: 'glb',
        color: '#8BC34A',
        source: require('../../../assets/models/Houseplant.glb'),
    },
    {
        id: 'imposter',
        name: 'Imposter',
        type: 'glb',
        color: '#f44336',
        source: require('../../../assets/models/Sussy Imposter.glb'),
    },
    {
        id: 'tank',
        name: 'Tank',
        type: 'glb',
        color: '#607D8B',
        source: require('../../../assets/models/Tank.glb'),
    },
    {
        id: 'tralalero',
        name: 'Tralalero',
        type: 'glb',
        color: '#9C27B0',
        source: require('../../../assets/models/Tralalero Tralala.glb'),
    },
    {
        id: 'tungtung',
        name: 'Tung Tung',
        type: 'glb',
        color: '#FF9800',
        source: require('../../../assets/models/Tung Tung Tung Sahur.glb'),
    },
    {
        id: 'oldtv',
        name: 'Old TV',
        type: 'glb',
        color: '#3F51B5',
        source: require('../../../assets/models/old tv.glb'),
    },
];

export default function ModelSelector({
    isVisible,
    onSelectModel,
    onClose,
    selectedModelId = null
}) {
    if (!isVisible) return null;

    const handleSelectModel = (model) => {
        onSelectModel(model);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Choose 3D Model</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Feather name="x" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Built-in Shapes */}
            <Text style={styles.sectionTitle}>Basic Shapes</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {BUILTIN_MODELS.map((model) => (
                    <TouchableOpacity
                        key={model.id}
                        style={[
                            styles.modelItem,
                            selectedModelId === model.id && styles.modelItemSelected
                        ]}
                        onPress={() => handleSelectModel(model)}
                    >
                        <View style={[styles.modelPreview, { backgroundColor: model.color }]}>
                            <Text style={styles.modelTextInBox} numberOfLines={2}>
                                {model.name}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* GLB Models */}
            <Text style={styles.sectionTitle}>3D Models</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {GLB_MODELS.map((model) => (
                    <TouchableOpacity
                        key={model.id}
                        style={[
                            styles.modelItem,
                            selectedModelId === model.id && styles.modelItemSelected
                        ]}
                        onPress={() => handleSelectModel(model)}
                    >
                        <View style={[styles.modelPreview, { backgroundColor: model.color }]}>
                            <Text style={styles.modelTextInBox} numberOfLines={2}>
                                {model.name}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 15,
        paddingBottom: 25,
        maxHeight: 320,
        zIndex: 1000,
        elevation: 1000,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 5,
    },
    sectionTitle: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
        fontWeight: '600',
        paddingHorizontal: 20,
        marginTop: 10,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    scrollContent: {
        paddingHorizontal: 10,
    },
    modelItem: {
        width: ITEM_SIZE,
        alignItems: 'center',
        marginHorizontal: 4,
        padding: 6,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    modelItemSelected: {
        borderColor: '#00ff88',
        backgroundColor: 'rgba(0, 255, 136, 0.1)',
    },
    modelPreview: {
        width: ITEM_SIZE - 16,
        height: ITEM_SIZE - 16,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    modelTextInBox: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingHorizontal: 2,
    },
    instructions: {
        marginTop: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    instructionText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 11,
    },
});
