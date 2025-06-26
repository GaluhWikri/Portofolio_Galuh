// app/dashboard/page.tsx

'use client';

import { useState, useEffect, FC } from 'react';
import Image from 'next/image';

// Interface untuk tipe data
interface Project {
    id?: number;
    title: string;
    tech: string[];
    imgSrc: string; 
}

interface Tool {
    id?: number;
    name: string;
    icon: string; 
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

// Tipe untuk menentukan tampilan mana yang aktif
type ActiveView = 'about' | 'education' | 'projects' | 'tools';

// Komponen Ikon Sederhana
const Icon: FC<{ d: string, className?: string }> = ({ d, className }) => (
    <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
);

export default function Dashboard() {
    const [data, setData] = useState<PortfolioData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    
    const [availableIcons, setAvailableIcons] = useState<string[]>([]);
    const [isIconPickerOpen, setIconPickerOpen] = useState(false);
    const [currentTargetToolIndex, setCurrentTargetToolIndex] = useState<'new' | number | null>(null);

    const [activeView, setActiveView] = useState<ActiveView>('about');

    // Mengambil data portfolio dan ikon
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [dataRes, iconsRes] = await Promise.all([
                    fetch('/api/data', { cache: 'no-store' }),
                    fetch('/api/icons', { cache: 'no-store' })
                ]);

                if (!dataRes.ok) throw new Error('Gagal memuat data portofolio.');
                if (!iconsRes.ok) throw new Error('Gagal memuat ikon.');

                const portfolioData = await dataRes.json();
                const iconsData = await iconsRes.json();
                
                setData(portfolioData);
                setAvailableIcons(iconsData.icons || []);

            } catch (err: any) {
                console.error("Gagal memuat data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- Handlers untuk data ---
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
    
    const handleArrayChange = (arrayName: 'projects' | 'tools', index: number, field: string, value: string | string[]) => {
        setData(prevData => {
            if (!prevData) return prevData;
            const newArray = [...(prevData[arrayName] as any[])];
            const item = { ...newArray[index] };

            if (field === 'tech' && 'tech' in item && typeof value === 'string') {
                (item as Project).tech = value.split(',').map(t => t.trim());
            } else {
                (item as any)[field] = value;
            }

            newArray[index] = item;
            return { ...prevData, [arrayName]: newArray };
        });
    };

    const handleAddItem = (arrayName: 'projects' | 'tools') => {
        if (arrayName === 'tools') {
            openIconPicker('new');
            return;
        }
        setData(prev => {
            if (!prev) return prev;
            const newItem = { title: 'Proyek Baru', tech: [], imgSrc: '' };
            return { ...prev, [arrayName]: [...prev.projects, newItem] };
        });
    };

    const handleRemoveItem = (arrayName: 'projects' | 'tools', index: number) => {
        setData(prev => {
            if (!prev) return prev;
            return { ...prev, [arrayName]: (prev[arrayName] as any[]).filter((_, i) => i !== index) };
        });
    };
    
    const handleFileRead = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64String = event.target?.result as string;
            handleArrayChange('projects', index, 'imgSrc', base64String);
        };
        reader.readAsDataURL(file);
    };

    // --- Handlers untuk ikon ---
    const openIconPicker = (index: 'new' | number) => {
        setCurrentTargetToolIndex(index);
        setIconPickerOpen(true);
    };

