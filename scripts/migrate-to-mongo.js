// scripts/migrate-content-to-mongo.js
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const { MONGODB_URI, MONGODB_DB } = process.env;

// 👇 الخطوة 1: إضافة مسار ملف الوصفات
const recipesFilePath = path.join(process.cwd(), 'data', 'recipes.json');
const pagesFilePath = path.join(process.cwd(), 'data', 'pages.json');
const categoriesFilePath = path.join(process.cwd(), 'data', 'categories.json');
const siteConfigFilePath = path.join(process.cwd(), 'data', 'siteConfig.json');

/**
 * دالة عامة لترحيل مصفوفة من المستندات من ملف JSON إلى مجموعة في MongoDB
 */
async function migrateCollection(client, dbName, collectionName, filePath) {
    console.log(`\n--- Starting migration for collection: "${collectionName}" ---`);
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    if (!fs.existsSync(filePath)) {
        console.log(`Skipping: File not found at ${filePath}`);
        return;
    }

    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        
        if (!Array.isArray(data)) {
            console.error(`Error: Data in ${filePath} is not an array.`);
            return;
        }

        console.log(`Found ${data.length} documents in the JSON file.`);

        if (data.length > 0) {
            await collection.deleteMany({});
            console.log(`Cleared existing data from the "${collectionName}" collection.`);
            const result = await collection.insertMany(data);
            console.log(`${result.insertedCount} documents successfully inserted into the "${collectionName}" collection.`);
        } else {
            console.log(`No data to migrate for "${collectionName}".`);
        }
    } catch (jsonError) {
        console.error(`\n❌ CRITICAL ERROR: Failed to parse JSON from ${filePath}.`);
        console.error(`Please validate the file content. Error: ${jsonError.message}`);
        // نوقف العملية كلها إذا فشل تحليل ملف JSON
        throw new Error(`Invalid JSON in ${filePath}`);
    }
}

/**
 * دالة خاصة لترحيل الإعدادات كمستند واحد
 */
async function migrateSettings(client, dbName, collectionName, filePath) {
    // ... (هذه الدالة لا تحتاج إلى تعديل)
    console.log(`\n--- Starting migration for single document: "${collectionName}" ---`);
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    if (!fs.existsSync(filePath)) {
        console.log(`Skipping: File not found at ${filePath}`);
        return;
    }

    const siteConfigData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const settingsDocument = {
        key: "main_settings",
        ...siteConfigData
    };
    console.log('Prepared settings document.');

    await collection.deleteMany({ key: "main_settings" });
    console.log('Cleared old settings document.');
    
    await collection.insertOne(settingsDocument);
    console.log('Successfully inserted the new settings document.');
}

/**
 * الدالة الرئيسية لتشغيل كل عمليات الترحيل
 */
async function runAllMigrations() {
    if (!MONGODB_URI || !MONGODB_DB) {
        console.error("Migration Error: MONGODB_URI and MONGODB_DB must be defined in your .env.local file.");
        return;
    }

    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log("Successfully connected to MongoDB.");

        // 👇 الخطوة 2: إضافة ترحيل الوصفات إلى القائمة
        // 1. Migrate Recipes
        await migrateCollection(client, MONGODB_DB, 'recipes', recipesFilePath);

        // 2. Migrate Pages
        await migrateCollection(client, MONGODB_DB, 'pages', pagesFilePath);

        // 3. Migrate Categories
        await migrateCollection(client, MONGODB_DB, 'categories', categoriesFilePath);
        
        // 4. Migrate Settings
        await migrateSettings(client, MONGODB_DB, 'settings', siteConfigFilePath);

        console.log("\n✅ All migrations completed successfully!");

    } catch (err) {
        console.error("\n❌ An error occurred during the migration process:", err);
    } finally {
        await client.close();
        console.log("\nMongoDB connection closed.");
    }
}

// تشغيل السكربت
runAllMigrations().catch(console.dir);