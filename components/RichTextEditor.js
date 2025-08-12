// components/RichTextEditor.js
import React from 'react';
import 'react-quill/dist/quill.snow.css'; // استيراد الأنماط الأساسية للمحرر

// هذا الكود جاهز للاستخدام مع التحميل الديناميكي في لوحة التحكم
import Quill from 'react-quill';

const modules = {
    toolbar: [
        [{ 'header': [2, 3, false] }],
        ['bold', 'italic', 'underline', 'link'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['clean']
    ],
};

const formats = [
    'header',
    'bold', 'italic', 'underline', 'link',
    'list', 'bullet',
];

const RichTextEditor = ({ value, onChange }) => {
    return (
        <div className="bg-white rounded-md border">
            <Quill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder="Skriv din text här..."
            />
        </div>
    );
};

export default RichTextEditor;