    const generateNameFromFilename = (filename: string): string => {
        return filename.split('.')[0].replace(/icons8-|-|_/g, ' ').replace(/\d+/g, '').trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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

    // --- Handler untuk simpan data ---
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
        } catch (error: any) {
            setError(error.message);
        } finally {
            setSaving(false);
            setTimeout(() => { setMessage(''); setError(null); }, 5000);
        }
    };
    
    // -- Render komponen --
    if (loading) return <div className="flex items-center justify-center h-screen bg-gray-900 text-white"><p>Loading Dashboard...</p></div>;
    if (error && !data) return <div className="flex items-center justify-center h-screen bg-gray-900 text-red-400"><p>Error: {error}</p></div>;

    const navItems = [
        { id: 'about', label: 'About Me', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { id: 'education', label: 'Education', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
        { id: 'projects', label: 'Projects', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
        { id: 'tools', label: 'Tools & Others', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
    ];

    return (
        <div className="flex h-screen bg-gray-900 text-white font-sans">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-gray-800 flex flex-col">
                <div className="h-20 flex items-center justify-center text-2xl font-bold border-b border-gray-700">
                    Dashboard
                </div>
                <nav className="flex-grow px-4 py-6">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id as ActiveView)}
                            className={`w-full flex items-center gap-3 px-4 py-3 my-1 rounded-lg transition-colors ${
                                activeView === item.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            <Icon d={item.icon} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-700">
                     <a href="/" target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white">
                        <Icon d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        <span>Lihat Portofolio</span>
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-8">
                    <h1 className="text-xl font-semibold">Edit {navItems.find(i => i.id === activeView)?.label}</h1>
                    <div className="flex items-center gap-4">
                        {error && <p className="text-sm text-red-400">{error}</p>}
                        {message && <p className="text-sm text-green-400">{message}</p>}
                        <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-500 transition-colors">
                            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </header>
                
                <div className="flex-1 overflow-y-auto p-8">
                    {data && (
                        <>
                            {activeView === 'about' && (
                                <div>
                                    <h2 className="text-2xl font-semibold mb-4">About Me Section</h2>
                                    <textarea name="aboutMe" value={data.aboutMe} onChange={handleInputChange} rows={8} className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            )}

                            {activeView === 'education' && (
                                <div>
                                    <h2 className="text-2xl font-semibold mb-4">Education Section</h2>
                                    <div className="space-y-4">
                                        <div><label className="block text-sm text-gray-400 mb-1">University</label><input type="text" name="education.university" value={data.education.university} onChange={handleInputChange} className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md" /></div>
                                        <div><label className="block text-sm text-gray-400 mb-1">Major</label><input type="text" name="education.major" value={data.education.major} onChange={handleInputChange} className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md" /></div>
                                        <div><label className="block text-sm text-gray-400 mb-1">Period</label><input type="text" name="education.period" value={data.education.period} onChange={handleInputChange} className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md" /></div>
                                    </div>
                                </div>
                            )}

                            {activeView === 'projects' && (
                                <div>
                                    <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-semibold">Projects Section</h2><button onClick={() => handleAddItem('projects')} className="bg-green-600 px-3 py-1 rounded-md hover:bg-green-700 text-sm">+</button></div>
                                    <div className="space-y-6">
                                        {data.projects.map((project, index) => (
                                            <div key={project.id || `project-${index}`} className="bg-gray-800 p-4 rounded-lg space-y-3">
                                                <input type="text" placeholder="Project Title" value={project.title} onChange={(e) => handleArrayChange('projects', index, 'title', e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" />
                                                <input type="text" placeholder="Tech (comma separated)" value={project.tech.join(', ')} onChange={(e) => handleArrayChange('projects', index, 'tech', e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" />
                                                <div className='flex items-center gap-4'>
                                                    {project.imgSrc && <Image src={project.imgSrc} alt="Preview" width={80} height={80} className="object-cover rounded-md bg-gray-700" />}
                                                    <label htmlFor={`upload-project-${index}`} className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">Pilih Gambar</label>
                                                    <input id={`upload-project-${index}`} type="file" accept="image/*" onChange={(e) => handleFileRead(e, index)} className="hidden" />
                                                </div>
                                                <button onClick={() => handleRemoveItem('projects', index)} className="text-red-500 hover:text-red-400 font-bold ml-auto block text-sm">&times; Hapus</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeView === 'tools' && (
                                <div>
                                    <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-semibold">Tools & Others Section</h2><button onClick={() => handleAddItem('tools')} className="bg-green-600 px-3 py-1 rounded-md hover:bg-green-700 text-sm">+</button></div>
                                    <div className="space-y-4">
                                        {data.tools.map((tool, index) => (
                                            <div key={tool.id || `tool-${index}`} className="bg-gray-800 p-4 rounded-lg flex gap-4 items-center">
                                                {tool.icon && <Image src={tool.icon} alt={tool.name} width={40} height={40} className="object-contain bg-gray-700 rounded-md p-1" />}
                                                <p className="flex-grow font-semibold text-gray-200">{tool.name}</p>
                                                <button onClick={() => openIconPicker(index)} className="cursor-pointer bg-blue-600 text-white px-3 py-1 rounded-md text-xs hover:bg-blue-700">Ganti Ikon</button>
                                                <button onClick={() => handleRemoveItem('tools', index)} className="text-red-500 hover:text-red-400 font-bold p-2 shrink-0 text-sm">&times; Hapus</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Modal untuk Icon Picker */}
            {isIconPickerOpen && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl">
                        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Pilih Ikon</h3><button onClick={() => setIconPickerOpen(false)} className="text-2xl font-bold">&times;</button></div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 max-h-[60vh] overflow-y-auto p-2 bg-gray-900 rounded-md">
                            {availableIcons.map(icon => (
                                <div key={icon} onClick={() => handleIconSelect(icon)} className="p-2 bg-gray-700 rounded-md cursor-pointer hover:bg-blue-600 transition-colors flex flex-col items-center justify-center aspect-square gap-2">
                                    <Image src={`/assets/icon/${icon}`} alt={icon} width={48} height={48} className="object-contain" />
                                    <p className='text-[10px] text-center text-gray-300 break-all'>{generateNameFromFilename(icon)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
