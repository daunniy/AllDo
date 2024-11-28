import React, { useState, useEffect } from 'react';
import NotesApp from './components/NotesApp';
import TodoApp from './components/TodoApp';
import KoreanEnglishTranslator from './components/KoreanEnglishTranslator';
import { Globe, MessageSquare, Edit } from 'lucide-react';
import './App.css';

function App() {
  const [bgColor, setBgColor] = useState('#ffffff');
  const [showTranslator, setShowTranslator] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showTodo, setShowTodo] = useState(false);
  const [activeComponents, setActiveComponents] = useState([]); // 여러 개의 버튼 상태 추적

  // 초기 배경색 불러오기
  useEffect(() => {
    const savedBgColor = localStorage.getItem('bgColor');
    if (savedBgColor) {
      setBgColor(savedBgColor);
    }
  }, []);

  // 배경색을 바꾸면 localStorage에 저장
  useEffect(() => {
    document.body.style.backgroundColor = bgColor;
    localStorage.setItem('bgColor', bgColor);
  }, [bgColor]);

  // 컴포넌트 토글 함수
  const toggleComponent = (component) => {
    if (component === 'translator') {
      setShowTranslator(prev => !prev);
      toggleActive('translator');
    } else if (component === 'notes') {
      setShowNotes(prev => !prev);
      toggleActive('notes');
    } else if (component === 'todo') {
      setShowTodo(prev => !prev);
      toggleActive('todo');
    }
  };

  // 버튼 클릭 시 active 상태 추가 또는 제거
  const toggleActive = (component) => {
    setActiveComponents((prev) => {
      if (prev.includes(component)) {
        return prev.filter(item => item !== component); // 두 번째 클릭 시 active 제거
      } else {
        return [...prev, component]; // 첫 번째 클릭 시 active 추가
      }
    });
  };

  return (
    <div className="App">
      {/* 배경색 선택 UI */}
      <div className="bg-color-selector">
        <button onClick={() => setBgColor('#ffffff')}>라이트 모드</button>
        <button onClick={() => setBgColor('#000000')}>다크 모드</button>
      </div>

      {/* 컴포넌트 토글 버튼들 */}
      <div className={`button-components ${bgColor === '#000000' ? 'black-background' : ''}`}>
        <button
          onClick={() => toggleComponent('translator')}
          data-tooltip="번역기"
          className={activeComponents.includes('translator') ? 'active' : ''}
        >
          <Globe />
        </button>
        <button
          onClick={() => toggleComponent('notes')}
          data-tooltip="메모"
          className={activeComponents.includes('notes') ? 'active' : ''}
        >
          <Edit />
        </button>
        <button
          onClick={() => toggleComponent('todo')}
          data-tooltip="할 일"

          className={activeComponents.includes('todo') ? 'active' : ''}
        >
          <MessageSquare />
        </button>
      </div>

      {/* 각 컴포넌트 렌더링 */}
      <div className="section">
        {/* 번역기 */}
        <div className={`translator-container ${showTranslator ? 'show' : 'hide'}`}>
          {showTranslator && <KoreanEnglishTranslator />}
        </div>
      </div>
      
      <div className="section">
        {/* 메모 앱 */}
        {showNotes && <NotesApp />}
      </div>

      <div className="section">
        {/* 투두 앱 */}
        <div className={`todoApp-container ${showTodo ? 'show' : 'hide'}`}>
          {showTodo && <TodoApp />}
        </div>
      </div>
    </div>
  );
}

export default App;
