import React, { useRef, useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, PanResponder, Dimensions, Text, ActivityIndicator } from 'react-native';
import { GLView } from 'expo-gl';
import * as THREE from 'three';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { GLTFLoader } from 'three-stdlib';
import { decode as atob } from 'base-64';

const WINDOW_WIDTH = Dimensions.get('window').width;

// Custom function to create WebGL renderer compatible with Expo GL
function createExpoRenderer(gl) {
    const renderer = new THREE.WebGLRenderer({
        canvas: {
            width: gl.drawingBufferWidth,
            height: gl.drawingBufferHeight,
            style: {},
            addEventListener: () => { },
            removeEventListener: () => { },
            clientHeight: gl.drawingBufferHeight,
            getContext: () => gl,
        },
        context: gl,
    });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setPixelRatio(1);
    return renderer;
}

// Color mapping for built-in shapes
const SHAPE_COLORS = {
    cube: 0x00ff88,
    sphere: 0xff6b6b,
    heart: 0xff4757,
    star: 0xffd93d,
};

// GLB model configurations with scale adjustments
const GLB_MODELS_CONFIG = {
    avocado: { scale: 15, yOffset: 0 },
    houseplant: { scale: 1.5, yOffset: -0.5 },
    imposter: { scale: 1.5, yOffset: 0 },
    tank: { scale: 0.8, yOffset: 0 },
    tralalero: { scale: 1.2, yOffset: 0 },
    tungtung: { scale: 1.2, yOffset: 0 },
    oldtv: { scale: 1.5, yOffset: 0 },
};

// Fallback colors for GLB models
const GLB_COLORS = {
    avocado: 0x4CAF50,
    houseplant: 0x8BC34A,
    imposter: 0xf44336,
    tank: 0x607D8B,
    tralalero: 0x9C27B0,
    tungtung: 0xFF9800,
    oldtv: 0x3F51B5,
};

