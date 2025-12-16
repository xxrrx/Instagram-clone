#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const files = [
    'c:/Users/h1oo7/Desktop/instagram/InstagramClone-updated/frontend/components/main/post/Post.js',
    'c:/Users/h1oo7/Desktop/instagram/InstagramClone-updated/frontend/components/main/post/Comment.js',
    'c:/Users/h1oo7/Desktop/instagram/InstagramClone-updated/frontend/components/main/post/Feed.js',
    'c:/Users/h1oo7/Desktop/instagram/InstagramClone-updated/frontend/components/main/chat/Chat.js',
    'c:/Users/h1oo7/Desktop/instagram/InstagramClone-updated/frontend/components/main/chat/List.js',
    'c:/Users/h1oo7/Desktop/instagram/InstagramClone-updated/frontend/components/main/profile/Edit.js',
    'c:/Users/h1oo7/Desktop/instagram/InstagramClone-updated/frontend/components/main/profile/Profile.js',
];

const oldImports = [
    "import firebase from 'firebase/app';",
    "import firebase from 'firebase';",
    "import 'firebase/auth';",
    "import 'firebase/firestore';",
    "import 'firebase/storage';",
];

const newImports = `import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';`;

files.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');

        // Remove old imports
        oldImports.forEach(oldImport => {
            content = content.replace(new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
        });

        // Remove require statements
        content = content.replace(/require\(['"]firebase\/firestore['"]\)/g, '');
        content = content.replace(/require\(['"]firebase\/firebase-storage['"]\)/g, '');

        // Add new imports at the top (after other imports)
        const lines = content.split('\n');
        let insertIndex = 0;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().startsWith('import ') && !lines[i].includes('firebase')) {
                insertIndex = i + 1;
            }
        }
        lines.splice(insertIndex, 0, newImports);
        content = lines.join('\n');

        // Replace common Firebase v8 patterns with v10
        content = content.replace(/firebase\.auth\(\)\.currentUser/g, 'getAuth().currentUser');
        content = content.replace(/firebase\.auth\(\)/g, 'getAuth()');
        content = content.replace(/firebase\.firestore\(\)/g, 'getFirestore()');
        content = content.replace(/firebase\.storage\(\)/g, 'getStorage()');
        content = content.replace(/\.ref\(\)/g, ''); // Will need manual fix for storage refs
        content = content.replace(/firebase\.firestore\.FieldValue\.serverTimestamp\(\)/g, 'serverTimestamp()');

        fs.writeFileSync(file, content, 'utf8');
        console.log(`✅ Updated: ${path.basename(file)}`);
    } catch (err) {
        console.error(`❌ Error updating ${file}:`, err.message);
    }
});

console.log('\n🎉 Firebase v10 migration script completed!');
console.log('⚠️  Note: Some manual fixes may still be needed for complex Firestore queries.');
