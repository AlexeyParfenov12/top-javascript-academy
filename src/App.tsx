import { useEffect, useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { lessons, tasksCount } from './course';
import type { Task } from './course';
import { checkTask, previewHtml } from './runner';
import type { CheckResult } from './runner';
import './styles.css';

const allTasks = lessons.flatMap(lesson => lesson.tasks);
const KEY = 'top-javascript-academy-v1';
type DraftMap = Record<string,string>;
function readStored<T>(name: string, fallback: T): T {
  try { const raw = localStorage.getItem(KEY + ':' + name); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}
function App() {
  const [selected, setSelected] = useState('t1-1');
  const [drafts, setDrafts] = useState<DraftMap>(() => readStored('drafts', {}));
  const [completed, setCompleted] = useState<string[]>(() => readStored('done', []));
  const [day, setDay] = useState(1);
  const [hintCount, setHintCount] = useState(0);
  const [results, setResults] = useState<CheckResult[]>([]);
  const [checking, setChecking] = useState(false);
  const [previewCode, setPreviewCode] = useState('');
  const [view, setView] = useState<'preview'|'tests'>('preview');
  const [showTheory, setShowTheory] = useState(true);
  const lesson = lessons.find(item => item.tasks.some(task => task.id === selected)) ?? lessons[0];
  const task = lesson.tasks.find(item => item.id === selected) ?? lesson.tasks[0];
  const code = drafts[task.id] ?? task.starter;
  const index = allTasks.findIndex(item => item.id === task.id);
  const percent = Math.round(completed.length / tasksCount * 100);
  const currentDayDone = lessons.filter(x => x.day === day).flatMap(x => x.tasks).filter(t => completed.includes(t.id)).length;
  const isDone = completed.includes(task.id);

  useEffect(() => { try { localStorage.setItem(KEY + ':drafts', JSON.stringify(drafts)); } catch {} }, [drafts]);
  useEffect(() => { try { localStorage.setItem(KEY + ':done', JSON.stringify(completed)); } catch {} }, [completed]);
  useEffect(() => { setPreviewCode(drafts[task.id] ?? task.starter); setResults([]); setHintCount(0); setView('preview'); }, [task.id]);
  const preview = useMemo(() => previewHtml(task, previewCode), [task, previewCode]);

  function choose(id: string) {
    if (checking) return;
    const targetLesson = lessons.find(item => item.tasks.some(itemTask => itemTask.id === id));
    if (targetLesson) setDay(targetLesson.day);
    setSelected(id);
  }
  function edit(value: string) {
    setDrafts(prev => ({ ...prev, [task.id]: value }));
    setResults([]);
    setCompleted(prev => prev.filter(item => item !== task.id));
  }
  function reset() {
    edit(task.starter);
    setPreviewCode(task.starter);
    setHintCount(0);
  }
  async function execute(grade: boolean) {
    if (checking) return;
    setChecking(true);
    setResults([]);
    setPreviewCode(code);
    if (task.mode === 'dom') setView('preview');
    else setView('tests');
    try {
      const checks = await checkTask(task, code);
      setResults(checks);
      if (grade && checks.length > 0 && checks.every(item => item.passed)) {
        setCompleted(prev => prev.includes(task.id) ? prev : [...prev, task.id]);
      }
      if (grade && checks.some(item => !item.passed)) setView('tests');
    } catch (error) {
      setResults([{ name:'Запуск', passed:false, actual:undefined, expected:undefined, error:String(error), logs:[] }]);
      setView('tests');
    } finally { setChecking(false); }
  }
  function next() { if (index < allTasks.length - 1) choose(allTasks[index + 1].id); }
  function onEditorKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const el = e.currentTarget;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    edit(code.slice(0, start) + '  ' + code.slice(end));
    requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = start + 2; });
  }
  const logs = results[0]?.logs ?? [];
  const passed = results.length > 0 && results.every(result => result.passed);
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">T<span>O</span>P</div>
        <div className="brand-text"><b>TOP Academy</b><small>LEARNING PLATFORM</small></div>
      </div>
      <div className="course-label">ИНТЕРАКТИВНЫЙ КУРС</div>
      <h2 className="course-name">JavaScript <span>Старт</span></h2>
      <p className="course-subtitle">От первой строчки к своему интерактивному магазину.</p>
      <div className="progress-card">
        <div className="progress-head"><span>Ваш прогресс</span><strong>{percent}%</strong></div>
        <div className="progress-track"><div style={{ width: percent + '%' }} /></div>
        <span className="progress-caption">{completed.length} из {tasksCount} заданий выполнено</span>
      </div>
      <div className="day-tabs" role="group" aria-label="Выбор учебного дня">
        {[1,2,3].map(n => <button key={n} className={day === n ? 'day-tab active' : 'day-tab'} onClick={() => { setDay(n); choose(lessons.find(l => l.day === n)!.tasks[0].id); }}>День {n}</button>)}
      </div>
      <nav className="course-nav" aria-label="Уроки и задания">
        {lessons.filter(l => l.day === day).map(l => <div className="nav-lesson" key={l.id}>
          <div className="nav-lesson-label"><span className="lesson-number">{String(l.number).padStart(2,'0')}</span><span>{l.title}</span></div>
          {l.tasks.map((item, i) => <button key={item.id} className={'task-nav-item ' + (selected === item.id ? 'active ' : '')} onClick={() => choose(item.id)} aria-current={selected === item.id ? 'step' : undefined}>
            <span className={'task-mark ' + (completed.includes(item.id) ? 'done' : '')}>{completed.includes(item.id) ? '✓' : i+1}</span>
            <span>{item.title}</span>
          </button>)}
        </div>)}
      </nav>
      <div className="sidebar-foot"><span className="online-dot" /> Обучение без регистрации <small>Прогресс хранится в браузере</small></div>
    </aside>
    <main className="workspace">
      <header className="topbar">
        <div className="crumbs"><span>КУРСЫ</span><span className="chevron">›</span><span>JAVASCRIPT</span><span className="chevron">›</span><b>ЗАНЯТИЕ {lesson.number}</b></div>
        <div className="topbar-right"><span className="course-pill">3 дня · 9 пар</span><span className="task-pill">{index+1} / {tasksCount}</span></div>
      </header>
      <section className="intro">
        <div className="intro-left">
          <div className="eyebrow">ДЕНЬ {lesson.day} <span className="dot-separator">•</span> ПАРА {lesson.number - (lesson.day - 1) * 3} <span className="dot-separator">•</span> ЗАДАНИЕ {lesson.tasks.indexOf(task) + 1} / {lesson.tasks.length}</div>
          <h1>{task.title}</h1>
          <p className="goal">{task.goal}</p>
          <div className="topic-chips">{lesson.concepts.map(concept => <span key={concept}>{concept}</span>)}</div>
        </div>
        <div className="intro-right"><div className="mini-timer">◷ <strong>{task.minutes} мин</strong></div><div className="task-status">{isDone ? <span className="success-text">✓ Выполнено</span> : <span>○ В процессе</span>}</div></div>
      </section>
      <section className="lesson-guide">
        <button className="guide-title" onClick={() => setShowTheory(v => !v)} aria-expanded={showTheory}><span>◈ Короткая теория — {lesson.title}</span><span>{showTheory ? 'Свернуть −' : 'Открыть +'}</span></button>
        {showTheory && <div className="guide-content"><p>{lesson.subtitle}. Изучи пример, затем самостоятельно реши задачу в редакторе ниже.</p><pre>{lesson.example}</pre><div className="source">Основа: {lesson.source}</div></div>}
      </section>
      <section className="practice">
        <div className="panel editor-panel">
          <div className="panel-header"><div className="panel-title"><span className="file-icon">JS</span> main.js <span className="muted-label">/ рабочий файл</span></div><div className="panel-actions"><span className="autosave">● Автосохранение</span><button onClick={reset} title="Вернуть начальный код">↺ Сбросить</button></div></div>
          <div className="code-editor">
            <div className="line-numbers" aria-hidden="true">{Array.from({length: Math.max(20,code.split('\n').length+1)},(_,i)=><div key={i}>{i+1}</div>)}</div>
            <textarea spellCheck={false} aria-label="Редактор JavaScript" value={code} onChange={e => edit(e.target.value)} onKeyDown={onEditorKeyDown} />
          </div>
          <div className="editor-bottom"><span>JavaScript</span><span>UTF-8</span><span>Пробелы: 2</span></div>
        </div>
        <div className="panel output-panel">
          <div className="panel-header"><div className="output-tabs"><button className={view==='preview'?'active':''} onClick={()=>setView('preview')}>◉ Результат</button><button className={view==='tests'?'active':''} onClick={()=>setView('tests')}>☷ Проверка {results.length ? '('+results.filter(r=>r.passed).length+'/'+results.length+')' : ''}</button></div></div>
          {view==='preview' ? <div className="preview-area">
            {task.mode==='dom' ? <iframe key={task.id + previewCode} title="Предпросмотр задания" sandbox="allow-scripts" srcDoc={preview}/> : <div className="terminal">
              <div className="terminal-label"><span>●</span> КОНСОЛЬ JAVASCRIPT</div>
              {logs.length ? logs.map((log,i)=><div className="terminal-line" key={i}><span>›</span> {log}</div>) : <div className="terminal-empty">Нажми «Запустить», чтобы увидеть вывод и результаты выполнения.</div>}
              {results.some(r=>r.error) && <div className="terminal-error">{results.find(r=>r.error)?.error}</div>}
            </div>}
          </div> : <div className="test-area">
            <div className="test-heading">Автоматические тесты</div>
            {results.length === 0 ? <div className="test-placeholder">Нажми «Проверить задание». Каждый тест выполнится в отдельном изолированном окружении.</div> : results.map((r,i) => <div className={'test-case ' + (r.passed ? 'ok' : 'fail')} key={i}>
              <div className="test-case-title"><span>{r.passed ? '✓' : '✕'}</span><b>{r.name}</b></div>
              {!r.passed && <div className="test-details">{r.error ? r.error : <><span>Ожидается: {JSON.stringify(r.expected)}</span><span>Получено: {r.actual === undefined ? 'undefined' : JSON.stringify(r.actual)}</span></>}</div>}
            </div>)}
            {passed && <div className="pass-note">Все тесты пройдены! Нажми «Проверить задание», чтобы сохранить выполнение.</div>}
          </div>}
          <div className="output-footer"><span className="online-dot"/> Песочница изолирована от платформы</div>
        </div>
      </section>
      <section className="practice-actions">
        <div className="hints">
          <button className="hint-button" onClick={() => setHintCount(n => Math.min(n+1, task.hints.length))}>♧ Подсказка {hintCount ? '('+hintCount+'/'+task.hints.length+')' : ''}</button>
          {hintCount > 0 && <div className="hint-text">{task.hints.slice(0,hintCount).map((hint,i)=><p key={i}><b>{i+1}.</b> {hint}</p>)}</div>}
        </div>
        <div className="action-group"><button className="run-button" disabled={checking} onClick={() => execute(false)}>{checking ? '⏳ Проверяем...' : '▷ Запустить'}</button><button className="check-button" disabled={checking} onClick={() => execute(true)}>{checking ? 'Проверяем...' : '✓ Проверить задание'}</button></div>
      </section>
      <footer className="workspace-footer">
        <span>{currentDayDone} / 9 заданий этого дня завершено</span>
        <button className="next-button" disabled={index === allTasks.length-1} onClick={next}>Следующее задание <span>→</span></button>
      </footer>
    </main>
  </div>;
}
export default App;
