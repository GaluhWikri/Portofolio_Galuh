'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CornerDownLeft, Copy, Check } from 'lucide-react';
import portfolioData from '../../../data.json';

interface ToolItem {
  name: string;
  icon: string;
}

interface ExperienceItem {
  company: string;
  position: string;
  period: string;
  description: string;
}

interface ProjectItem {
  id: number;
  title: string;
  category: string;
  tech: string[];
}

interface CommandOutput {
  id: string;
  command: string;
  timestamp: string;
  output: React.ReactNode;
}

const AVAILABLE_OPTIONS = [
  { name: 'summary', description: 'About Galuh Wikri & current focus' },
  { name: 'skills', description: 'Technical stack, tools & frameworks' },
  { name: 'experience', description: 'Work & organization history' },
  { name: 'projects', description: 'Featured design & web projects' },
  { name: 'educations', description: 'Academic background' },
  { name: 'contact', description: 'Social links & contact information' },
];

const OTHER_COMMANDS = [
  { name: 'clear', description: 'Clear terminal screen' },
  { name: 'help', description: 'List all commands and usage' },
  { name: 'whoami', description: 'Display current user info' },
  { name: 'cv', description: 'Download / view curriculum vitae' },
];

export default function Terminal({ onDownloadCv }: { onDownloadCv?: () => void }) {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [outputs, setOutputs] = useState<CommandOutput[]>([]);
  const [copied, setCopied] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll output area to bottom using a scroll anchor
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ block: 'nearest' });
      
      const t1 = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ block: 'nearest' });
      }, 50);
      const t2 = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ block: 'nearest' });
      }, 150);
      
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, []);

  useEffect(() => {
    if (outputs.length === 0) return;
    const cleanup = scrollToBottom();
    return () => cleanup && cleanup();
  }, [outputs, scrollToBottom]);

  // Focus input on terminal body click
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const getTimeString = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  };

  const executeCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim().toLowerCase();
    const cleanCmd = cmd.replace(/^(galuh|xe)\s+/, '');

    if (!cleanCmd) return;

    // Add to history
    setHistory((prev) => [...prev, rawCmd]);
    setHistoryIndex(-1);

    if (cleanCmd === 'clear') {
      setOutputs([]);
      setInputVal('');
      return;
    }

    let nodeOutput: React.ReactNode = null;

    switch (cleanCmd) {
      case 'summary':
      case 'about':
        nodeOutput = (
          <div className="space-y-2 py-1 text-gray-200 font-mono">
            <p className="text-white font-extrabold tracking-wide">▶ ABOUT ME</p>
            <p className="leading-relaxed text-xs md:text-sm text-gray-300">{portfolioData.aboutMe}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="bg-white text-black font-extrabold px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">Role: UI/UX Designer & Frontend Developer</span>
              <span className="bg-zinc-900 text-gray-200 border border-zinc-700 px-2 py-0.5 rounded">Location: Bandung, Indonesia</span>
            </div>
          </div>
        );
        break;

      case 'skills':
      case 'tools':
        nodeOutput = (
          <div className="space-y-2 py-1 font-mono">
            <p className="text-white font-extrabold tracking-wide">▶ TECH STACK & TOOLS</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {(portfolioData.tools as ToolItem[])
                .filter((t: ToolItem) => t.name.trim() !== '')
                .map((tool: ToolItem, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 bg-black/80 border border-zinc-800 hover:border-white px-2 py-1 rounded transition-colors"
                  >
                    <span className="text-white">⚡</span>
                    <span className="text-gray-200 font-medium">{tool.name}</span>
                  </div>
                ))}
            </div>
          </div>
        );
        break;

      case 'experience':
        nodeOutput = (
          <div className="space-y-2 py-1 font-mono">
            <p className="text-white font-extrabold tracking-wide">▶ EXPERIENCE</p>
            <div className="space-y-2">
              {(portfolioData.experience as ExperienceItem[]).map((exp: ExperienceItem, idx: number) => (
                <div key={idx} className="border-l-2 border-white pl-3 py-1 bg-black/60 rounded-r border-r border-y border-zinc-800">
                  <div className="flex flex-wrap items-baseline justify-between gap-1">
                    <span className="text-white font-extrabold text-xs md:text-sm">{exp.position}</span>
                    <span className="text-[11px] bg-white text-black font-extrabold px-1.5 py-0.2 rounded">{exp.period}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">@ {exp.company}</p>
                  <p className="text-xs text-gray-300 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
        break;

      case 'projects':
        nodeOutput = (
          <div className="space-y-2 py-1 font-mono">
            <p className="text-white font-extrabold tracking-wide">▶ FEATURED PROJECTS ({(portfolioData.projects as ProjectItem[]).length})</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {(portfolioData.projects as ProjectItem[]).map((proj: ProjectItem) => (
                <div key={proj.id} className="bg-black/80 border border-zinc-800 p-2 rounded hover:border-white transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-white font-bold">{proj.title}</span>
                    <span className="text-[10px] uppercase font-bold bg-white text-black px-1 py-0.2 rounded">{proj.category}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {proj.tech.map((t: string, tIdx: number) => (
                      <span key={tIdx} className="text-[10px] bg-zinc-900 border border-zinc-700 text-gray-300 px-1 py-0.2 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        break;

      case 'educations':
      case 'education':
        nodeOutput = (
          <div className="space-y-2 py-1 font-mono">
            <p className="text-white font-extrabold tracking-wide">▶ ACADEMIC BACKGROUND</p>
            <div className="bg-black/80 border border-zinc-800 p-2.5 rounded">
              <p className="text-xs md:text-sm font-bold text-white">{portfolioData.education.university}</p>
              <p className="text-xs text-gray-300">{portfolioData.education.major}</p>
              <p className="text-xs text-gray-400 mt-0.5">Period: {portfolioData.education.period}</p>
            </div>
          </div>
        );
        break;

      case 'contact':
        nodeOutput = (
          <div className="space-y-2 py-1 font-mono">
            <p className="text-white font-extrabold tracking-wide">▶ GET IN TOUCH</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <a href="mailto:galuhwikri10@gmail.com" target="_blank" rel="noopener noreferrer" className="bg-black border border-zinc-800 p-2 rounded text-gray-300 hover:text-white hover:border-white transition-colors">
                📧 galuhwikri10@gmail.com
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="bg-black border border-zinc-800 p-2 rounded text-gray-300 hover:text-white hover:border-white transition-colors">
                💻 @galuhwikri
              </a>
            </div>
          </div>
        );
        break;

      case 'help':
        nodeOutput = (
          <div className="space-y-2 py-1 text-xs font-mono">
            <p className="text-white font-extrabold tracking-wide">▶ AVAILABLE COMMANDS</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {[...AVAILABLE_OPTIONS, ...OTHER_COMMANDS].map((opt) => (
                <div
                  key={opt.name}
                  onClick={() => executeCommand(opt.name)}
                  className="flex items-center justify-between bg-black/90 border border-zinc-800 hover:border-white px-2 py-1 rounded cursor-pointer transition-all group"
                >
                  <span className="text-white font-bold group-hover:translate-x-1 transition-transform">{opt.name}</span>
                  <span className="text-gray-400 text-[10px]">{opt.description}</span>
                </div>
              ))}
            </div>
          </div>
        );
        break;

      case 'whoami':
        nodeOutput = (
          <div className="py-1 text-xs text-gray-300 font-mono">
            <span className="text-white font-bold">guest@galuh-portfolio</span>
          </div>
        );
        break;

      case 'cv':
        if (onDownloadCv) {
          onDownloadCv();
          nodeOutput = <div className="py-1 text-xs text-white font-bold font-mono">✓ Downloading Curriculum Vitae...</div>;
        } else {
          nodeOutput = <div className="py-1 text-xs text-white font-bold font-mono">⚡ CV download initiated!</div>;
        }
        break;

      default:
        nodeOutput = (
          <div className="py-1 text-xs text-gray-300 font-mono">
            zsh: command not found: <span className="font-bold underline text-white">{cleanCmd}</span>. Type <button onClick={() => executeCommand('help')} className="text-white font-bold underline">help</button> for commands.
          </div>
        );
        break;
    }

    const newOutput: CommandOutput = {
      id: Math.random().toString(36).substring(2, 9),
      command: rawCmd,
      timestamp: getTimeString(),
      output: nodeOutput,
    };

    setOutputs((prev) => [...prev, newOutput]);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx < history.length) {
        setHistoryIndex(nextIdx);
        setInputVal(history[history.length - 1 - nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(history[history.length - 1 - nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    }
  };

  return (
    <div className="w-full font-mono text-left select-none">
      {/* Neo-Brutalist Frame (3px Black Border & 8px Hard Black Shadow) */}
      <div
        onClick={handleContainerClick}
        className="relative bg-[#121212] text-gray-100 border-[3px] border-black shadow-[8px_8px_0px_#000] rounded-2xl p-5 md:p-6 transition-all duration-200"
      >
        {/* Top Control Dots & Badges Line */}
        <div className="flex items-center justify-between mb-4">
          {/* Left Window Dots */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block border border-black" />
            <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block border border-black" />
            <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block border border-black" />
          </div>

          {/* Right Header Version Indicator */}
          <span className="text-gray-400 font-mono text-xs">⎈ v1.0.0</span>
        </div>

        {/* Top Prompt Line */}
        <div className="flex items-center gap-2 text-xs md:text-sm font-bold mb-4 text-white">
          <span className="text-white font-extrabold">→</span>
          <span className="text-white font-bold">galuh</span>
          <span className="text-gray-500">@</span>
          <span className="text-gray-300 font-bold">xe</span>
          <span className="text-gray-500">~</span>
        </div>

        {/* Main Terminal Scroll Body */}
        <div
          className="terminal-scrollbar overflow-y-auto max-h-[440px] space-y-4 pr-1"
        >
          {/* ASCII & Options Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pb-4 border-b border-zinc-800">
            {/* Left ASCII Art Column */}
            <div className="md:col-span-6 flex flex-col items-center justify-center py-1 overflow-hidden">
              <pre className="font-mono text-[7px] sm:text-[7.5px] md:text-[8.5px] lg:text-[9px] leading-[1.04] text-white font-bold select-none whitespace-pre text-center drop-shadow-[0_0_10px_rgba(255,255,255,0.25)]">
{`──────────────────────────────▓▓█───────
────────────────────────────▒██▒▒█──────
───────────────────────────█▓▓▓░▒▓▓─────
─────────────────────────▒█▓▒█░▒▒▒█─────
────────────────────────▒█▒▒▒█▒▒▒▒▓▒────
─▓▓▒░──────────────────▓█▒▒▒▓██▓▒░▒█────
─█▓▓██▓░──────────────▓█▒▒▒▒████▒▒▒█────
─▓█▓▒▒▓██▓░──────────▒█▒▒▒▒▒██▓█▓░░▓▒───
─▓▒▓▒▒▒▒▒▓█▓░──░▒▒▓▓██▒▒▒▒▒▒█████▒▒▒▓───
─▓░█▒▒▒▒▒▒▒▓▓█▓█▓▓▓▓▒▒▒▒▒▒▒▒██▓██▒░▒█───
─▓░▓█▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓████▒▒▒█───
─▓░▓██▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▒▒▒▒▒▒▒▒▒▓██░░░█───
─▓░▓███▒▒▒▒▒▒▒▒▒▒▒▓█▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▒▓▓──
─▒▒▒██▓▒▓█▓▒▒▒▒▒▒▒▓▒▒▒▒▒▒▓▓▓▒▒▒▒▒▒▒▓▒█──
──▓▒█▓▒▒▒▒▓▒▒▒▒▒▒▒▒▒▒▒▓█▓▓▓▓█▓▒▒▒▒▒▒▒▓▒─
──▓▒█▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓──────▓█▓▒▒▒▒▒▓█─
──▒▒▓▒▒▒▓▓▓▒▒▒▒▒▒▒▒▒▓▓───░▓▓───█▓▒▒▒▒▒█─
───█▒▒▓▓▓▒▒▓▓▒▒▒▒▒▒▓▓───█████▓──█▓▒▒▒▒▓▒
───▓▓█▒─────▒▓▒▒▒▒▒█───░██████──░█▒▒▒▒▓▓
───▓█▒──▒███─▒▓▒▒▒▒█────██████───▓▒▒▒▒▒▓
───██───█████─█▒▒▒▒█─────███▓────▓▓▒▒▒▒▓
───█▓───█████─▒▓▒▒▒█─────────────█▓▓▓▒▒▓
───█▓───░███──░▓▒▒▒▓█──────────░█▓▒▒▒▓▒▓
───██─────────▒▓▒▒▒▒▓▓──────░▒▓█▓────░▓▓
───▓█░────────█▓██▓▒▒▓█▓▓▓▓██▓▓▒▓▒░░▒▓▒▓
───▒██░──────▓▒███▓▒▒▒▒▓▓▓▓▒▒▒▒▒▒▓▓▓▓▒▓─
────█▓█▓▓▒▒▓█▓▒░██▒▒▓▓█▓▒▒▒▒▒▒▒▒▒▒▒▒▓▓█▒
────▓─░▓▓▓▓▓▒▓▓▓▓▒▓▓▓▒▓▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓
────▒▒▒▓▒▒▒▒▒▒▓█░─░░░─▓▓▒▒▒▒▒▒▒▒▒▒▒▓██▓▒
─────█▓▒▒▒▒▒▒▒▒▓▓─░░░─▓▓▒▒▒▒▒▒▒▒▒▓▓▓▒▒▓▒
──────██▓▓▒▒▒▒▒▒█▒░░░░█▒▒▒▒▒▒▒▒▓█▓▓▒▒▒▒▒
─────░─▒██▓▓▒▒▒▒▒█▓▒▒▓▒▒▒▒▒▒▓███▓▒▒▒▒▒▓▓
──────────░▒▓▓▓▓▒▒▓▓▓▓▓▓████▓▓█▒▒▒▒▒▓▓█░`}
              </pre>
            </div>

            {/* Right Options Column */}
            <div className="md:col-span-6 space-y-3 font-mono text-xs md:text-sm">
              <div>
                <h2 className="text-white font-extrabold text-sm md:text-base tracking-wide">Galuh.Wikri</h2>
                <div className="w-16 h-0.5 bg-white/40 my-1"></div>
                <p className="text-xs text-gray-400">version <span className="text-white font-bold">1.0.0</span></p>
                <p className="text-xs text-gray-300 mt-1 font-semibold">
                  usage: <span className="text-white font-bold">galuh [option]</span>
                </p>
              </div>

              {/* All Options */}
              <div>
                <p className="text-xs font-black text-white mb-1.5 uppercase tracking-wider">
                  all options:
                </p>
                <div className="flex flex-col gap-1 pl-3">
                  {AVAILABLE_OPTIONS.map((opt) => {
                    const isHovered = hoveredOption === opt.name;
                    return (
                      <button
                        key={opt.name}
                        onClick={() => executeCommand(opt.name)}
                        onMouseEnter={() => setHoveredOption(opt.name)}
                        onMouseLeave={() => setHoveredOption(null)}
                        className={`group text-left inline-flex items-center gap-2 text-xs font-mono transition-all duration-150 rounded px-2 py-0.5 ${
                          isHovered
                            ? 'bg-white text-black font-extrabold shadow-[2px_2px_0px_#000] translate-x-1'
                            : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        <span className={isHovered ? 'text-black' : 'text-gray-500'}>›</span>
                        <span>{opt.name}</span>
                        {isHovered && <span className="text-[10px] text-gray-900 font-bold ml-auto">[run]</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Other Commands */}
              <div>
                <p className="text-xs font-black text-white mb-1 uppercase tracking-wider">
                  other commands:
                </p>
                <div className="flex flex-wrap gap-2 pl-3">
                  {OTHER_COMMANDS.map((cmd) => (
                    <button
                      key={cmd.name}
                      onClick={() => executeCommand(cmd.name)}
                      className="text-xs font-mono text-gray-300 hover:text-black hover:bg-white bg-zinc-900 border border-zinc-700 hover:border-black px-2.5 py-0.5 rounded transition-all font-bold"
                    >
                      {cmd.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Command Output Logs */}
          {outputs.map((item) => (
            <div key={item.id} className="space-y-1 border-b border-zinc-800 pb-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="text-white font-extrabold">→</span>
                  <span className="text-white font-bold">galuh</span>
                  <span className="text-gray-500">@</span>
                  <span className="text-gray-300 font-bold">xe</span>
                  <span className="text-gray-500">~</span>
                  <span className="text-white font-bold">{item.command}</span>
                </div>
                <span className="text-[10px] text-gray-500">{item.timestamp}</span>
              </div>
              <div className="pl-3">{item.output}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Prompt Line matching reference layout */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-zinc-800 text-xs md:text-sm">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-white font-extrabold">→</span>
            <span className="text-white font-bold">galuh</span>
            <span className="text-gray-500">@</span>
            <span className="text-gray-300 font-bold">xe</span>
            <span className="text-gray-500">~</span>

            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="type command..."
              className="flex-1 bg-transparent text-white font-mono outline-none border-none focus:outline-none focus:ring-0 placeholder:text-gray-500 text-xs md:text-sm"
              autoComplete="off"
              spellCheck="false"
            />
            <button
              onClick={() => executeCommand(inputVal)}
              className="text-gray-400 hover:text-white transition-colors p-1"
              title="Execute"
            >
              <CornerDownLeft size={14} />
            </button>
          </div>

          <div className="hidden sm:block text-gray-500 text-xs font-mono">
            ⎈ v1.0.0
          </div>
        </div>
      </div>
    </div>
  );
}
