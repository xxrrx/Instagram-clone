// Script to fix Firebase imports in all files
const fs = require('fs');
const path = require('path');

const filesToFix = [
    'components/Main.js',
    'components/auth/Login.js',
    'components/auth/Register.js',
    'components/main/add/Save.js',
    'components/main/chat/Chat.js',
    'components/main/chat/List.js',
    'components/main/post/Comment.js',
    'components/main/post/Post.js',
    'components/main/profile/Edit.js',
    'components/main/profile/Profile.js',
    'redux/actions/index.js'
];

filesToFix.forEach(file => {
    const filePath = path.join(__dirname, file);
    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // Replace the import statement
        content = content.replace(
            /import firebase from ['"]firebase['"];?/g,
            "import firebase from 'firebase/app';\nimport 'firebase/auth';\nimport 'firebase/firestore';\nimport 'firebase/storage';"
        );

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Fixed: ${file}`);
    } catch (error) {
        console.log(`✗ Error fixing ${file}:`, error.message);
    }
});

console.log('\nDone! All files have been processed.');
