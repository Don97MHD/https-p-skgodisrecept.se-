import React, { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import {
    PlusIcon, TrashIcon, CogIcon, SparklesIcon, BookOpenIcon,
    PencilAltIcon, ChevronDownIcon, ChevronUpIcon, LogoutIcon, DocumentTextIcon,
    ChevronLeftIcon, ChevronRightIcon, CollectionIcon, ExternalLinkIcon
} from '@heroicons/react/outline';

const useSecureFetch = () => {
    const secureFetch = useCallback(async (url, options = {}) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('admin-token') : null;
        if (!token) {
            const error = new Error('Authentication token not found.');
            error.statusCode = 401;
            throw error;
        }
        const headers = { ...options.headers, 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `An unknown error occurred with status: ${response.status}` }));
            const error = new Error(errorData.message);
            error.statusCode = response.status;
            throw error;
        }
        if (response.status === 204 || response.headers.get('content-length') === '0') return null;
        return response.json();
    }, []);
    return secureFetch;
};

const RichTextEditor = dynamic(() => import('../components/RichTextEditor'), {
    ssr: false, loading: () => <p className="p-4 border rounded-md">Loading text editor...</p>
});

const ImageUploader = ({ onUpload, currentImageUrl, label }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setError('');
        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('admin-token');

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Upload failed');
            }
            const data = await res.json();
            onUpload(data.url);
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };
    
    return (
        <div className="mt-2 p-4 border rounded-lg bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="flex items-center gap-4">
                {currentImageUrl && <img src={currentImageUrl} alt="Preview" className="w-24 h-24 object-cover rounded-md shadow-sm" />}
                <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    disabled={uploading}
                    className="bg-gray-200 px-4 py-2 rounded-md text-sm text-primary font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                    {uploading ? 'Uploading...' : (currentImageUrl ? 'Change Image' : 'Select Image')}
                </button>
            </div>
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" ref={fileInputRef} />
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        </div>
    );
};
const RecipeForm = ({ initialData, onSave }) => {
    const secureFetch = useSecureFetch();
    const initialRecipeState = { id: '', name: '', slug: '', image: [], steps: [{ step: '', image: [] }], servings: '', cookingTime: 'PTM', prepTime: 'PTM', totalTime: 'PTM', elsaIntro: '', description: '', recipeCategory: '', recipeCuisine: '', keywords: '', datePublished: new Date().toISOString().split('T')[0], ingredients: [{ unit: '', amount: '', product: '' }], aggregateRating: { "@type": "AggregateRating", "ratingValue": "4.5", "ratingCount": "1" }, nutrition: { "@type": "NutritionInformation", "calories": "" }};
    
    const [recipe, setRecipe] = useState(initialData || initialRecipeState);
    const [isEditing, setIsEditing] = useState(!!initialData);
    const [message, setMessage] = useState({ text: '', type: 'info' });
    const [availableCategories, setAvailableCategories] = useState([]);
    const jsonInputRef = useRef(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categories = await secureFetch('/api/admin/categories-api');
                setAvailableCategories(categories || []);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
                setMessage({ text: 'Could not load categories for selection.', type: 'error' });
            }
        };
        fetchCategories();
    }, [secureFetch]);

    useEffect(() => {
        const currentData = initialData || initialRecipeState;
        setRecipe({
            ...currentData,
            description: currentData.description || '',
            elsaIntro: currentData.elsaIntro || ''
        });
        setIsEditing(!!initialData);
        setMessage({ text: '', type: 'info' });
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'name') {
            const slug = value.toLowerCase().replace(/å|ä/g, 'a').replace(/ö/g, 'o').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
            setRecipe(prev => ({ ...prev, name: value, slug, id: slug }));
        } else {
            setRecipe(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleRichTextChange = (content, fieldName) => {
        setRecipe(prev => ({ ...prev, [fieldName]: content }));
    };

    const handleStepRichTextChange = (content, index) => {
        const list = [...recipe.steps];
        list[index].step = content;
        setRecipe(prev => ({ ...prev, steps: list }));
    };

    const handleListChange = (index, event, listName) => {
        const { name, value } = event.target;
        const list = [...recipe[listName]];
        list[index][name] = value;
        setRecipe({ ...recipe, [listName]: list });
    };

    const addListItem = (listName, item) => {
        setRecipe(prev => ({ ...prev, [listName]: [...(prev[listName] || []), item] }));
    };

    const removeListItem = (index, listName) => {
        const list = [...recipe[listName]];
        list.splice(index, 1);
        setRecipe({ ...recipe, [listName]: list });
    };

    const handleImageUpload = (url, listName, index) => {
        if (listName) {
            const list = [...recipe[listName]];
            list[index].image = [{ id: `step-img-${Date.now()}`, url, alt: "Step image" }];
            setRecipe({ ...recipe, [listName]: list });
        } else {
            setRecipe(prev => ({ ...prev, image: [{ id: `main-img-${Date.now()}`, url, alt: prev.name }] }));
        }
    };
    
    const handleJsonImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                const newRecipeState = { ...initialRecipeState, ...importedData };
                
                if (!newRecipeState.datePublished) {
                    newRecipeState.datePublished = new Date().toISOString().split('T')[0];
                }

                setRecipe(newRecipeState);
                setIsEditing(false);
                setMessage({ text: 'Recipe data imported successfully! Review and save.', type: 'success' });
            } catch (error) {
                setMessage({ text: `Error parsing JSON file: ${error.message}`, type: 'error' });
            }
        };
        reader.readAsText(file);
        event.target.value = null;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: 'Saving recipe...', type: 'info' });
        const method = isEditing ? 'PUT' : 'POST';
        
        try {
            await secureFetch('/api/recipes', {
                method: method,
                body: JSON.stringify(recipe),
            });
            setMessage({ text: 'Recipe has been saved!', type: 'success' });
            setTimeout(() => {
                onSave();
            }, 1000);
        } catch (error) {
            setMessage({ text: `Error: ${error.message}`, type: 'error' });
        }
    };

    const messageStyles = {
        info: 'bg-blue-100 text-blue-800',
        success: 'bg-green-100 text-green-800',
        error: 'bg-red-100 text-red-800',
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="p-6 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-sora font-semibold text-primary">
                        {isEditing ? `Editing: ${recipe.name}` : 'Create New Recipe'}
                    </h3>
                    <div>
                        <input
                            type="file"
                            accept=".json"
                            ref={jsonInputRef}
                            onChange={handleJsonImport}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => jsonInputRef.current.click()}
                            className="bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                            Import from JSON
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="name" value={recipe.name} onChange={handleChange} placeholder="Recipe Name" className="p-2 border rounded-md" required />
                    <input name="slug" value={recipe.slug} placeholder="URL Slug" className="p-2 border rounded-md bg-gray-200" readOnly />
                </div>
                <ImageUploader onUpload={(url) => handleImageUpload(url)} currentImageUrl={recipe.image?.[0]?.url} label="Main Image" />
            </div>

            <div className="p-6 border rounded-lg bg-gray-50">
                <h4 className="text-lg font-sora font-semibold mb-4 text-primary">Details & Category</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Recipe Category</label>
                        <select
                            name="recipeCategory"
                            value={recipe.recipeCategory}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md bg-white focus:ring-secondary focus:border-secondary"
                            required
                        >
                            <option value="" disabled>-- Select a category --</option>
                            {availableCategories.map(cat => (
                                <option key={cat.slug} value={cat.name}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine (e.g., Svensk)</label>
                        <input
                            name="recipeCuisine"
                            value={recipe.recipeCuisine || ''}
                            onChange={handleChange}
                            placeholder="e.g., Svensk, Fransk"
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
                </div>
                <div className="mt-6">
                     <label className="block text-sm font-medium text-gray-700 mb-2">Keywords (comma separated)</label>
                     <input
                        name="keywords"
                        value={recipe.keywords || ''}
                        onChange={handleChange}
                        placeholder="tårta, fika, kalas..."
                        className="w-full p-2 border rounded-md"
                    />
                </div>
                 <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (shown on the recipe page)</label>
                    <RichTextEditor value={recipe.description || ''} onChange={(c) => handleRichTextChange(c, 'description')} />
                 </div>
                 <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Elsa's Intro (shown in a quote box)</label>
                    <RichTextEditor value={recipe.elsaIntro || ''} onChange={(c) => handleRichTextChange(c, 'elsaIntro')} />
                 </div>
            </div>

            <div className="p-6 border rounded-lg bg-gray-50">
                <h4 className="text-lg font-sora font-semibold mb-4 text-primary">Ingredients</h4>
                {recipe.ingredients?.map((ing, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr,1fr,2fr,auto] gap-2 mb-2 items-center">
                        <input name="amount" value={ing.amount || ''} onChange={e => handleListChange(index, e, 'ingredients')} placeholder="Amount" type="text" className="p-2 border rounded-md" />
                        <input name="unit" value={ing.unit || ''} onChange={e => handleListChange(index, e, 'ingredients')} placeholder="Unit" className="p-2 border rounded-md" />
                        <input name="product" value={ing.product || ''} onChange={e => handleListChange(index, e, 'ingredients')} placeholder="Ingredient / Heading" className="p-2 border rounded-md" required/>
                        <button type="button" onClick={() => removeListItem(index, 'ingredients')} className="p-2 text-red-500 hover:text-red-700"><TrashIcon className="h-5 w-5"/></button>
                    </div>
                ))}
                <button type="button" onClick={() => addListItem('ingredients', { unit: '', amount: '', product: '' })} className="mt-2 text-blue-600 text-sm font-semibold flex items-center gap-1 hover:underline"><PlusIcon className="h-4 w-4"/> Add Ingredient</button>
            </div>
            
            <div className="p-6 border rounded-lg bg-gray-50">
                <h4 className="text-lg font-sora font-semibold mb-4 text-primary">Step-by-step Instructions</h4>
                {recipe.steps?.map((step, index) => (
                    <div key={index} className="mb-4 p-4 border rounded-md bg-white">
                        <div className="flex items-start gap-2">
                           <span className="font-bold text-secondary mt-2">{index + 1}.</span>
                            <div className="w-full">
                                <RichTextEditor
                                    value={step.step || ''}
                                    onChange={(content) => handleStepRichTextChange(content, index)}
                                />
                            </div>
                           <button type="button" onClick={() => removeListItem(index, 'steps')}><TrashIcon className="h-5 w-5 text-red-500 hover:text-red-700"/></button>
                        </div>
                        <ImageUploader onUpload={(url) => handleImageUpload(url, 'steps', index)} currentImageUrl={step.image?.[0]?.url} label="Optional image for this step"/>
                    </div>
                ))}
                <button type="button" onClick={() => addListItem('steps', { step: '', image: [] })} className="text-blue-600 text-sm font-semibold flex items-center gap-1 hover:underline"><PlusIcon className="h-4 w-4"/> Add Step</button>
            </div>

            <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={onSave} className="bg-gray-200 text-primary font-semibold px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                <button type="submit" className="bg-secondary text-white font-semibold px-8 py-3 rounded-lg hover:bg-opacity-90 transition-colors">Save Recipe</button>
            </div>
            {message.text && <p className={`text-center mt-4 p-3 rounded-md ${messageStyles[message.type]}`}>{message.text}</p>}
        </form>
    );
};
const ManageRecipesTab = ({ onEdit }) => {
    const secureFetch = useSecureFetch();
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const recipesPerPage = 10;
    
    const fetchRecipes = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await secureFetch('/api/recipes');
            setRecipes(Array.isArray(data) ? data : []);
        } catch (err) {
            if (err.statusCode === 401) {
                setError('Your session has expired. Please log out and log in again.');
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    }, [secureFetch]);

    useEffect(() => {
        fetchRecipes();
    }, [fetchRecipes]);

    const handleDelete = async (recipeId, recipeName) => {
        if (window.confirm(`Are you sure you want to delete the recipe "${recipeName}"? This action cannot be undone.`)) {
            try {
                await secureFetch(`/api/recipes?id=${recipeId}`, { method: 'DELETE' });
                alert(`"${recipeName}" has been deleted.`);
                fetchRecipes();
            } catch (err) {
                alert(`Could not delete recipe: ${err.message}`);
            }
        }
    };

    const indexOfLastRecipe = currentPage * recipesPerPage;
    const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
    const currentRecipes = recipes.slice(indexOfFirstRecipe, indexOfLastRecipe);
    const totalPages = Math.ceil(recipes.length / recipesPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) return <p>Loading recipes...</p>;
    if (error) return <p className="text-red-500">Error fetching recipes: {error}</p>;
    
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-sora font-semibold text-primary">Manage Recipes ({recipes.length} total)</h3>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
                {currentRecipes.map(recipe => (
                    <div key={recipe._id} className="flex justify-between items-center p-3 border-b last:border-b-0">
                        <span className="font-semibold text-primary">{recipe.name}</span>
                        <div className="flex items-center gap-3">
                            <button onClick={() => onEdit(recipe)} className="text-blue-600 hover:underline text-sm p-1 flex items-center gap-1 font-semibold"><PencilAltIcon className="h-4 w-4"/> Edit</button>
                            <button onClick={() => handleDelete(recipe._id, recipe.name)} className="text-red-600 hover:underline text-sm p-1 flex items-center gap-1 font-semibold"><TrashIcon className="h-4 w-4"/> Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center pt-4 space-x-2">
                    <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-md bg-gray-200 disabled:opacity-50"><ChevronLeftIcon className="h-5 w-5" /></button>
                    <span className="text-sm font-semibold">Page {currentPage} of {totalPages}</span>
                    <button onClick={() => paginate(currentPage + 1)} disabled={indexOfLastRecipe >= recipes.length} className="p-2 rounded-md bg-gray-200 disabled:opacity-50"><ChevronRightIcon className="h-5 w-5" /></button>
                </div>
            )}
        </div>
    );
};

