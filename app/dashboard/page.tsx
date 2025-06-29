// app/dashboard/page.tsx

'use client';

import { useState, useEffect, FC, useCallback } from 'react';
import Image from 'next/image';

// Interface untuk tipe data (Tidak ada perubahan)
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

type ActiveView = 'about' | 'education' | 'projects' | 'tools';

// Komponen Ikon (Tidak ada perubahan)
const Icon: FC<{ d: string, className?: string }> = ({ d, className }) => (
    <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
);

// --- PERUBAHAN: Komponen Wrapper untuk setiap bagian form ---
// Ini membantu konsistensi dan mengurangi pengulangan kode
const SectionWrapper: FC<{ title: string; children: React.ReactNode; onAddItem?: () => void; addItemLabel?: string }> = ({ title, children, onAddItem, addItemLabel }) => (
    <div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            {onAddItem && (
                <button
                    onClick={onAddItem}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all transform hover:scale-105"
                >
                    <Icon d="M12 4v16m8-8H4" />
                    <span>{addItemLabel || 'Tambah'}</span>
                </button>
            )}
        </div>
        <div className="space-y-6">
            {children}
        </div>
    </div>
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
            // --- PERBAIKAN: Konfirmasi sebelum menghapus ---
            const itemName = arrayName === 'projects'
                ? prev.projects[index]?.title
                : prev.tools[index]?.name;
            if (window.confirm(`Anda yakin ingin menghapus "${itemName}"?`)) {
                return { ...prev, [arrayName]: (prev[arrayName] as any[]).filter((_, i) => i !== index) };
            }
            return prev;
        });
    };

    const handleFileRead = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            handleArrayChange('projects', index, 'imgSrc', event.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

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
            setTimeout(() => { setMessage(''); setError(null); }, 3000);
        }
    };

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
            <aside className="w-64 flex-shrink-0 bg-gray-800 flex flex-col">
                <div className="h-20 flex items-center justify-center text-2xl font-bold border-b border-gray-700">
                    Dashboard
                </div>
                <nav className="flex-grow px-4 py-6">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id as ActiveView)}
                            className={`w-full flex items-center gap-3 px-4 py-3 my-1 rounded-lg transition-colors ${activeView === item.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
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

            <main className="flex-1 flex flex-col overflow-hidden">
                {/* --- PERBAIKAN: Header lebih bersih dan informatif --- */}
                <header className="h-20 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 flex items-center justify-between px-8 sticky top-0 z-10">
                    <h1 className="text-xl font-semibold">Edit <span className='text-blue-400'>{navItems.find(i => i.id === activeView)?.label}</span></h1>
                    <div className="flex items-center gap-4">
                        {message && <p className="text-sm text-green-400">{message}</p>}
                        {error && <p className="text-sm text-red-400">{error}</p>}
                        <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg">
                            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {data && (
                        <>
                            {activeView === 'about' && (
                                <SectionWrapper title="About Me">
                                    <textarea
                                        name="aboutMe"
                                        value={data.aboutMe}
                                        onChange={handleInputChange}
                                        rows={10}
                                        className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                        placeholder='Tuliskan sesuatu tentang dirimu...'
                                    />
                                </SectionWrapper>
                            )}

                            {activeView === 'education' && (
                                <SectionWrapper title="Education">
                                    <div className="space-y-4">
                                        <div><label className="block text-sm font-medium text-gray-300 mb-2">Universitas</label><input type="text" name="education.university" value={data.education.university} onChange={handleInputChange} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg" /></div>
                                        <div><label className="block text-sm font-medium text-gray-300 mb-2">Jurusan</label><input type="text" name="education.major" value={data.education.major} onChange={handleInputChange} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg" /></div>
                                        <div><label className="block text-sm font-medium text-gray-300 mb-2">Periode</label><input type="text" name="education.period" value={data.education.period} onChange={handleInputChange} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg" placeholder='Contoh: 2022 - Sekarang' /></div>
                                    </div>
                                </SectionWrapper>
                            )}

                            {activeView === 'projects' && (
                                <SectionWrapper title="Projects" onAddItem={() => handleAddItem('projects')} addItemLabel="Tambah Proyek">
                                    {data.projects.map((project, index) => (
                                        <div key={project.id || `project-${index}`} className="bg-gray-700/50 p-5 rounded-lg border border-gray-600 space-y-4 relative group">
                                            <button onClick={() => handleRemoveItem('projects', index)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700">&times;</button>
                                            <input type="text" placeholder="Judul Proyek" value={project.title} onChange={(e) => handleArrayChange('projects', index, 'title', e.target.value)} className="w-full p-3 bg-gray-600 border border-gray-500 rounded-md text-lg font-semibold" />
                                            <textarea placeholder="Teknologi yang digunakan (pisahkan dengan koma)" value={project.tech.join(', ')} onChange={(e) => handleArrayChange('projects', index, 'tech', e.target.value)} className="w-full p-3 bg-gray-600 border border-gray-500 rounded-md text-sm" rows={2} />
                                            <div className='flex items-center gap-4'>
                                                <Image src={project.imgSrc || '/assets/image/placeholder.png'} alt="Preview" width={120} height={80} className="object-cover rounded-md bg-gray-600" />
                                                <label htmlFor={`upload-project-${index}`} className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-all">
                                                    {project.imgSrc ? 'Ganti Gambar' : 'Pilih Gambar'}
                                                </label>
                                                <input id={`upload-project-${index}`} type="file" accept="image/*" onChange={(e) => handleFileRead(e, index)} className="hidden" />
                                            </div>
                                        </div>
                                    ))}
                                </SectionWrapper>
                            )}

                            {activeView === 'tools' && (
                                <SectionWrapper title="Tools & Others" onAddItem={() => handleAddItem('tools')} addItemLabel="Tambah Tool">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {data.tools.map((tool, index) => (
                                            <div key={tool.id || `tool-${index}`} className="bg-gray-700 p-4 rounded-lg flex gap-4 items-center justify-between hover:bg-gray-600/50 transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    {tool.icon && <Image src={tool.icon} alt={tool.name} width={40} height={40} className="object-contain bg-gray-800 rounded-md p-1" />}
                                                    <p className="font-semibold text-gray-200">{tool.name}</p>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openIconPicker(index)} className="p-2 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700"><Icon d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></button>
                                                    <button onClick={() => handleRemoveItem('tools', index)} className="p-2 bg-red-600 text-white rounded-md text-xs hover:bg-red-700"><Icon d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </SectionWrapper>
                            )}
                        </>
                    )}
                </div>
            </main>

            {isIconPickerOpen && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-4xl">
                        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Pilih Ikon</h3><button onClick={() => setIconPickerOpen(false)} className="text-2xl font-bold">&times;</button></div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4 max-h-[60vh] overflow-y-auto p-2 bg-gray-900 rounded-md">
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