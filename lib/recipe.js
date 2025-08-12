// lib/recipe.js
import config from './config';

// لا نستدعي mongodb أو connectToDatabase هنا في الأعلى

async function getPaginatedRecipes(query = {}, page = 1, limit = 10, sort = { datePublished: -1 }) {
    // --- بداية التعديل: استيراد ديناميكي هنا ---
    const { connectToDatabase } = await import('./mongodb.js');
    // --- نهاية التعديل ---
    const { db } = await connectToDatabase();
    const recipesCollection = db.collection('recipes');

    const skip = (page - 1) * limit;

    const totalCount = await recipesCollection.countDocuments(query);
    const data = await recipesCollection.find(query)
                                        .sort(sort)
                                        .skip(skip)
                                        .limit(limit)
                                        .toArray();

    return {
        data: data,
        total_count: totalCount,
        count: data.length,
        total_pages: Math.ceil(totalCount / limit),
        current_page: parseInt(page, 10),
    };
}

export async function getRecipe(page = 1, limit = config.blog.postPerPage) {
    const sort = { datePublished: -1 };
    return getPaginatedRecipes({}, page, limit, sort);
}

export async function getRecipeBySlug(slug) {
    // --- بداية التعديل: استيراد ديناميكي هنا ---
    const { connectToDatabase } = await import('./mongodb.js');
    // --- نهاية التعديل ---
    const { db } = await connectToDatabase();
    const recipe = await db.collection('recipes').findOne({
        $or: [{ slug: slug }, { slugHistory: slug }]
    });
    return recipe ? { data: [recipe] } : { data: [] };
}

export async function getAllRecipeSlugs() {
    // --- بداية التعديل: استيراد ديناميكي هنا ---
    const { connectToDatabase } = await import('./mongodb.js');
    // --- نهاية التعديل ---
    const { db } = await connectToDatabase();
    const recipes = await db.collection('recipes').find({}, { projection: { slug: 1 } }).toArray();
    return recipes.map(recipe => recipe.slug);
}

export async function getAllRecipes() {
    // --- بداية التعديل: استيراد ديناميكي هنا ---
    const { connectToDatabase } = await import('./mongodb.js');
    // --- نهاية التعديل ---
    const { db } = await connectToDatabase();
    const recipes = await db.collection('recipes').find({}).sort({ datePublished: -1 }).toArray();
    return { data: recipes, total_count: recipes.length };
}