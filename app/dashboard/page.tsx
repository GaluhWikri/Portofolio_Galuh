// app/dashboard/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Interface untuk tipe data agar konsisten
interface Project {
    id?: number;
    title: string;
    tech: string[];
    imgSrc: string; // Akan berisi data Base64
}

interface Tool {
    id?: number;
    name: string;
    icon: string; // Akan berisi path ke ikon
}

interface PortfolioData {
    aboutMe: string;
    education: {
        university: string;
        major: string;
        period: string;
    };
    tools: Tool[];
    projects: Project[];
}

export default function Dashboard() {
    const [data, setData] = useState<PortfolioData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [readingFile, setReadingFile] = useState<{ type: string; index: number } | null>(null);

    // State baru untuk icon picker
    const [availableIcons, setAvailableIcons] = useState<string[]>([]);
    const [isIconPickerOpen, setIconPickerOpen] = useState(false);
    const [currentTargetToolIndex, setCurrentTargetToolIndex] = useState<'new' | number | null>(null);

    // Fungsi untuk mengambil data utama dari server
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/data', { cache: 'no-store' });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Gagal memuat data dari server.');
            }
            const initialData = await res.json();
            setData(initialData);
        } catch (err: any) {
            console.error("Gagal memuat data:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Mengambil data utama saat komponen dimuat
    useEffect(() => {
        fetchData();
    }, []);

    // Mengambil daftar ikon yang tersedia saat komponen dimuat
    useEffect(() => {
        const fetchIcons = async () => {
            try {
                const res = await fetch('/api/icons');
                const data = await res.json();
                if (res.ok) {
                    setAvailableIcons(data.icons);
                } else {
                    throw new Error(data.message || "Gagal memuat ikon");
                }
            } catch (err: any) {
                console.error(err.message);
            }
        };
        fetchIcons();
    }, []);

    const openIconPicker = (index: 'new' | number) => {
        setCurrentTargetToolIndex(index);
        setIconPickerOpen(true);
    };

    const generateNameFromFilename = (filename: string): string => {
        return filename
            .split('.')[0]
            .replace(/icons8-|-|_/g, ' ')
            .replace(/\d+/g, '')
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const handleIconSelect = (iconFilename: string) => {
        if (currentTargetToolIndex === null) return;

        const name = generateNameFromFilename(iconFilename);
        const iconPath = `/assets/icon/${iconFilename}`;

        setData(prev => {
            if (!prev) return prev;
            let newTools = [...prev.tools];

            if (currentTargetToolIndex === 'new') {
                newTools.push({ name, icon: iconPath });
            } else {
                const item = { ...newTools[currentTargetToolIndex], name, icon: iconPath };
                newTools[currentTargetToolIndex] = item;
            }
            return { ...prev, tools: newTools };
        });

        setIconPickerOpen(false);
        setCurrentTargetToolIndex(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setData(prev => {
            if (!prev) return null;
            if (name.startsWith('education.')) {
                const field = name.split('.')[1];
                return { ...prev, education: { ...prev.education, [field]: value } };
            }
            return { ...prev, [name]: value };
        });
    };

    const handleAddItem = (arrayName: 'projects') => {
        setData(prev => {
            if (!prev) return prev;
            const newItem = { title: 'Proyek Baru', tech: [], imgSrc: '' };
            return { ...prev, [arrayName]: [...prev[arrayName], newItem as any] };
        });
    };
    
    const handleRemoveItem = (arrayName: 'projects' | 'tools', index: number) => {
        setData(prev => {
            if (!prev) return prev;
            return { ...prev, [arrayName]: (prev[arrayName] as any[]).filter((_, i) => i !== index) };
        });
    };

    const handleArrayChange = (arrayName: 'projects', index: number, field: string, value: string | string[]) => {
        setData(prevData => {
            if (!prevData) return prevData;
            const newArray = [...prevData[arrayName]];
            const item = { ...newArray[index] };

            if (field === 'tech' && typeof value === 'string') {
                item.tech = value.split(',').map(t => t.trim());
            } else {
                (item as any)[field] = value;
            }

            newArray[index] = item;
            return { ...prevData, [arrayName]: newArray };
        });
    };

    const handleFileRead = (e: React.ChangeEvent<HTMLInputElement>, type: 'projects', index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setReadingFile({ type, index });
        const reader = new FileReader();

        reader.onload = (event) => {
            const base64String = event.target?.result as string;
            handleArrayChange(type, index, 'imgSrc', base64String);
            setReadingFile(null);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        if (!data) return;
        setSaving(true);
        setMessage('');
        setError(null);
        try {
            const response = await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Gagal menyimpan data.');
            setMessage(result.message);
            fetchData();
        } catch (error: any) {
            setError(error.message);
        } finally {
            setSaving(false);
            setTimeout(() => { setMessage(''); setError(null); }, 5000);
        }
    };

    if (loading) return <p className="text-center p-10 text-white">Loading dashboard...</p>;
    if (error) return <div className="max-w-4xl mx-auto p-4"><p className="text-center p-10 text-red-400 bg-red-900/20 rounded-lg m-8">Error: {error}</p><button onClick={fetchData} className="block mx-auto px-4 py-2 bg-blue-600 rounded-md">Coba Lagi</button></div>;
    if (!data) return <p className="text-center p-10 text-yellow-400">Data tidak ditemukan.</p>;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 bg-gray-900 text-white font-sans min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">Dashboard</h1>
                <a href="/" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline">Lihat Portofolio</a>
            </div>

            {message && <div className="mb-4 p-3 rounded-md bg-green-900/50 text-green-300">{message}</div>}

            <div className="space-y-12">
                {/* About Me Section */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">About Me</h2>
                    <textarea name="aboutMe" value={data.aboutMe} onChange={handleInputChange} rows={5} className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                {/* Education Section */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">Education</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-400">University</label><input type="text" name="education.university" value={data.education.university} onChange={handleInputChange} className="w-full mt-1 p-2 bg-gray-800 border border-gray-700 rounded-md" /></div>
                        <div><label className="block text-sm font-medium text-gray-400">Major</label><input type="text" name="education.major" value={data.education.major} onChange={handleInputChange} className="w-full mt-1 p-2 bg-gray-800 border border-gray-700 rounded-md" /></div>
                        <div><label className="block text-sm font-medium text-gray-400">Period</label><input type="text" name="education.period" value={data.education.period} onChange={handleInputChange} className="w-full mt-1 p-2 bg-gray-800 border border-gray-700 rounded-md" /></div>
                    </div>
                </div>

                {/* Projects Section */}
                <div>
                    <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                        <h2 className="text-2xl font-semibold">Projects</h2>
                        <button onClick={() => handleAddItem('projects')} className="text-sm bg-green-600 px-3 py-1 rounded-md hover:bg-green-700">+</button>
                    </div>
                    <div className="space-y-6">
                        {data.projects.map((project, index) => (
                            <div key={project.id || `project-${index}`} className="bg-gray-800 p-4 rounded-lg space-y-3">
                                <input type="text" placeholder="Project Title" value={project.title} onChange={(e) => handleArrayChange('projects', index, 'title', e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" />
                                <input type="text" placeholder="Tech (comma separated)" value={project.tech.join(', ')} onChange={(e) => handleArrayChange('projects', index, 'tech', e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" />
                                <div className='flex items-center gap-4'>
                                    {project.imgSrc && <Image src={project.imgSrc} alt="Preview" width={80} height={80} className="object-cover rounded-md bg-gray-700" />}
                                    <div><label htmlFor={`upload-project-${index}`} className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">{readingFile?.type === 'projects' && readingFile.index === index ? 'Reading...' : 'Pilih Gambar'}</label><input id={`upload-project-${index}`} type="file" accept="image/*" onChange={(e) => handleFileRead(e, 'projects', index)} className="hidden" disabled={readingFile?.type === 'projects' && readingFile.index === index} /></div>
                                </div>
                                <button onClick={() => handleRemoveItem('projects', index)} className="text-red-500 hover:text-red-400 font-bold ml-auto block">&times; Hapus Proyek</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tools & Others Section (UPDATED) */}
                <div>
                    <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                        <h2 className="text-2xl font-semibold">Tools & Others</h2>
                        <button onClick={() => openIconPicker('new')} className="text-sm bg-green-600 px-3 py-1 rounded-md hover:bg-green-700">+ Tambah Tool</button>
                    </div>
                    <div className="space-y-4">
                        {data.tools.map((tool, index) => (
                            <div key={tool.id || `tool-${index}`} className="bg-gray-800 p-4 rounded-lg flex gap-4 items-center">
                                {tool.icon && <Image src={tool.icon} alt={tool.name} width={40} height={40} className="object-contain bg-gray-700 rounded-md p-1" />}
                                <p className="flex-grow font-semibold text-gray-200">{tool.name}</p>
                                <button onClick={() => openIconPicker(index)} className="cursor-pointer bg-blue-600 text-white px-3 py-1 rounded-md text-xs hover:bg-blue-700">Ganti Ikon</button>
                                <button onClick={() => handleRemoveItem('tools', index)} className="text-red-500 hover:text-red-400 font-bold text-xl p-2 shrink-0">&times;</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Save Button */}
                <div className="mt-12 text-right border-t border-gray-700 pt-6">
                    <button onClick={handleSave} disabled={saving || loading || readingFile !== null} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">{saving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}</button>
                </div>
            </div>

            {/* Modal for Icon Picker */}
            {isIconPickerOpen && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl">
                        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Pilih Ikon</h3><button onClick={() => setIconPickerOpen(false)} className="text-2xl font-bold">&times;</button></div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 max-h-[60vh] overflow-y-auto p-2 bg-gray-900 rounded-md">
                            {availableIcons.length > 0 ? availableIcons.map(icon => (
                                <div key={icon} onClick={() => handleIconSelect(icon)} className="p-2 bg-gray-700 rounded-md cursor-pointer hover:bg-blue-600 transition-colors flex flex-col items-center justify-center aspect-square gap-2">
                                    <Image src={`/assets/icon/${icon}`} alt={icon} width={48} height={48} className="object-contain" />
                                    <p className='text-[10px] text-center text-gray-300 break-all'>{generateNameFromFilename(icon)}</p>
                                </div>
                            )) : <p>Tidak ada ikon yang tersedia.</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
