import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import './NotesApp.css';

const NotesApp = () => {
  const [notes, setNotes] = useState([]);  // 메모 목록
  const [zIndexes, setZIndexes] = useState({});  // 각 메모의 z-index 관리

  // 페이지가 로드될 때 localStorage에서 메모 목록과 위치를 불러옴
  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    const savedPositions = localStorage.getItem('positions'); // 드래그 위치 가져오기
    const positions = savedPositions ? JSON.parse(savedPositions) : {}; // 위치 객체 가져오기

    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes);
      // 메모에 드래그 위치 추가
      const notesWithPosition = parsedNotes.map(note => ({
        ...note,
        position: positions[note.id] || { x: 0, y: 0 }, // 기존 위치 복원
        date: new Date(note.date),
        lastEdited: new Date(note.lastEdited),
      }));

      setNotes(notesWithPosition);

      // 초기 z-index 설정 (모든 메모는 기본 z-index가 0)
      const initialZIndexes = parsedNotes.reduce((acc, note) => {
        acc[note.id] = 0;
        return acc;
      }, {});
      setZIndexes(initialZIndexes);
    }
  }, []);

  // 날짜 포맷 함수
  const formatDate = (date) => {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) { // 유효하지 않은 날짜 검사
      return '유효하지 않은 날짜';
    }

    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(parsedDate);
  };

  // 메모 추가 (빈 항목도 추가 가능)
  const addNote = () => {
    const newId = Date.now(); // 유니크한 ID 생성
    const newDate = new Date();
    const newNoteData = {
      id: newId,
      content: '', // 빈 메모 항목으로 시작
      date: newDate.toISOString(), // 날짜를 문자열로 저장
      lastEdited: newDate.toISOString(), // 날짜를 문자열로 저장
      position: { x: 0, y: 0 }, // 기본 위치
    };

    const updatedNotes = [...notes, newNoteData];
    setNotes(updatedNotes);
    localStorage.setItem('notes', JSON.stringify(updatedNotes)); // localStorage에 메모 저장

    // 새로운 메모의 z-index는 0으로 설정
    setZIndexes((prevZIndexes) => ({
      ...prevZIndexes,
      [newId]: 0,
    }));
  };

  // 메모 삭제
  const deleteNote = (id) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem('notes', JSON.stringify(updatedNotes)); // localStorage에서 메모 삭제

    // z-index 상태에서 해당 메모 삭제
    const updatedZIndexes = { ...zIndexes };
    delete updatedZIndexes[id];
    setZIndexes(updatedZIndexes);
  };

  // 메모 수정
  const editNote = (id, content) => {
    const updatedNotes = notes.map(note =>
      note.id === id ? { 
        ...note, 
        content: content, 
        lastEdited: new Date().toISOString() // 수정 시 current time으로 업데이트
      } : note
    );
    
    setNotes(updatedNotes);
    localStorage.setItem('notes', JSON.stringify(updatedNotes)); // 수정된 메모를 localStorage에 저장
  };

  // 메모 드래그 위치 저장
  const handleDragStop = (id, e, data) => {
    const newPosition = { x: data.x, y: data.y };

    // 위치 업데이트
    const updatedNotes = notes.map(note =>
      note.id === id ? { 
        ...note, 
        position: newPosition 
      } : note
    );
    
    setNotes(updatedNotes);
    localStorage.setItem('notes', JSON.stringify(updatedNotes)); // 메모 내용도 함께 localStorage에 저장

    // 위치만 따로 localStorage에 저장
    const positions = updatedNotes.reduce((acc, note) => {
      acc[note.id] = note.position;
      return acc;
    }, {});
    localStorage.setItem('positions', JSON.stringify(positions)); // 드래그 위치 저장
  };

  // 메모 클릭 시 z-index를 높여서 가장 위로 오게 함
  const bringToFront = (id) => {
    setZIndexes((prevZIndexes) => {
      const newZIndexes = { ...prevZIndexes };
      const maxZIndex = Math.max(...Object.values(prevZIndexes), 0); // 가장 큰 z-index 값
      newZIndexes[id] = maxZIndex + 1; // 클릭된 메모의 z-index를 1 증가시킴
      return newZIndexes;
    });
  };

  return (
    <div>
      
      {/* 메모가 없을 때 "메모를 추가하세요" 안내 문구 표시 */}
      {notes.length === 0 && (
        <div className="no-notes" onClick={addNote}>
          <p>메모를 추가하세요!</p>
        </div>
      )}

      {/* 메모 목록 */}
      <ul>
        {notes.map(note => (
          <Draggable 
            key={note.id} 
            position={note.position}  // 위치를 state로 관리하여 업데이트된 위치로 반영
            bounds="html"
            onStop={(e, data) => handleDragStop(note.id, e, data)} // 드래그 후 위치 저장
          >
            <li 
              className="note-item" 
              style={{ 
                position: 'absolute', 
                zIndex: zIndexes[note.id] || 0  // 클릭된 메모의 z-index를 높여서 맨 위로 표시
              }}
              onClick={() => bringToFront(note.id)} // 클릭 시 해당 메모의 z-index를 올림
            >
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => editNote(note.id, e.target.innerText)} // 수정 후 onBlur 이벤트로 저장
              >
                {note.content || ""}
              </div>
              <div>
                <small>{formatDate(note.lastEdited)}</small>
              </div>
              <button className="delete-button" onClick={() => deleteNote(note.id)}>X</button>
              <button className="add-memo" onClick={addNote}>+</button>
            </li>
          </Draggable>
        ))}
      </ul>
    </div>
  );
};

export default NotesApp;
