'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Tipe data untuk konsistensi
interface Project { title: string; tech: string[]; imgSrc: string; }
interface Tool { name: string; icon: string; }
interface PortfolioData { aboutMe: string; education: { university: string; major: string; period: string; }; tools: Tool[]; projects: Project[]; }

export default function Dashboard() {
    const [data, setData] = useState<PortfolioData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState<{ type: 'project' | 'tool'; index: number } | null>(null);

    const fetchData = () => {
        setLoading(true);
        fetch('/api/data', { cache: 'no-store' })
            .then(res => {
                if (!res.ok) { return res.json().then(errData => { throw new Error(errData.message || 'Unknown server error'); }); }
                return res.json();
            })
            .then(initialData => {
                setData(initialData);
                setError(null);
            })
            .catch(err => {
                console.error("Failed to load data:", err);
                setError(err.message);
            })
            .finally(() => { setLoading(false); });
    };

    useEffect(() => { fetchData(); }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('education.')) {
            const field = name.split('.')[1];
            setData(prev => prev ? { ...prev, education: { ...prev.education, [field]: value } } : null);
        } else {
            setData(prev => prev ? { ...prev, [name]: value } : null);
        }
    };

    const handleArrayChange = (arrayName: 'projects' | 'tools', index: number, field: string, value: string) => {
        setData(prevData => {
            if (!prevData || !Array.isArray(prevData[arrayName])) { return prevData; }
            const newArray = [...prevData[arrayName]];
            const item = { ...newArray[index] };
            if (field === 'tech' && 'tech' in item) { (item as Project).tech = value.split(',').map(t => t.trim()); } else { (item as any)[field] = value; }
            newArray[index] = item;
            return { ...prevData, [arrayName]: newArray };
        });
    };

    const handleAddItem = (arrayName: 'projects' | 'tools') => {
        const newItem = arrayName === 'projects' ? { title: 'New Project', tech: [], imgSrc: '' } : { name: 'New Tool', icon: '' };
        setData(prev => prev ? { ...prev, [arrayName]: [...prev[arrayName], newItem] } : null);
    };

    const handleRemoveItem = (arrayName: 'projects' | 'tools', index: number) => {
        setData(prev => prev ? { ...prev, [arrayName]: prev[arrayName].filter((_, i) => i !== index) } : null);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'project' | 'tool', index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading({ type, index });
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch('/api/upload', { method: 'POST', body: formData });
            const result = await response.json();
            if (!response.ok) { throw new Error(result.message || 'Upload failed due to a server error.'); }
            const fieldToUpdate = type === 'project' ? 'imgSrc' : 'icon';
            handleArrayChange(type, index, fieldToUpdate, result.path);
        } catch (error: any) {
            console.error('Upload Error:', error);
            alert(`Upload Error: ${error.message}`);
        } finally { setUploading(null); }
    };
    
    const handleSave = async () => {
        if (!data) return;
        setSaving(true);
        setMessage('');
        setError(null);
        try {
            const response = await fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            const result = await response.json();
            if (!response.ok) { throw new Error(result.message || 'Failed to save data.'); }
            setMessage(result.message);
            fetchData();
        } catch (error: any) { setError(error.message); } 
        finally {
            setSaving(false);
            setTimeout(() => { setMessage(''); setError(null); }, 4000);
        }
    };
    
    if (loading) return <p className="text-center p-10 text-white">Loading dashboard...</p>;
    if (error && !data) return <p className="text-center p-10 text-red-400 bg-red-900/20 rounded-lg m-8">Error: {error}</p>;
    if (!data) return <p className="text-center p-10 text-yellow-400">No data found.</p>;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 bg-gray-900 text-white font-sans min-h-screen">
            <div className="flex justify-between items-center mb-8"><h1 className="text-4xl font-bold">Dashboard</h1><a href="/" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline">Lihat Portofolio</a></div>
            <div className="space-y-12">
                <div><h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">About Me</h2><textarea name="aboutMe" value={data.aboutMe} onChange={handleInputChange} rows={5} className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
                <div><h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">Education</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-400">University</label><input type="text" name="education.university" value={data.education.university} onChange={handleInputChange} className="w-full mt-1 p-2 bg-gray-800 border border-gray-700 rounded-md"/></div><div><label className="block text-sm font-medium text-gray-400">Major</label><input type="text" name="education.major" value={data.education.major} onChange={handleInputChange} className="w-full mt-1 p-2 bg-gray-800 border border-gray-700 rounded-md"/></div><div><label className="block text-sm font-medium text-gray-400">Period</label><input type="text" name="education.period" value={data.education.period} onChange={handleInputChange} className="w-full mt-1 p-2 bg-gray-800 border border-gray-700 rounded-md"/></div></div></div>
                <div>
                    <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2"><h2 className="text-2xl font-semibold">Projects</h2><button onClick={() => handleAddItem('projects')} className="text-sm bg-green-600 px-3 py-1 rounded-md hover:bg-green-700">+</button></div>
                    <div className="space-y-6">{data.projects.map((project, index) => (<div key={index} className="bg-gray-800 p-4 rounded-lg flex flex-col md:flex-row gap-4 items-start"><div className="flex-grow space-y-3 w-full"><input type="text" placeholder="Project Title" value={project.title} onChange={(e) => handleArrayChange('projects', index, 'title', e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"/><input type="text" placeholder="Tech (comma separated)" value={project.tech.join(', ')} onChange={(e) => handleArrayChange('projects', index, 'tech', e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"/><div className='flex items-center gap-4'>{project.imgSrc && <div className="relative w-20 h-20 rounded-md overflow-hidden shrink-0"><Image src={project.imgSrc} alt="Preview" fill sizes="80px" className="object-cover" /></div>}<div><label htmlFor={`upload-project-${index}`} className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">{uploading?.type === 'project' && uploading.index === index ? 'Uploading...' : 'Upload Image'}</label><input id={`upload-project-${index}`} type="file" onChange={(e) => handleFileUpload(e, 'project', index)} className="hidden" disabled={uploading?.type === 'project' && uploading.index === index} />{project.imgSrc && <p className="text-xs text-gray-400 mt-1 truncate w-40" title={project.imgSrc}>{project.imgSrc}</p>}</div></div></div><button onClick={() => handleRemoveItem('projects', index)} className="text-red-500 hover:text-red-400 font-bold text-xl p-2 md:p-0 shrink-0">&times;</button></div>))}</div>
                </div>
                 <div>
                    <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2"><h2 className="text-2xl font-semibold">Tools & Others</h2><button onClick={() => handleAddItem('tools')} className="text-sm bg-green-600 px-3 py-1 rounded-md hover:bg-green-700">+</button></div>
                    <div className="space-y-4">{data.tools.map((tool, index) => (<div key={index} className="bg-gray-800 p-4 rounded-lg flex gap-4 items-center"><div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0 bg-gray-700">{tool.icon && <Image src={tool.icon} alt="Icon" fill sizes="48px" className="object-contain"/>}</div><div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4"><input type="text" placeholder="Tool Name" value={tool.name} onChange={(e) => handleArrayChange('tools', index, 'name', e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"/><div><label htmlFor={`upload-tool-${index}`} className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">{uploading?.type === 'tool' && uploading.index === index ? 'Uploading...' : 'Upload Icon'}</label><input id={`upload-tool-${index}`} type="file" onChange={(e) => handleFileUpload(e, 'tool', index)} className="hidden" disabled={uploading?.type === 'tool' && uploading.index === index} />{tool.icon && <p className="text-xs text-gray-400 mt-1 truncate w-40" title={tool.icon}>{tool.icon}</p>}</div></div><button onClick={() => handleRemoveItem('tools', index)} className="text-red-500 hover:text-red-400 font-bold text-xl p-2 shrink-0">&times;</button></div>))}</div>
                </div>
            </div>
            <div className="mt-12 text-right border-t border-gray-700 pt-6">{message && <p className={`text-sm mb-4 inline-block mr-4 ${message.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>{message}</p>}{error && <p className="text-sm text-red-400 mb-4">{error}</p>}<button onClick={handleSave} disabled={saving || loading} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">{saving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}</button></div>
        </div>
    );
}