const ManagePagesTab = () => {
    const secureFetch = useSecureFetch();
    const [pages, setPages] = useState([]);
    const [editingPage, setEditingPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const fetchPages = useCallback(async () => {
        setLoading(true);
        try {
            const data = await secureFetch('/api/admin/pages-api');
            setPages(data);
        } catch (error) {
            setMessage(`Error fetching pages: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [secureFetch]);

    useEffect(() => {
        fetchPages();
    }, [fetchPages]);

    const handleSave = async (pageKey, updatedContent) => {
        const updatedPages = pages.map(p => p.key === pageKey ? updatedContent : p);
        try {
            await secureFetch('/api/admin/pages-api', {
                method: 'POST',
                body: JSON.stringify(updatedPages),
            });
            setMessage('Page has been saved!');
            setPages(updatedPages);
            setEditingPage(null);
        } catch (error) {
            setMessage(`Could not save: ${error.message}`);
        }
        setTimeout(() => setMessage(''), 3000);
    };

    if (loading) return <p>Loading pages...</p>;
    if (message && !editingPage) return <p>{message}</p>;

    if (editingPage) {
        return <PageEditorForm page={editingPage} onSave={handleSave} onCancel={() => setEditingPage(null)} message={message} />;
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-sora font-semibold text-primary">Manage Pages</h3>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
                {pages.map(page => (
                    <div key={page.key} className="flex justify-between items-center p-3 border-b last:border-b-0">
                        <span className="font-semibold text-primary">{page.headline}</span>
                        <div className="flex items-center gap-3">
                            <a href={page.path} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-secondary text-sm p-1 flex items-center gap-1 font-semibold"><ExternalLinkIcon className="h-4 w-4"/> View</a>
                            <button onClick={() => setEditingPage(page)} className="text-blue-600 hover:underline text-sm p-1 flex items-center gap-1 font-semibold"><PencilAltIcon className="h-4 w-4"/> Edit</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PageEditorForm = ({ page, onSave, onCancel, message }) => {
    const [content, setContent] = useState(page);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setContent(prev => ({ ...prev, [name]: value }));
    };

    const handleRichTextChange = (value, fieldName) => {
        setContent(prev => ({ ...prev, [fieldName]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(page.key, content);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-6 rounded-lg border">
            <h3 className="text-xl font-sora font-semibold text-primary">Editing: {page.headline}</h3>
            <div>
                <label className="block text-sm font-medium text-gray-700">Meta Title</label>
                <input name="title" value={content.title} onChange={handleChange} className="w-full p-2 border rounded-md mt-1" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Meta Description</label>
                <textarea name="meta_description" value={content.meta_description} onChange={handleChange} className="w-full p-2 border rounded-md mt-1" rows="3" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Main Headline (H1)</label>
                <input name="headline" value={content.headline} onChange={handleChange} className="w-full p-2 border rounded-md mt-1" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Body Content</label>
                <RichTextEditor value={content.body} onChange={(val) => handleRichTextChange(val, 'body')} />
            </div>
            {message && <p className="text-green-600">{message}</p>}
            <div className="flex justify-end gap-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-primary font-semibold px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                <button type="submit" className="bg-secondary text-white font-semibold px-8 py-3 rounded-lg hover:bg-opacity-90 transition-colors">Save Page</button>
            </div>
        </form>
    );
};

const ManageCategoriesTab = () => {
    const secureFetch = useSecureFetch();
    const [categories, setCategories] = useState([]);
    const [editingCategory, setEditingCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const data = await secureFetch('/api/admin/categories-api');
            setCategories(data);
        } catch (error) {
            setMessage(`Error fetching categories: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [secureFetch]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleSave = async (updatedCategory) => {
        let updatedCategories;
        if (categories.find(c => c.slug === updatedCategory.slug)) {
            updatedCategories = categories.map(c => c.slug === updatedCategory.slug ? updatedCategory : c);
        } else {
            updatedCategories = [...categories, updatedCategory];
        }

        try {
            await secureFetch('/api/admin/categories-api', {
                method: 'POST',
                body: JSON.stringify(updatedCategories),
            });
            setMessage('Category has been saved!');
            setCategories(updatedCategories);
            setEditingCategory(null);
        } catch (error) {
            setMessage(`Could not save: ${error.message}`);
        }
         setTimeout(() => setMessage(''), 3000);
    };

    const handleDelete = async (slugToDelete) => {
        if (!window.confirm(`Are you sure you want to delete the category "${slugToDelete}"?`)) return;

        const updatedCategories = categories.filter(c => c.slug !== slugToDelete);
        try {
            await secureFetch('/api/admin/categories-api', {
                method: 'POST',
                body: JSON.stringify(updatedCategories),
            });
            setMessage('Category has been deleted!');
            setCategories(updatedCategories);
        } catch (error) {
            setMessage(`Could not delete: ${error.message}`);
        }
         setTimeout(() => setMessage(''), 3000);
    };

    if (loading) return <p>Loading categories...</p>;

    if (editingCategory) {
        const categoryData = editingCategory === 'new' 
            ? { slug: '', filterTerm: '', name: '', headline: '', meta_description: '', body: '' }
            : editingCategory;
        return <CategoryEditorForm category={categoryData} onSave={handleSave} onCancel={() => setEditingCategory(null)} message={message} isNew={editingCategory === 'new'}/>;
    }

    return (
        <div className="space-y-4">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-sora font-semibold text-primary">Manage Categories</h3>
                <button onClick={() => setEditingCategory('new')} className="bg-secondary text-white font-semibold px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"><PlusIcon className="h-5 w-5"/> Add New</button>
            </div>
            {message && <p className="text-green-600">{message}</p>}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
                {categories.map(cat => (
                    <div key={cat.slug} className="flex justify-between items-center p-3 border-b last:border-b-0">
                        <span className="font-semibold text-primary">{cat.name}</span>
                        <div className="flex items-center gap-3">
                             <a href={`/kategori/${cat.slug}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-secondary text-sm p-1 flex items-center gap-1 font-semibold"><ExternalLinkIcon className="h-4 w-4"/> View</a>
                            <button onClick={() => setEditingCategory(cat)} className="text-blue-600 hover:underline text-sm p-1 flex items-center gap-1 font-semibold"><PencilAltIcon className="h-4 w-4"/> Edit</button>
                            <button onClick={() => handleDelete(cat.slug)} className="text-red-600 hover:underline text-sm p-1 flex items-center gap-1 font-semibold"><TrashIcon className="h-4 w-4"/> Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CategoryEditorForm = ({ category, onSave, onCancel, message, isNew }) => {
    const [content, setContent] = useState(category);

    useEffect(() => {
        if(isNew && content.name) {
            const newSlug = content.name.toLowerCase().replace(/å|ä/g, 'a').replace(/ö/g, 'o').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
            setContent(prev => ({...prev, slug: newSlug}));
        }
    }, [content.name, isNew]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setContent(prev => ({ ...prev, [name]: value }));
    };

    const handleRichTextChange = (value, fieldName) => {
        setContent(prev => ({ ...prev, [fieldName]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.slug || !content.name || !content.filterTerm) {
            alert("Slug, Name, and Filter Term are required fields.");
            return;
        }
        onSave(content);
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-6 rounded-lg border">
            <h3 className="text-xl font-sora font-semibold text-primary">{isNew ? 'Create New Category' : `Editing: ${category.name}`}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name (e.g., "Meringue Cakes")</label>
                    <input name="name" value={content.name} onChange={handleChange} className="w-full p-2 border rounded-md mt-1" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">URL Slug (auto-generated)</label>
                    <input name="slug" value={content.slug} onChange={handleChange} className="w-full p-2 border rounded-md mt-1 bg-gray-200" readOnly={!isNew} required />
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Filter Term</label>
                <input name="filterTerm" value={content.filterTerm} onChange={handleChange} className="w-full p-2 border rounded-md mt-1" placeholder="e.g., marängtårta (lowercase)" required/>
                <p className="text-xs text-gray-500 mt-1">This word is used to find recipes. Must match text in the recipes' "recipeCategory" field.</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Meta Title</label>
                <input name="meta_description" value={content.meta_description} onChange={handleChange} className="w-full p-2 border rounded-md mt-1" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Meta Description</label>
                <input name="headline" value={content.headline} onChange={handleChange} className="w-full p-2 border rounded-md mt-1" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Body Content</label>
                <RichTextEditor value={content.body} onChange={(val) => handleRichTextChange(val, 'body')} />
            </div>
            {message && <p className="text-green-600">{message}</p>}
            <div className="flex justify-end gap-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-primary font-semibold px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                <button type="submit" className="bg-secondary text-white font-semibold px-8 py-3 rounded-lg hover:bg-opacity-90 transition-colors">Save Category</button>
            </div>
        </form>
    );
};
const SettingsForm = () => {
    const secureFetch = useSecureFetch();
    // 👇 قمنا بتوسيع الحالة الافتراضية لتشمل كل الحقول
    const [settings, setSettings] = useState({ 
        title: '', 
        description: '', 
        siteUrl: '', 
        language: 'sv', 
        blog: { postPerPage: 9 }, 
        aiApiUrl: '' 
    });
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState({ text: '', type: 'info' });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await secureFetch('/api/settings');
                // 👇 التأكد من أن `blog` هو كائن لتجنب الأخطاء
                if (data) {
                    setSettings({ blog: { postPerPage: 9 }, ...data });
                }
            } catch (error) {
                setMessage({ text: `Could not load settings: ${error.message}`, type: 'error' });
            }
        };
        fetchSettings();
    }, [secureFetch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "postPerPage") {
            setSettings(prev => ({ 
                ...prev, 
                blog: { ...prev.blog, postPerPage: parseInt(value, 10) || 9 }
            }));
        } else {
            setSettings(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: 'Saving settings...', type: 'info' });
        try {
            await secureFetch('/api/settings', {
                method: 'POST',
                body: JSON.stringify({ siteConfig: settings, newPassword }),
            });
            setMessage({ text: 'Settings have been saved! Some changes may require a server restart.', type: 'success' });
            setNewPassword('');
        } catch (error) {
            setMessage({ text: `Error: ${error.message}`, type: 'error' });
        }
         setTimeout(() => setMessage({text: '', type: 'info'}), 5000);
    };
    
 const messageStyles = {
        info: 'bg-blue-100 text-blue-800',
        success: 'bg-green-100 text-green-800',
        error: 'bg-red-100 text-red-800',
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-xl font-sora font-semibold text-primary">General Site Settings</h3>
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Site Title</label>
                <input id="title" name="title" value={settings.title || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
            </div>
             <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Default SEO Description</label>
                <textarea id="description" name="description" value={settings.description || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" rows="3"></textarea>
            </div>
             <div>
                <label htmlFor="siteUrl" className="block text-sm font-medium text-gray-700">Site URL</label>
                <input id="siteUrl" name="siteUrl" type="url" value={settings.siteUrl || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" placeholder="https://yourdomain.com"/>
            </div>

            {/* 👇 الحقول الجديدة التي تمت إضافتها */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700">Site Language</label>
                    <input id="language" name="language" value={settings.language || 'sv'} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" placeholder="e.g., sv" />
                </div>
                <div>
                    <label htmlFor="postPerPage" className="block text-sm font-medium text-gray-700">Recipes Per Page</label>
                    <input id="postPerPage" name="postPerPage" type="number" value={settings.blog?.postPerPage || 9} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
                </div>
            </div>
            
            <h3 className="text-xl font-sora font-semibold text-primary border-t pt-6 mt-6">Security</h3>
             <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Leave blank to keep current" className="mt-1 w-full p-2 border rounded-md" />
            </div>
               <h3 className="text-xl font-sora font-semibold text-primary border-t pt-6 mt-6">AI Settings</h3>
            <div>
                <label htmlFor="aiApiUrl" className="block text-sm font-medium text-gray-700">AI Server API URL</label>
                <input id="aiApiUrl" name="aiApiUrl" type="url" value={settings.aiApiUrl || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" placeholder="http://localhost:11434" />
                <p className="text-xs text-gray-500 mt-1">Enter the full URL to your Ollama server, e.g. http://localhost:11434.</p>
            </div>
            <button type="submit" className="w-full bg-secondary text-white font-semibold px-8 py-3 rounded-lg hover:bg-opacity-90 transition-colors">Save Settings</button>
            {message.text && <p className={`text-center mt-4 p-3 rounded-md ${messageStyles[message.type]}`}>{message.text}</p>}
        </form>
    );
};

const LoginForm = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Incorrect password');
            }
            const { token } = await res.json();
            localStorage.setItem('admin-token', token);
            onLogin(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="bg-surface p-8 rounded-xl shadow-2xl w-full max-w-sm">
                <h1 className="text-3xl font-bold font-sora mb-6 text-center text-primary">Admin Panel</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="password-input" className="sr-only">Password</label>
                        <input
                            id="password-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary text-white p-3 rounded-lg hover:bg-opacity-90 font-semibold transition-colors disabled:bg-opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Logging in...' : 'Log In'}
                    </button>
                    {error && <p className="text-red-600 text-center text-sm mt-4">{error}</p>}
                </form>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('manage-recipes');
    const [recipeToEdit, setRecipeToEdit] = useState(null);

    const handleLogout = () => {
        if (confirm('Are you sure you want to log out?')) {
            localStorage.removeItem('admin-token');
            window.location.reload();
        }
    };
    const handleEditRecipe = (recipe) => {
        setRecipeToEdit(recipe);
        setActiveTab('add-edit-recipe');
    };
    const handleSaveAndSwitch = () => {
        setRecipeToEdit(null);
        setActiveTab('manage-recipes');
    };
    
    const TabButton = ({ tabName, icon: Icon, children }) => (
        <button
            onClick={() => { if(activeTab !== tabName) { setRecipeToEdit(null); setActiveTab(tabName); } }}
            className={`flex items-center gap-2 py-3 px-4 rounded-t-md transition-colors border-b-2 text-sm font-semibold whitespace-nowrap ${ activeTab === tabName ? 'border-secondary text-primary' : 'border-transparent text-gray-500 hover:text-primary' }`}
        >
            <Icon className="h-5 w-5" />
            {children}
        </button>
    );

    const renderTabContent = () => {
       switch (activeTab) {
            case 'manage-recipes': return <ManageRecipesTab onEdit={handleEditRecipe} />;
            case 'add-edit-recipe': return <RecipeForm initialData={recipeToEdit} onSave={handleSaveAndSwitch} />;
            case 'manage-pages': return <ManagePagesTab />;
            case 'manage-categories': return <ManageCategoriesTab />;
            case 'settings': return <SettingsForm />;
            default: return <p>Select a tab to begin.</p>;
       }
    };
return (
        <div className="min-h-screen bg-background font-poppins">
            <header className="bg-surface shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
                    <h1 className="text-xl font-sora font-bold text-primary">Admin Panel</h1>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors">
                        <LogoutIcon className="h-5 w-5" />
                        Log Out
                    </button>
                </div>
            </header>
            <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="bg-surface rounded-lg shadow-md">
                    <div className="flex border-b border-gray-extra-light overflow-x-auto">
                        <div className="flex flex-nowrap px-4">
                            <TabButton tabName="manage-recipes" icon={BookOpenIcon}>Manage Recipes</TabButton>
                            <TabButton tabName="add-edit-recipe" icon={PencilAltIcon}>{recipeToEdit ? 'Edit Recipe' : 'Add Recipe'}</TabButton>
                            <TabButton tabName="manage-pages" icon={DocumentTextIcon}>Manage Pages</TabButton>
                            <TabButton tabName="manage-categories" icon={CollectionIcon}>Manage Categories</TabButton>
                            <TabButton tabName="settings" icon={CogIcon}>Settings</TabButton>
                        </div>
                    </div>
                    <div className="p-4 md:p-8">
                        {renderTabContent()}
                    </div>
                </div>
            </main>
        </div>
    );
};


const AdminPage = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('admin-token');
        if (token) {
            setIsLoggedIn(true);
        }
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-background"><p>Loading...</p></div>;
    }
     return (
        <>
            <Head>
                <meta name="robots" content="noindex, nofollow" />
                <title>Admin Panel | bakatårta.se</title>
            </Head>
            {isLoggedIn ? <AdminDashboard /> : <LoginForm onLogin={setIsLoggedIn} />}
        </>
    );
};

export default AdminPage;
export async function getStaticProps() { return { props: {} }; }