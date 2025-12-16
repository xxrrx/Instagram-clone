
import { StyleSheet } from 'react-native'

// Modern Social Media Color Palette - Instagram/TikTok Inspired
export const colors = {
    // Primary Brand Colors
    electricBlue: '#00D4FF',      // Main brand color - buttons, links
    vibrantPurple: '#9D4EDD',     // Secondary brand - gradients
    hotPink: '#FF1493',           // Accent - CTAs, special actions
    
    // Action Colors
    coralRed: '#FF6B6B',          // Like/heart color
    freshGreen: '#06FFA5',        // Share/success color
    sunnyYellow: '#FFD700',       // Highlights/badges
    orange: '#FF8C42',            // Posts count/stats
    
    // UI Colors
    white: '#FFFFFF',
    offWhite: '#FAFAFA',
    lightGray: '#F5F5F5',
    gray: '#9E9E9E',
    darkGray: '#757575',
    dark: '#2D2D2D',
    black: '#000000',
    
    // Gradient Colors
    instagramPink: '#E1306C',
    instagramOrange: '#FD1D1D',
    instagramYellow: '#FCAF45',
    tiktokCyan: '#00F2EA',
    tiktokPink: '#FF0050',
};

// Modern Gradient Combinations
export const gradients = {
    instagram: [colors.instagramPink, colors.instagramOrange, colors.instagramYellow],
    tiktok: [colors.tiktokCyan, colors.tiktokPink],
    sunset: [colors.orange, colors.hotPink, colors.vibrantPurple],
    ocean: [colors.electricBlue, colors.tiktokCyan, colors.freshGreen],
    rainbow: [colors.coralRed, colors.orange, colors.sunnyYellow, colors.freshGreen, colors.electricBlue, colors.vibrantPurple],
    purple: [colors.vibrantPurple, colors.hotPink],
    blue: [colors.electricBlue, colors.vibrantPurple],
};

