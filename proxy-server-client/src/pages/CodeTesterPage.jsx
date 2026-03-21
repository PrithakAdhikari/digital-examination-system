import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Play, RotateCcw, Terminal, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { runCode } from "../api/proxyApi";
import { useTheme } from "../context/ThemeContext";

const LANGUAGES = [
  { id: "python", name: "Python", defaultCode: 'print("Hello, World!")' },
  { id: "c", name: "C", defaultCode: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}' },
  { id: "cpp", name: "C++", defaultCode: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}' },
  { id: "java", name: "Java", defaultCode: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}' },
];

const STORAGE_KEY_PREFIX = "code_tester_";

export default function CodeTesterPage() {
  const { theme } = useTheme();
  
  // Initialize language from localStorage or default
  const [language, setLanguage] = useState(() => {
    const savedLangId = localStorage.getItem(`${STORAGE_KEY_PREFIX}lang`);
    return LANGUAGES.find((l) => l.id === savedLangId) || LANGUAGES[0];
  });

  // Initialize code from localStorage or default for the current language
  const [code, setCode] = useState(() => {
    const savedCode = localStorage.getItem(`${STORAGE_KEY_PREFIX}code_${language.id}`);
    return savedCode !== null ? savedCode : language.defaultCode;
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const editorRef = useRef(null);

  // Debounced saving to localStorage
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}code_${language.id}`, code);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}lang`, language.id);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [code, language]);

  const handleLanguageChange = (e) => {
    const selected = LANGUAGES.find((l) => l.id === e.target.value);
    setLanguage(selected);
    
    // Load saved code for the new language if available
    const savedCode = localStorage.getItem(`${STORAGE_KEY_PREFIX}code_${selected.id}`);
    setCode(savedCode !== null ? savedCode : selected.defaultCode);
    setResult(null);
  };

  const handleRun = async () => {
    setLoading(true);
    setResult(null);
    try {
      const data = await runCode({ language: language.id, code });
      setResult(data);
    } catch (error) {
      setResult({
        error: "Execution failed",
        stderr: error.response?.data?.details || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}code_${language.id}`);
    setCode(language.defaultCode);
    setResult(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-4 animate-fade-in">
      {/* Header / Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 glass-card">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold">Code Tester</h1>
            <p className="text-xs opacity-60">Test your solutions in a secure sandbox</p>
          </div>
          <div className="divider divider-horizontal mx-0" />
          <select 
            className="select select-bordered select-sm w-32 bg-base-100/50"
            value={language.id}
            onChange={handleLanguageChange}
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button 
            className="btn btn-ghost btn-sm gap-2"
            onClick={handleReset}
            disabled={loading}
          >
            <RotateCcw size={16} />
            Reset
          </button>
          <button 
            className={`btn btn-primary btn-sm gap-2 px-6 shadow-lg shadow-primary/20 ${loading ? 'loading' : ''}`}
            onClick={handleRun}
            disabled={loading}
          >
            {!loading && <Play size={16} fill="currentColor" />}
            {loading ? 'Running...' : 'Run Code'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Editor Pane */}
        <div className="flex-2 flex flex-col glass-card overflow-hidden relative group">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-base-content/5 bg-base-content/5">
            <div className="w-2 h-2 rounded-full bg-error/40" />
            <div className="w-2 h-2 rounded-full bg-warning/40" />
            <div className="w-2 h-2 rounded-full bg-success/40" />
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-40 ml-2">Editor</span>
          </div>
          <div className="flex-1 p-2">
            <Editor
              height="100%"
              theme={theme === "dark" ? "vs-dark" : "light"}
              language={language.id === "cpp" ? "cpp" : language.id}
              value={code}
              onChange={(value) => setCode(value)}
              onMount={(editor) => (editorRef.current = editor)}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'Fira Code', 'Courier New', monospace",
                roundedSelection: true,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 10, bottom: 10 },
              }}
            />
          </div>
        </div>

        {/* Results Pane */}
        <div className="flex-1 flex flex-col glass-card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-base-content/5 bg-base-content/5">
            <Terminal size={14} className="opacity-40" />
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-40">Console</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto no-scrollbar font-mono text-sm">
            {!result && !loading && (
              <div className="h-full flex flex-col items-center justify-center opacity-30 gap-3">
                <Terminal size={48} strokeWidth={1} />
                <p className="text-center italic">Run your code to see results here</p>
              </div>
            )}

            {loading && (
              <div className="h-full flex flex-col items-center justify-center gap-4">
                <span className="loading loading-spinner loading-md text-primary" />
                <p className="text-xs uppercase font-bold tracking-widest opacity-40">Compiling & Executing...</p>
              </div>
            )}

            {result && (
              <div className="space-y-4 animate-slide-up">
                {/* Stats */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${result.timeout ? 'bg-error/10 border-error/20 text-error' : 'bg-success/10 border-success/20 text-success'}`}>
                    {result.timeout ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                    <span className="text-xs font-bold uppercase">{result.timeout ? 'Timeout' : 'Success'}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-base-content/5 border-base-content/10">
                    <Clock size={14} className="opacity-40" />
                    <span className="text-xs font-bold opacity-60">
                      {result.duration >= 1000 ? (result.duration / 1000).toFixed(2) + 's' : result.duration + 'ms'}
                    </span>
                  </div>
                </div>

                {/* Output Sections */}
                {result.stdout && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Standard Output</p>
                    <pre className="bg-success/5 border border-success/10 p-3 rounded-xl text-success/90 whitespace-pre-wrap">
                      {result.stdout}
                    </pre>
                  </div>
                )}

                {result.stderr && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Error Stream</p>
                    <pre className="bg-error/5 border border-error/10 p-3 rounded-xl text-error/90 whitespace-pre-wrap">
                      {result.stderr}
                    </pre>
                  </div>
                )}

                {!result.stdout && !result.stderr && !result.timeout && (
                  <div className="p-3 rounded-xl bg-base-content/5 italic opacity-40">
                    No output returned.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
