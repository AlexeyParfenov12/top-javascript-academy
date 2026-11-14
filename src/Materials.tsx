import { useEffect, useRef, useState } from 'react';
import { dayMinutes, lessonMinutes, overview } from './course';
import type { Lesson, Material } from './course';

const inClassPractice = [
  '1-3', '1-11', '1-13', '1-21', '2-1-12', '2-3-5', '3-1-7', '3-1-14', '3-3-1',
];

const materialUrl = (id: string, extension: string) =>
  import.meta.env.BASE_URL + 'materials/' + id + '.' + extension;

function MaterialReader({ material, onClose }: {
  material: Pick<Material, 'id' | 'title' | 'project'>;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [html, setHtml] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    dialog.current?.showModal();
    const request = new AbortController();
    fetch(materialUrl(material.id, 'json'), { signal: request.signal })
      .then(response => {
        if (!response.ok) throw new Error('Material unavailable');
        return response.json() as Promise<{ html: string }>;
      })
      .then(document => setHtml(document.html))
      .catch(() => { if (!request.signal.aborted) setFailed(true); });
    return () => request.abort();
  }, [material.id]);

  return <dialog ref={dialog} className="material-reader" onClose={onClose} aria-labelledby="material-title">
    <header className="material-reader-header">
      <h2 id="material-title">{material.title}</h2>
      <button type="button" onClick={() => dialog.current?.close()}>Закрыть</button>
      <a href={materialUrl(material.id, 'docx')} download={material.title + '.docx'}>Скачать оригинал Word</a>
      {material.project && <a href={materialUrl(material.id, 'zip')} download={material.title + '.zip'}>Скачать файлы задания</a>}
    </header>
    {failed ? <p role="status">Не удалось открыть документ. Скачай оригинал Word по ссылке выше.</p> :
      html ? <article className="material-document" dangerouslySetInnerHTML={{ __html: html }} /> :
      <p role="status">Открываем документ…</p>}
  </dialog>;
}

export default function Materials({ lesson, taskId }: { lesson: Lesson; taskId: string }) {
  const [document, setDocument] = useState<Pick<Material, 'id' | 'title' | 'project'>>();
  const groups = [...new Set(lesson.materials.map(material => material.section))];
  const current = lesson.materials.find(material => material.id === taskId);
  const practice = lesson.materials.find(material => material.id === inClassPractice[lesson.number - 1]);
  function show(id: string) {
    setDocument(lesson.materials.find(material => material.id === id));
  }

  return <section className="lesson-guide" aria-label="План и материалы занятия">
    <details key={lesson.number}>
      <summary className="guide-title">
        <span>План занятия · {lessonMinutes} мин</span>
        <span>{lesson.materials.length} материалов</span>
      </summary>
      <div className="guide-content">
        <ol className="lesson-timing">
          <li><strong>25 мин</strong> · Разбор тем по лекциям</li>
          <li><strong>45 мин</strong> · Три задания в редакторе</li>
          <li><strong>15 мин</strong> · Практика по архиву{practice && <> · <button className="material-link" type="button" onClick={() => show(practice.id)}>{practice.title}</button></>}</li>
          <li><strong>5 мин</strong> · Разбор результатов</li>
        </ol>
        <p>Три занятия в день · {dayMinutes} учебных минут</p>
        <h3>Темы для разбора на паре</h3>
        <ul className="material-links">
          {lesson.core.map(id => <li key={id}>
            <button type="button" onClick={() => show(id)}>{lesson.materials.find(material => material.id === id)?.title}</button>
          </li>)}
        </ul>
        <details className="archive-materials">
          <summary>Все лекции и задания занятия</summary>
          {groups.map(section => <section key={section} className="material-group">
            <h3>{section}</h3>
            <ul className="material-links">
              {lesson.materials.filter(material => material.section === section).map(material => <li key={material.id}>
                <button type="button" onClick={() => show(material.id)}>{material.number}. {material.title}</button>
                {material.project && <a href={materialUrl(material.id, 'zip')} download={material.title + '.zip'}>Файлы задания</a>}
              </li>)}
            </ul>
          </section>)}
        </details>
        <button className="material-link" type="button" onClick={() => setDocument(overview)}>Программа курса из архива</button>
      </div>
    </details>
    {current && <button className="material-link current-material" type="button" onClick={() => setDocument(current)}>Открыть условие из архива</button>}
    {document && <MaterialReader key={document.id} material={document} onClose={() => setDocument(undefined)} />}
  </section>;
}
