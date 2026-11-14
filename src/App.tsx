import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { dayMinutes, lessonMinutes, lessons, tasksCount } from './course';
import { checkTask, formatValue, previewHtml, runCode } from './runner';
import type { CheckResult, ExecutionResult } from './runner';
import Materials from './Materials';
import './styles.css';

const allTasks = lessons.flatMap(lesson => lesson.tasks);
const KEY = 'top-javascript-academy-archive-v1';
type DraftMap = Record<string,string>;
function readStored<T>(name: string, fallback: T): T {
  try { const raw = localStorage.getItem(KEY + ':' + name); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}
function App() {
  const [selected, setSelected] = useState(() => {
    const saved = readStored('selected', '');
    return allTasks.find(item => item.id === saved)?.id ?? allTasks[0].id;
  });
  const [drafts, setDrafts] = useState<DraftMap>(() => readStored('drafts', {}));
  const [completed, setCompleted] = useState<string[]>(() => readStored('done', []));
  const [hintCount, setHintCount] = useState(0);
  const [results, setResults] = useState<CheckResult[]>([]);
  const [execution, setExecution] = useState<ExecutionResult>();
  const [checking, setChecking] = useState(false);
  const [previewCode, setPreviewCode] = useState<string>();
  const [previewVersion, setPreviewVersion] = useState(0);
  const [view, setView] = useState<'preview'|'tests'>('preview');
  const [showNavigation, setShowNavigation] = useState(false);
  const editor = useRef<HTMLTextAreaElement>(null);
  const gutter = useRef<HTMLDivElement>(null);
  const allowTabToLeave = useRef(false);
  const lesson = lessons.find(item => item.tasks.some(task => task.id === selected)) ?? lessons[0];
  const task = lesson.tasks.find(item => item.id === selected) ?? lesson.tasks[0];
  const day = lesson.day;
  const code = drafts[task.id] ?? task.starter;
  const index = allTasks.findIndex(item => item.id === task.id);
  const percent = Math.round(completed.length / tasksCount * 100);
  const dayTasks = lessons.filter(item => item.day === day).flatMap(item => item.tasks);
  const currentDayDone = dayTasks.filter(item => completed.includes(item.id)).length;
  const isDone = completed.includes(task.id);

  useEffect(() => { try { localStorage.setItem(KEY + ':drafts', JSON.stringify(drafts)); } catch {} }, [drafts]);
  useEffect(() => { try { localStorage.setItem(KEY + ':done', JSON.stringify(completed)); } catch {} }, [completed]);
  useEffect(() => {
    try { localStorage.setItem(KEY + ':selected', JSON.stringify(selected)); } catch {}
  }, [selected]);
  const preview = useMemo(() => task.mode === 'dom' ? previewHtml(task, previewCode) : '', [task, previewCode]);

  function choose(id: string, moveToTask = true) {
    if (checking) return;
    if (id !== selected) {
      setSelected(id);
      setPreviewCode(undefined);
      setResults([]);
      setExecution(undefined);
      setHintCount(0);
      setView('preview');
      editor.current?.scrollTo(0, 0);
    }
    if (moveToTask) {
      setShowNavigation(false);
      if (window.matchMedia('(max-width: 700px)').matches) window.scrollTo(0, 0);
    }
  }
  function edit(value: string) {
    setDrafts(prev => ({ ...prev, [task.id]: value }));
    setResults([]);
    setExecution(undefined);
    setCompleted(prev => prev.filter(item => item !== task.id));
  }
  function reset() {
    edit(task.starter);
    setPreviewCode(undefined);
    setView('preview');
    setPreviewVersion(version => version + 1);
    setHintCount(0);
  }
  async function execute(grade: boolean) {
    if (checking) return;
    setChecking(true);
    setResults([]);
    setExecution(undefined);
    if (task.mode === 'dom') {
      setPreviewCode(code);
      setPreviewVersion(version => version + 1);
    }
    setView(grade ? 'tests' : 'preview');
    try {
      if (!grade) {
        if (task.mode !== 'dom') setExecution(await runCode(task, code));
        return;
      }
      const checks = await checkTask(task, code);
      setResults(checks);
      if (checks.length > 0 && checks.every(item => item.passed)) {
        setCompleted(prev => prev.includes(task.id) ? prev : [...prev, task.id]);
      }
    } catch (error) {
      const failure = { actual: undefined, error: String(error), logs: [] };
      if (grade) setResults([{ ...failure, name: 'Запуск', passed: false, expected: undefined }]);
      else setExecution(failure);
    } finally { setChecking(false); }
  }
  function next() { if (index < allTasks.length - 1) choose(allTasks[index + 1].id); }
  function onEditorKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Escape') {
      allowTabToLeave.current = true;
      return;
    }
    const leaveEditor = allowTabToLeave.current;
    allowTabToLeave.current = false;
    if (e.key !== 'Tab' || e.shiftKey || leaveEditor || checking) return;
    e.preventDefault();
    const el = e.currentTarget;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    edit(code.slice(0, start) + '  ' + code.slice(end));
    requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = start + 2; });
  }
  const logs = execution?.logs ?? results[0]?.logs ?? [];
  const outputError = execution?.error ?? results.find(result => result.error)?.error;
  const passed = results.length > 0 && results.every(result => result.passed);
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">T<span>O</span>P</div>
        <div className="brand-text"><b>TOP Academy</b><small>LEARNING PLATFORM</small></div>
      </div>
      <div className="course-label">ИНТЕРАКТИВНЫЙ КУРС</div>
      <h2 className="course-name">JavaScript <span>Старт</span></h2>
      <p className="course-subtitle">3 дня по {dayMinutes} минут · 9 занятий по {lessonMinutes} минут</p>
      <div className="progress-card">
        <div className="progress-head"><span>Ваш прогресс</span><strong>{percent}%</strong></div>
        <div className="progress-track"><div style={{ width: percent + '%' }} /></div>
        <span className="progress-caption">{completed.length} из {tasksCount} заданий выполнено</span>
      </div>
      <button className="mobile-nav-toggle" type="button" aria-expanded={showNavigation} aria-controls="course-navigation" onClick={() => setShowNavigation(open => !open)}>
        Занятия курса · день {day} <span aria-hidden="true">{showNavigation ? '−' : '+'}</span>
      </button>
      <div id="course-navigation" className={'sidebar-navigation' + (showNavigation ? ' expanded' : '')}>
      <div className="day-tabs" role="group" aria-label="Выбор учебного дня">
        {[1,2,3].map(n => <button key={n} className={day === n ? 'day-tab active' : 'day-tab'} aria-pressed={day === n} disabled={checking} onClick={() => { if (n !== day) choose(lessons.find(l => l.day === n)!.tasks[0].id, false); }}>День {n}</button>)}
      </div>
      <nav className="course-nav" aria-label="Уроки и задания">
        {lessons.filter(l => l.day === day).map(l => <div className="nav-lesson" key={l.number}>
          <div className="nav-lesson-label"><span className="lesson-number">{String(l.number).padStart(2,'0')}</span><span>{l.title}</span></div>
          {l.tasks.map((item, i) => <button key={item.id} className={'task-nav-item ' + (selected === item.id ? 'active ' : '')} disabled={checking} onClick={() => choose(item.id)} aria-current={selected === item.id ? 'step' : undefined}>
            <span className={'task-mark ' + (completed.includes(item.id) ? 'done' : '')}>{completed.includes(item.id) ? '✓' : i+1}</span>
            <span>{item.title}</span>
          </button>)}
        </div>)}
      </nav>
      </div>
      <div className="sidebar-foot"><span className="online-dot" /> Обучение без регистрации <small>Прогресс хранится в браузере</small></div>
    </aside>
    <main className="workspace">
      <header className="topbar">
        <div className="crumbs"><span>КУРСЫ</span><span className="chevron">›</span><span>JAVASCRIPT</span><span className="chevron">›</span><b>ЗАНЯТИЕ {lesson.number}</b></div>
        <div className="topbar-right"><span className="course-pill">{dayMinutes} мин в день</span><span className="task-pill">{index+1} / {tasksCount}</span></div>
      </header>
      <section className="intro">
        <div className="intro-left">
          <div className="eyebrow">ДЕНЬ {lesson.day} <span className="dot-separator">•</span> ПАРА {lesson.number - (lesson.day - 1) * 3} <span className="dot-separator">•</span> ЗАДАНИЕ {lesson.tasks.indexOf(task) + 1} / {lesson.tasks.length}</div>
          <h1>{task.title}</h1>
          <p className="goal">{task.goal}</p>
          <div className="topic-chips">{lesson.concepts.map(concept => <span key={concept}>{concept}</span>)}</div>
        </div>
        <div className="intro-right"><div className="mini-timer"><strong>{lessonMinutes} мин</strong> · занятие</div><div className="task-status">{isDone ? <span className="success-text">✓ Выполнено</span> : <span>○ В процессе</span>}</div></div>
      </section>
      <Materials lesson={lesson} taskId={task.id} />
      <section className="practice">
        <div className="panel editor-panel">
          <div className="panel-header"><div className="panel-title"><span className="file-icon">JS</span> main.js <span className="muted-label">/ рабочий файл</span></div><div className="panel-actions"><span className="autosave">● Автосохранение</span><button onClick={reset} disabled={checking} title="Вернуть начальный код">↺ Сбросить</button></div></div>
          <div className="code-editor">
            <div className="line-numbers" ref={gutter} aria-hidden="true">{code.split('\n').map((_, i) => <div key={i}>{i+1}</div>)}</div>
            <textarea ref={editor} spellCheck={false} autoCapitalize="off" autoCorrect="off" wrap="off" readOnly={checking} aria-label="Редактор JavaScript" aria-describedby="editor-keys" value={code} onChange={e => edit(e.target.value)} onKeyDown={onEditorKeyDown} onBlur={() => { allowTabToLeave.current = false; }} onScroll={event => { if (gutter.current) gutter.current.scrollTop = event.currentTarget.scrollTop; }} />
          </div>
          <div className="editor-bottom"><span>Пробелы: 2</span><span id="editor-keys">Esc, затем Tab — выход из редактора</span></div>
        </div>
        <div className="panel output-panel">
          <div className="panel-header"><div className="output-tabs"><button className={view==='preview'?'active':''} onClick={()=>setView('preview')}>◉ Результат</button><button className={view==='tests'?'active':''} onClick={()=>setView('tests')}>☷ Проверка {results.length ? '('+results.filter(r=>r.passed).length+'/'+results.length+')' : ''}</button></div></div>
          {view==='preview' ? <div className="preview-area">
            {task.mode==='dom' ? <iframe key={task.id + ':' + previewVersion} title="Предпросмотр задания" sandbox="allow-scripts" srcDoc={preview}/> : <div className="terminal">
              <div className="terminal-label"><span>●</span> КОНСОЛЬ JAVASCRIPT</div>
              {logs.length ? logs.map((log,i)=><div className="terminal-line" key={i}><span>›</span> {log}</div>) : !outputError && <div className="terminal-empty">{execution || results.length ? 'Программа ничего не вывела в консоль.' : 'Нажми «Запустить», чтобы увидеть вывод программы.'}</div>}
              {outputError && <div className="terminal-error">{outputError}</div>}
            </div>}
          </div> : <div className="test-area">
            <div className="test-heading">Автоматические тесты</div>
            {results.length === 0 ? <div className="test-placeholder" role="status">{checking ? 'Проверяем задание…' : 'Нажми «Проверить задание».'}</div> : results.map((r,i) => <div className={'test-case ' + (r.passed ? 'ok' : 'fail')} key={i}>
              <div className="test-case-title"><span>{r.passed ? '✓' : '✕'}</span><b>{r.name}</b></div>
              {!r.passed && <div className="test-details">{r.error ? r.error : <><span>Ожидается: {formatValue(r.expected)}</span><span>Получено: {formatValue(r.actual)}</span></>}</div>}
            </div>)}
            {passed && <div className="pass-note" role="status">Все тесты пройдены. Выполнение задания сохранено.</div>}
          </div>}
          <div className="output-footer"><span className="online-dot"/> Песочница изолирована от платформы</div>
        </div>
      </section>
      <section className="practice-actions">
        <div className="hints">
          <button className="hint-button" disabled={hintCount === task.hints.length} onClick={() => setHintCount(n => Math.min(n+1, task.hints.length))}>♧ Подсказка {hintCount ? '('+hintCount+'/'+task.hints.length+')' : ''}</button>
          {hintCount > 0 && <div className="hint-text">{task.hints.slice(0,hintCount).map((hint,i)=><p key={i}><b>{i+1}.</b> {hint}</p>)}</div>}
        </div>
        <div className="action-group"><button className="run-button" disabled={checking} onClick={() => execute(false)}>{checking ? '⏳ Проверяем...' : '▷ Запустить'}</button><button className="check-button" disabled={checking} onClick={() => execute(true)}>{checking ? 'Проверяем...' : '✓ Проверить задание'}</button></div>
      </section>
      <footer className="workspace-footer">
        <span>{currentDayDone} / {dayTasks.length} заданий этого дня завершено</span>
        <button className="next-button" disabled={checking || index === allTasks.length-1} onClick={next}>Следующее задание <span>→</span></button>
      </footer>
    </main>
  </div>;
}
export default App;