export default function AROverlay({
    modelType = 'builtin',
    modelId = 'cube',
    modelSource = null,
    isVisible,
    onModelLoaded,
}) {
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const modelRef = useRef(null);
    const animationIdRef = useRef(null);
    const glRef = useRef(null);
    const currentModelIdRef = useRef(null);
    const isMountedRef = useRef(true);

    // Loading state
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState(null);

    // Transform states using refs for performance
    const scaleRef = useRef(1);
    const positionRef = useRef({ x: 0, y: 0 });
    const autoRotationRef = useRef(0);
    const isSceneReadyRef = useRef(false);
    const pendingModelRef = useRef({ type: modelType, id: modelId, source: modelSource });

    // Gesture tracking
    const lastTouchRef = useRef({ x: 0, y: 0 });
    const lastDistanceRef = useRef(0);
    const touchCountRef = useRef(0);

    // Calculate distance between two touches
    const getDistance = (touches) => {
        if (touches.length < 2) return 0;
        const dx = touches[0].pageX - touches[1].pageX;
        const dy = touches[0].pageY - touches[1].pageY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    // Pan responder for gestures
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,

            onPanResponderGrant: (evt) => {
                const touches = evt.nativeEvent.touches;
                touchCountRef.current = touches.length;

                if (touches.length === 1) {
                    lastTouchRef.current = {
                        x: touches[0].pageX,
                        y: touches[0].pageY
                    };
                } else if (touches.length === 2) {
                    lastDistanceRef.current = getDistance(touches);
                }
            },

            onPanResponderMove: (evt) => {
                const touches = evt.nativeEvent.touches;

                if (touches.length === 1 && touchCountRef.current === 1) {
                    // Single finger - move model
                    const dx = (touches[0].pageX - lastTouchRef.current.x) / 100;
                    const dy = (touches[0].pageY - lastTouchRef.current.y) / 100;

                    positionRef.current = {
                        x: positionRef.current.x + dx,
                        y: positionRef.current.y - dy
                    };

                    lastTouchRef.current = {
                        x: touches[0].pageX,
                        y: touches[0].pageY
                    };
                } else if (touches.length === 2) {
                    // Two fingers - scale
                    const currentDistance = getDistance(touches);

                    if (lastDistanceRef.current > 0) {
                        const scaleFactor = currentDistance / lastDistanceRef.current;
                        scaleRef.current = Math.max(0.2, Math.min(4, scaleRef.current * scaleFactor));
                    }

                    lastDistanceRef.current = currentDistance;
                    touchCountRef.current = 2;
                }
            },

            onPanResponderRelease: () => {
                touchCountRef.current = 0;
            }
        })
    ).current;

    // Create built-in shape
    const createBuiltinShape = useCallback((id) => {
        let geometry;
        const color = SHAPE_COLORS[id] || 0x00ff88;
        const material = new THREE.MeshStandardMaterial({
            color,
            metalness: 0.4,
            roughness: 0.3
        });

        switch (id) {
            case 'sphere':
                geometry = new THREE.SphereGeometry(0.8, 32, 32);
                console.log('Created sphere');
                return new THREE.Mesh(geometry, material);

            case 'heart':
                const heartShape = new THREE.Shape();
                const x = 0, y = 0;
                heartShape.moveTo(x, y + 0.5);
                heartShape.bezierCurveTo(x, y + 0.5, x - 0.4, y, x - 0.8, y);
                heartShape.bezierCurveTo(x - 1.4, y, x - 1.4, y + 0.7, x - 1.4, y + 0.7);
                heartShape.bezierCurveTo(x - 1.4, y + 1.1, x - 1.1, y + 1.54, x, y + 1.9);
                heartShape.bezierCurveTo(x + 1.1, y + 1.54, x + 1.4, y + 1.1, x + 1.4, y + 0.7);
                heartShape.bezierCurveTo(x + 1.4, y + 0.7, x + 1.4, y, x + 0.8, y);
                heartShape.bezierCurveTo(x + 0.4, y, x, y + 0.5, x, y + 0.5);

                geometry = new THREE.ExtrudeGeometry(heartShape, {
                    depth: 0.4,
                    bevelEnabled: true,
                    bevelThickness: 0.1,
                    bevelSize: 0.1,
                    bevelSegments: 2
                });
                geometry.center();
                const heartMesh = new THREE.Mesh(geometry, material);
                heartMesh.rotation.x = Math.PI;
                heartMesh.scale.set(0.5, 0.5, 0.5);
                console.log('Created heart');
                return heartMesh;

            case 'star':
                const starShape = new THREE.Shape();
                const outerRadius = 1;
                const innerRadius = 0.4;
                const spikes = 5;

                for (let i = 0; i < spikes * 2; i++) {
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    const angle = (i * Math.PI) / spikes - Math.PI / 2;
                    const px = Math.cos(angle) * radius;
                    const py = Math.sin(angle) * radius;

                    if (i === 0) {
                        starShape.moveTo(px, py);
                    } else {
                        starShape.lineTo(px, py);
                    }
                }
                starShape.closePath();

                geometry = new THREE.ExtrudeGeometry(starShape, {
                    depth: 0.3,
                    bevelEnabled: true,
                    bevelThickness: 0.05,
                    bevelSize: 0.05,
                    bevelSegments: 1
                });
                geometry.center();
                const starMesh = new THREE.Mesh(geometry, material);
                starMesh.scale.set(0.6, 0.6, 0.6);
                console.log('Created star');
                return starMesh;

            case 'cube':
            default:
                geometry = new THREE.BoxGeometry(1, 1, 1);
                console.log('Created cube');
                return new THREE.Mesh(geometry, material);
        }
    }, []);

    // Create fallback shape for GLB errors
    const createFallbackShape = useCallback((id) => {
        const color = GLB_COLORS[id] || 0x9966ff;
        const material = new THREE.MeshStandardMaterial({
            color,
            metalness: 0.6,
            roughness: 0.2,
            emissive: color,
            emissiveIntensity: 0.1,
        });
        const geometry = new THREE.IcosahedronGeometry(0.8, 1);
        return new THREE.Mesh(geometry, material);
    }, []);

    // Load GLB model
    const loadGLBModel = useCallback(async (source, id) => {
        console.log('Loading GLB model:', id, source);
        setIsLoading(true);
        setLoadError(null);

        try {
            // Load the asset
            const asset = Asset.fromModule(source);
            await asset.downloadAsync();
            console.log('Asset downloaded:', asset.localUri);

            if (!asset.localUri) {
                throw new Error('Failed to get local URI for asset');
            }

            // Read the file as base64
            const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Convert base64 to ArrayBuffer using imported atob
            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const arrayBuffer = bytes.buffer;

            console.log('ArrayBuffer created, size:', arrayBuffer.byteLength);

            // Create GLTFLoader and load
            const loader = new GLTFLoader();

            return new Promise((resolve, reject) => {
                loader.parse(
                    arrayBuffer,
                    '',
                    (gltf) => {
                        console.log('GLB parsed successfully:', id);
                        const model = gltf.scene;

                        // Calculate bounding box
                        const box = new THREE.Box3().setFromObject(model);
                        const center = box.getCenter(new THREE.Vector3());
                        const size = box.getSize(new THREE.Vector3());
                        const maxDim = Math.max(size.x, size.y, size.z);

                        console.log('Model size:', size, 'maxDim:', maxDim);

                        // Apply config scale
                        const config = GLB_MODELS_CONFIG[id] || { scale: 1, yOffset: 0 };
                        const basescale = maxDim > 0 ? (2 / maxDim) : 1;
                        const finalScale = basescale * config.scale;

                        // Create a container group
                        const container = new THREE.Group();

                        // Center the model
                        model.position.set(-center.x, -center.y + (config.yOffset || 0), -center.z);
                        container.add(model);
                        container.scale.setScalar(finalScale);

                        // Ensure materials work properly
                        model.traverse((child) => {
                            if (child.isMesh) {
                                child.castShadow = true;
                                child.receiveShadow = true;
                                if (child.material) {
                                    child.material.needsUpdate = true;
                                    // Ensure proper rendering
                                    if (child.material.map) {
                                        child.material.map.needsUpdate = true;
                                    }
                                }
                            }
                        });

                        setIsLoading(false);
                        console.log('GLB model ready:', id);
                        resolve(container);
                    },
                    (error) => {
                        console.error('Error parsing GLB:', error);
                        setLoadError('Failed to parse 3D model');
                        setIsLoading(false);
                        resolve(createFallbackShape(id));
                    }
                );
            });
        } catch (error) {
            console.error('Error loading GLB asset:', error);
            setLoadError(`Load error: ${error.message}`);
            setIsLoading(false);
            return createFallbackShape(id);
        }
    }, [createFallbackShape]);

    // Create or load model based on type
    const createModel = useCallback(async (type, id, source) => {
        console.log('createModel called:', type, id, !!source);
        if (type === 'glb' && source) {
            return await loadGLBModel(source, id);
        } else {
            return createBuiltinShape(id);
        }
    }, [loadGLBModel, createBuiltinShape]);

    // Dispose model resources
    const disposeModel = useCallback((model) => {
        if (!model) return;
        model.traverse((child) => {
            if (child.isMesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach((m) => {
                            if (m.map) m.map.dispose();
                            m.dispose();
                        });
                    } else {
                        if (child.material.map) child.material.map.dispose();
                        child.material.dispose();
                    }
                }
            }
        });
    }, []);

    // Update pending model ref when props change
    useEffect(() => {
        pendingModelRef.current = { type: modelType, id: modelId, source: modelSource };
        console.log('Pending model updated:', modelType, modelId);
    }, [modelType, modelId, modelSource]);

    // Update model when modelId or modelType changes
    useEffect(() => {
        // Wait for scene to be ready
        if (!isSceneReadyRef.current || !sceneRef.current) {
            console.log('Scene not ready yet, waiting...');
            return;
        }

        const key = `${modelType}_${modelId}`;
        if (currentModelIdRef.current === key) {
            console.log('Same model, skipping update');
            return;
        }

        const updateModel = async () => {
            console.log('Changing model to:', modelType, modelId);

            // Remove old model
            if (modelRef.current) {
                sceneRef.current.remove(modelRef.current);
                disposeModel(modelRef.current);
            }

            // Reset transforms
            scaleRef.current = 1;
            positionRef.current = { x: 0, y: 0 };
            autoRotationRef.current = 0;

            // Create new model
            const newModel = await createModel(modelType, modelId, modelSource);

            if (!isMountedRef.current || !sceneRef.current) return;

            sceneRef.current.add(newModel);
            modelRef.current = newModel;
            currentModelIdRef.current = key;

            console.log('Model updated successfully to:', key);

            if (onModelLoaded) {
                onModelLoaded(true);
            }
        };

        updateModel();
    }, [modelId, modelType, modelSource, createModel, disposeModel, onModelLoaded]);

    // Setup Three.js scene
    const onContextCreate = useCallback(async (gl) => {
        // Get current model from ref (not closure) to get latest value
        const currentModel = pendingModelRef.current;
        console.log('onContextCreate called with model:', currentModel.type, currentModel.id);
        glRef.current = gl;

        // Create renderer using custom Expo-compatible function
        const renderer = createExpoRenderer(gl);
        renderer.setClearColor(0x000000, 0);
        rendererRef.current = renderer;

        // Create scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Create camera
        const camera = new THREE.PerspectiveCamera(
            75,
            gl.drawingBufferWidth / gl.drawingBufferHeight,
            0.1,
            1000
        );
        camera.position.z = 4;
        cameraRef.current = camera;

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight2.position.set(-5, -5, 5);
        scene.add(directionalLight2);

        const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
        rimLight.position.set(0, 0, -5);
        scene.add(rimLight);

        // Reset refs for new context
        scaleRef.current = 1;
        positionRef.current = { x: 0, y: 0 };
        autoRotationRef.current = 0;
        currentModelIdRef.current = null;

        // Create initial model using ref value
        console.log('Creating initial model:', currentModel.type, currentModel.id);
        const model = await createModel(currentModel.type, currentModel.id, currentModel.source);

        if (!isMountedRef.current) return;

        scene.add(model);
        modelRef.current = model;
        currentModelIdRef.current = `${currentModel.type}_${currentModel.id}`;

        // Mark scene as ready AFTER creating model
        isSceneReadyRef.current = true;

        if (onModelLoaded) {
            onModelLoaded(true);
        }

        // Render loop
        const render = () => {
            if (!isMountedRef.current) return;

            animationIdRef.current = requestAnimationFrame(render);

            if (modelRef.current) {
                const s = scaleRef.current;
                modelRef.current.scale.setScalar(s);
                modelRef.current.position.set(positionRef.current.x, positionRef.current.y, 0);

                // Auto-rotate
                autoRotationRef.current += 0.015;
                modelRef.current.rotation.y = autoRotationRef.current;
            }

            renderer.render(scene, camera);
            gl.endFrameEXP();
        };
        render();
    }, [createModel, onModelLoaded]);

    // Cleanup
    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            console.log('AROverlay cleanup');
            isMountedRef.current = false;
            isSceneReadyRef.current = false;
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
            if (modelRef.current) {
                disposeModel(modelRef.current);
            }
            if (rendererRef.current) {
                rendererRef.current.dispose();
            }
        };
    }, [disposeModel]);

    if (!isVisible) return null;

    return (
        <View style={styles.container} {...panResponder.panHandlers}>
            <GLView
                style={styles.glView}
                onContextCreate={onContextCreate}
            />
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#00ff88" />
                    <Text style={styles.loadingText}>Loading 3D Model...</Text>
                </View>
            )}
            {loadError && (
                <View style={styles.errorOverlay}>
                    <Text style={styles.errorText}>{loadError}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 10,
    },
    glView: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    loadingText: {
        marginTop: 10,
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    errorOverlay: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        padding: 10,
        backgroundColor: 'rgba(255, 107, 107, 0.9)',
        borderRadius: 8,
    },
    errorText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 12,
    },
});