const utils = StyleSheet.create({
    centerHorizontal: {
        alignItems: 'center',
    },
    marginBottom: {
        marginBottom: 20,
    },
    marginBottomBar: {
        marginBottom: 330,
    },
    marginBottomSmall: {
        marginBottom: 10,
    },
    profileImageBig: {
        width: 80,
        height: 80,
        borderRadius: 80 / 2,
        borderWidth: 3,
        borderColor: colors.white,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5
    },
    profileImage: {
        marginRight: 15,
        width: 50,
        height: 50,
        borderRadius: 50 / 2,
        borderWidth: 2,
        borderColor: colors.white,
    },
    profileImageSmall: {
        marginRight: 15,
        width: 35,
        height: 35,
        borderRadius: 35 / 2,
        borderWidth: 2,
        borderColor: colors.white,
    },
    searchBar: {
        backgroundColor: colors.offWhite,
        color: colors.darkGray,
        paddingLeft: 15,
        borderRadius: 25,
        height: 45,
        marginTop: -5,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2
    },
    justifyCenter: {
        justifyContent: 'center',
    },
    alignItemsCenter: {
        alignItems: 'center'
    },
    padding15: {
        paddingTop: 15,
        paddingRight: 15,
        paddingLeft: 15,
    },
    padding10Top: {
        paddingTop: 10

    },
    padding10: {
        padding: 10
    },
    margin15: {
        margin: 15
    },
    padding10Sides: {
        paddingRight: 10,
        paddingLeft: 10,
    },
    margin15Left: {
        marginLeft: 15,
    },
    margin15Right: {
        marginRight: 15,
    },
    margin5Bottom: {
        marginBottom: 5,
    },
    backgroundWhite: {
        backgroundColor: colors.white,
    },
    borderTopGray: {
        borderTopWidth: 1,
        borderColor: colors.lightGray
    },
    borderWhite: {
        borderLeftWidth: 2,
        borderRightWidth: 2,
        borderTopWidth: 2,
        borderColor: colors.white
    },
    buttonOutlined: {
        padding: 10,
        color: colors.white,
        borderWidth: 2,
        borderColor: colors.electricBlue,
        borderRadius: 12,
        textAlign: 'center',
        backgroundColor: colors.white,
    },

    fixedRatio: {
        flex: 1,
        aspectRatio: 1
    },

    // Modern Button Styles - Instagram/TikTok Inspired
    buttonBlue: {
        backgroundColor: colors.electricBlue,
        padding: 14,
        borderRadius: 25,
        shadowColor: colors.electricBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6
    },
    buttonPurple: {
        backgroundColor: colors.vibrantPurple,
        padding: 14,
        borderRadius: 25,
        shadowColor: colors.vibrantPurple,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6
    },
    buttonGreen: {
        backgroundColor: colors.freshGreen,
        padding: 14,
        borderRadius: 25,
        shadowColor: colors.freshGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6
    },
    buttonRed: {
        backgroundColor: colors.coralRed,
        padding: 14,
        borderRadius: 25,
        shadowColor: colors.coralRed,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6
    },
    buttonYellow: {
        backgroundColor: colors.sunnyYellow,
        padding: 14,
        borderRadius: 25,
        shadowColor: colors.sunnyYellow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6
    },
    buttonOrange: {
        backgroundColor: colors.orange,
        padding: 14,
        borderRadius: 25,
        shadowColor: colors.orange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6
    },
    buttonPink: {
        backgroundColor: colors.hotPink,
        padding: 14,
        borderRadius: 25,
        shadowColor: colors.hotPink,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6
    },

    // Modern Card Styles - Elevated Design
    card: {
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8
    },
    cardSmall: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4
    },

    // Gradient Container Styles
    gradientHeader: {
        padding: 20,
        paddingTop: 50,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24
    },

    // Floating Action Button - Modern Style
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.hotPink,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.hotPink,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10
    },

    // Colorful Borders
    borderRainbow: {
        borderWidth: 3,
        borderRadius: 100,
        padding: 3
    },

    // Modern Backgrounds
    bgGradient: {
        flex: 1
    },
    bgLightGray: {
        backgroundColor: colors.offWhite
    },
    bgWhite: {
        backgroundColor: colors.white
    },
    
    // Icon Container Styles
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.lightGray
    },
    
    // Modern Divider
    divider: {
        height: 1,
        backgroundColor: colors.lightGray,
        marginVertical: 10
    }
})
const navbar = StyleSheet.create({

    image: {
        padding: 20
    },
    custom: {
        marginTop: 30,
        height: 60,
        backgroundColor: 'white',
        padding: 15,
        borderBottomWidth: 1,
        borderColor: 'lightgrey'
    },

    title: {
        fontWeight: '700',
        fontSize: 20//'larger',
    }
})
const container = StyleSheet.create({
    container: {
        flex: 1,
    },
    camera: {
        flex: 1,
        flexDirection: 'row'
    },
    input: {
        flexWrap: "wrap"
    },
    containerPadding: {
        flex: 1,
        padding: 15
    },
    center: {
        flex: 1,
    },
    horizontal: {
        flexDirection: 'row',
        display: 'flex',
    },
    form: {
        flex: 1,
        margin: 25
    },
    profileInfo: {
        padding: 25,
        flexDirection: 'column',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 'auto',

    },
    formCenter: {
        justifyContent: 'center',
        flex: 1,
        margin: 25
    },
    containerImage: {
        flex: 1 / 3

    },
    image: {
        aspectRatio: 1 / 1,
    },
    fillHorizontal: {
        flexGrow: 1,
        paddingBottom: 0
    },
    imageSmall: {
        aspectRatio: 1 / 1,
        height: 70
    },
    gallery: {

        borderWidth: 1,
        borderColor: 'gray',
    },
    splash: {
        padding: 200,
        height: '100%',
        width: '100%'
    },
    chatRight: {
        margin: 10,
        marginBottom: 10,
        backgroundColor: 'dodgerblue',
        padding: 10,
        borderRadius: 8,
        alignSelf: 'flex-end'

    },
    chatLeft: {
        margin: 10,
        marginBottom: 10,
        backgroundColor: 'grey',
        padding: 10,
        borderRadius: 8,
        alignItems: 'flex-end',
        textAlign: 'right',
        alignSelf: 'flex-start'
    }
})

const form = StyleSheet.create({
    textInput: {
        marginBottom: 10,
        borderColor: 'gray',
        backgroundColor: 'whitesmoke',
        padding: 10,
        borderWidth: 1,
        borderRadius: 8
    },
    bottomButton: {
        alignContent: 'center',
        borderTopColor: 'gray',
        borderTopWidth: 1,
        padding: 10,
        textAlign: 'center',
    },
    roundImage: {
        width: 100,
        height: 100,
        borderRadius: 100 / 2
    }

})

const text = StyleSheet.create({
    center: {
        textAlign: 'center',
    },
    notAvailable: {
        textAlign: 'center',
        fontWeight: '700',//'bolder',
        fontSize: 20//'large',
    },
    profileDescription: {
        fontWeight: '300'
    },
    changePhoto: {
        marginTop: 5,
        color: 'deepskyblue',
    },
    deepskyblue: {
        color: 'deepskyblue',
    },
    username: {
        fontWeight: '600',
        color: 'black',
    },
    name: {
        color: 'grey',
    },
    bold: {
        fontWeight: '700',
    },
    large: {
        fontSize: 20//'large'
    },
    small: {
        fontSize: 10//'large'
    },
    medium: {
        fontSize: 15, //'large'
        marginBottom: 10
    },
    grey: {
        color: 'grey'
    },
    green: {
        color: 'lightgreen'
    },
    white: {
        color: 'white'
    },
    whitesmoke: {
        color: 'whitesmoke'
    }



})

export { container, form, text, utils, navbar }    