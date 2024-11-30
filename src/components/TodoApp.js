import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { GripHorizontal, Trash2, PlusCircle } from 'lucide-react';
import './TodoApp.css';

const getStoredData = (key, defaultValue) => {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    return Array.isArray(data) ? data : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const TodoApp = () => {
  const STORAGE_KEYS = {
    TODOS: 'todos',
    COMPLETED: 'completedTodos',
  };

  const [todos, setTodos] = useState(() =>
    getStoredData(STORAGE_KEYS.TODOS, [
      { id: '1', content: '', completed: false },
      { id: '2', content: '', completed: false },
    ])
  );
  const [completedTodos, setCompletedTodos] = useState(() =>
    getStoredData(STORAGE_KEYS.COMPLETED, [])
  );
  const [editingTodo, setEditingTodo] = useState(null);
  const [isCompletedListOpen, setIsCompletedListOpen] = useState(true); // 기본적으로 열려 있음

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TODOS, todos);
    saveToStorage(STORAGE_KEYS.COMPLETED, completedTodos);
  }, [todos, completedTodos]);

  const addTodo = useCallback(() => {
    const newTodo = {
      id: Date.now().toString(),
      content: '',
      completed: false,
    };
    setTodos((prev) => [newTodo, ...prev]);
    setEditingTodo(newTodo.id); // 새로 추가된 할 일을 수정 상태로 설정
  }, []);

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    setTodos((prevTodos) => {
      const oldIndex = prevTodos.findIndex((todo) => todo.id === active.id);
      const newIndex = prevTodos.findIndex((todo) => todo.id === over.id);
      return arrayMove(prevTodos, oldIndex, newIndex);
    });
  };

  const toggleTodoCompletion = (id, completed) => {
    if (completed) {
      const completedTodo = todos.find((todo) => todo.id === id);
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
      setCompletedTodos((prev) => [{ ...completedTodo, completed: true }, ...prev]);
    } else {
      const todoToRevert = completedTodos.find((todo) => todo.id === id);
      setCompletedTodos((prev) => prev.filter((todo) => todo.id !== id));
      setTodos((prev) => [{ ...todoToRevert, completed: false }, ...prev]);
    }
  };

  const startEditing = (todo) => {
    setEditingTodo(todo.id);
  };

  const saveEditedTodo = (id, newContent) => {
    if (!newContent.trim()) return;

    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, content: newContent } : todo
      )
    );
    setEditingTodo(null);
  };

  const deleteTodo = (id, completed) => {
    if (completed) {
      setCompletedTodos((prev) => prev.filter((todo) => todo.id !== id));
    } else {
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    }
  };

  return (
    <div className="todo-list">
      <h2>할 일 목록</h2>
      <div className="todo-add-container">
        <button onClick={addTodo} className="add-todo-button">
          <PlusCircle size={24} />
        </button>
      </div>
      <div className="list-container">
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
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
                  startEditing={startEditing}
                  saveEditedTodo={saveEditedTodo}
                  deleteTodo={deleteTodo}
                  toggleTodoCompletion={toggleTodoCompletion}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <h3 onClick={() => setIsCompletedListOpen((prev) => !prev)}>
          {isCompletedListOpen ? '완료 목록 닫기' : '완료 목록'}
        </h3>
        {isCompletedListOpen && (
          <div className="completed-todo-list">
            {completedTodos.map((todo) => (
              <SortableItem
                key={todo.id}
                todo={todo}
                isEditing={editingTodo === todo.id}
                startEditing={startEditing}
                saveEditedTodo={saveEditedTodo}
                deleteTodo={deleteTodo}
                toggleTodoCompletion={toggleTodoCompletion}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SortableItem = ({
  todo,
  isEditing,
  startEditing,
  saveEditedTodo,
  deleteTodo,
  toggleTodoCompletion,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: todo.id,
  });

  const editableRef = useRef(null);

  useEffect(() => {
    if (isEditing && editableRef.current) editableRef.current.focus();
  }, [isEditing]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const textContent = editableRef.current?.textContent.trim() || '';
      saveEditedTodo(todo.id, textContent);
    }
  };

  const handleDelete = () => deleteTodo(todo.id, todo.completed);

  return (
    <div
      ref={setNodeRef}
      className="sortable-item"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition || 'transform 0.2s ease-in-out',
      }}
    >
      <div {...listeners} {...attributes} className="sortable-item-handle">
        <GripHorizontal size={12} />
      </div>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => toggleTodoCompletion(todo.id, !todo.completed)}
        className="sortable-item-checkbox"
      />
      {isEditing || !todo.content.trim() ? (
        <div
          ref={editableRef}
          contentEditable
          suppressContentEditableWarning
          onKeyDown={handleKeyDown}
          data-placeholder="새로운 할 일 입력"
          className="sortable-item-placeholder"
        >
          {todo.content}
        </div>
      ) : (
        <span onClick={() => startEditing(todo)}>{todo.content}</span>
      )}
      <Trash2 size={16} onClick={handleDelete} className="sortable-item-delete" />
    </div>
  );
};

export default TodoApp;
