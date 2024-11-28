import React, { useState, useEffect, useRef } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripHorizontal, Trash2, PlusCircle } from 'lucide-react';
import './TodoApp.css';

function TodoApp() {
  const [todos, setTodos] = useState(() => {
    try {
      const storedTodos = JSON.parse(localStorage.getItem('todos'));
      return Array.isArray(storedTodos) ? storedTodos : []; // 배열이 아니면 빈 배열 반환
    } catch {
      return []; // JSON 파싱 실패 시 빈 배열 반환
    }
  });
  
  const [completedTodos, setCompletedTodos] = useState(() => {
    try {
      const storedCompleted = JSON.parse(localStorage.getItem('completedTodos'));
      return Array.isArray(storedCompleted) ? storedCompleted : [];
    } catch {
      return [];
    }
  });
  

  const [editingTodo, setEditingTodo] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [isCompletedListOpen, setIsCompletedListOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
    localStorage.setItem('completedTodos', JSON.stringify(completedTodos));
  }, [todos, completedTodos]);

  const addTodo = () => {
    const newTodoItem = { id: Date.now().toString(), content: '.' };
    setTodos((prevTodos) => [newTodoItem, ...prevTodos]);
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    if (todos.some((todo) => todo.id === active.id)) {
      const activeIndex = todos.findIndex((todo) => todo.id === active.id);
      const overIndex = todos.findIndex((todo) => todo.id === over.id);
      const updatedTodos = arrayMove(todos, activeIndex, overIndex);
      setTodos(updatedTodos);
    } else if (completedTodos.some((todo) => todo.id === active.id)) {
      const activeIndex = completedTodos.findIndex((todo) => todo.id === active.id);
      const overIndex = completedTodos.findIndex((todo) => todo.id === over.id);
      const updatedCompletedTodos = arrayMove(completedTodos, activeIndex, overIndex);
      setCompletedTodos(updatedCompletedTodos);
    }
  };

  const startEditing = (todo) => {
    setEditingTodo(todo.id);
    setEditedContent(todo.content);
  };

  const saveEditedTodo = () => {
    if (editedContent.trim() === '') {
      alert('내용을 입력해주세요!');
      return;
    }

    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === editingTodo ? { ...todo, content: editedContent } : todo
      )
    );
    setCompletedTodos((prevCompleted) =>
      prevCompleted.map((todo) =>
        todo.id === editingTodo ? { ...todo, content: editedContent } : todo
      )
    );
    setEditingTodo(null);
    setEditedContent('');
  };

  const deleteTodo = (id) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    setCompletedTodos((prevCompleted) => prevCompleted.filter((todo) => todo.id !== id));
  };

  const completeTodo = (id) => {
    const todo = todos.find((t) => t.id === id);
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    setCompletedTodos((prevCompleted) => [...prevCompleted, todo]);
  };

  const uncompleteTodo = (id) => {
    const todo = completedTodos.find((t) => t.id === id);
    setCompletedTodos((prevCompleted) => prevCompleted.filter((todo) => todo.id !== id));
    setTodos((prevTodos) => [todo, ...prevTodos]);
  };

  return (
    <div className="todo-list">
      <h2>투두리스트</h2>

      {/* + 버튼 */}
      <div className="todo-add-container">
        <button onClick={addTodo} className="add-todo-button">
          <PlusCircle size={24} />
        </button>
      </div>

      {/* 리스트 컨테이너 */}
      <div className="list-container">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={todos.map((todo) => todo.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="todo-list-items">
              {todos.map((todo) => (
                <SortableItem
                  key={todo.id}
                  todo={todo}
                  isEditing={editingTodo === todo.id}
                  editedContent={editedContent}
                  setEditedContent={setEditedContent}
                  startEditing={startEditing}
                  saveEditedTodo={saveEditedTodo}
                  deleteTodo={deleteTodo}
                  toggleComplete={() => completeTodo(todo.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <h3 onClick={() => setIsCompletedListOpen(!isCompletedListOpen)} style={{ cursor: 'pointer' }}>
          {isCompletedListOpen ? '완료된 리스트 숨기기' : '완료된 리스트 보기'}
        </h3>
        {isCompletedListOpen && (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={completedTodos.map((todo) => todo.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="completed-todo-list">
                {completedTodos.map((todo) => (
                  <SortableItem
                    key={todo.id}
                    todo={todo}
                    isEditing={editingTodo === todo.id}
                    editedContent={editedContent}
                    setEditedContent={setEditedContent}
                    startEditing={startEditing}
                    saveEditedTodo={saveEditedTodo}
                    deleteTodo={deleteTodo}
                    toggleComplete={() => uncompleteTodo(todo.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}

function SortableItem({
  todo,
  isEditing,
  editedContent,
  setEditedContent,
  startEditing,
  saveEditedTodo,
  deleteTodo,
  toggleComplete,
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: todo.id,
  });

  const editableRef = useRef(null);
  const [composing, setComposing] = useState(false);

  useEffect(() => {
    if (isEditing && editableRef.current) {
      editableRef.current.focus();
      setCaretToEnd(editableRef.current); // 수정 시작 시 커서를 텍스트 끝으로 이동
    }
  }, [isEditing]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: '8px',
    margin: '4px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const setCaretToEnd = (element) => {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(element); // 요소의 모든 내용을 선택
    range.collapse(false); // 커서를 텍스트 끝으로 이동
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const handleCompositionStart = () => {
    setComposing(true); // 한글 조합 시작
  };

  const handleCompositionEnd = (e) => {
    setComposing(false); // 한글 조합 종료
    setEditedContent(e.target.textContent); // 최종 입력 내용 저장
    setCaretToEnd(editableRef.current); // 조합 종료 후 커서 복원
  };

  const handleInput = (e) => {
    if (!composing) {
      setEditedContent(e.target.textContent); // 조합 중이 아닐 때만 상태 업데이트
      setCaretToEnd(editableRef.current); // 상태 업데이트 후 커서 복원
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEditedTodo();
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        {...listeners}
        {...attributes}
        style={{ cursor: 'grab', padding: '4px', marginRight: '8px' }}
      >
        <GripHorizontal />
      </div>

      <input
        type="checkbox"
        checked={todo.completed || false}
        onChange={toggleComplete}
        style={{ marginRight: '10px' }}
      />

      {isEditing ? (
        <div
          ref={editableRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onKeyDown={handleKeyDown}
          style={{
            flexGrow: 1,
            padding: '5px',
            outline: 'none',
            cursor: 'text',
            backgroundColor: 'transparent',
            fontSize: '16px',
            textAlign: 'left',
            whiteSpace: 'pre-wrap',
          }}
          autoFocus
        >
          {editedContent}
        </div>
      ) : (
        <span
          onClick={() => startEditing(todo)}
          style={{ flexGrow: 1, cursor: 'pointer' }}
        >
          {todo.content}
        </span>
      )}

      <Trash2 onClick={() => deleteTodo(todo.id)} style={{ cursor: 'pointer', color: 'red' }} />
    </div>
  );
}






export default TodoApp;
