import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

/**
 * Minimalistic light-themed Todo app implementing:
 * - Add, edit, delete
 * - Toggle complete/incomplete
 * - List and filter (All, Active, Completed)
 * Features are implemented locally in state; no backend calls.
 */

// Utility to generate a simple id
const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// PUBLIC_INTERFACE
export default function App() {
  // Theme handling (light as default)
  const [theme, setTheme] = useState('light');

  // Todo state
  const [todos, setTodos] = useState(() => {
    // load from localStorage for a nicer UX across reloads
    try {
      const raw = localStorage.getItem('todos');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [filter, setFilter] = useState('all'); // all | active | completed

  // Persist todos
  useEffect(() => {
    try {
      localStorage.setItem('todos', JSON.stringify(todos));
    } catch {
      // ignore storage errors
    }
  }, [todos]);

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  // Derived filtered list
  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter((t) => !t.completed);
      case 'completed':
        return todos.filter((t) => t.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  // PUBLIC_INTERFACE
  const addTodo = (title) => {
    if (!title.trim()) return;
    const newTodo = { id: genId(), title: title.trim(), completed: false };
    setTodos((prev) => [newTodo, ...prev]);
  };

  // PUBLIC_INTERFACE
  const toggleTodo = (id) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  // PUBLIC_INTERFACE
  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  // PUBLIC_INTERFACE
  const editTodo = (id, newTitle) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: newTitle.trim() || t.title } : t))
    );
  };

  // PUBLIC_INTERFACE
  const clearCompleted = () => {
    setTodos((prev) => prev.filter((t) => !t.completed));
  };

  const activeCount = useMemo(() => todos.filter((t) => !t.completed).length, [todos]);

  return (
    <div className="App">
      <header className="todo-header">
        <h1 className="app-title">Simple Todos</h1>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </header>

      <main className="todo-main">
        <div className="todo-card">
          <AddTodoForm onAdd={addTodo} />
          <ActionsBar
            filter={filter}
            setFilter={setFilter}
            activeCount={activeCount}
            hasCompleted={todos.some((t) => t.completed)}
            onClearCompleted={clearCompleted}
          />
          <TodoList
            items={filteredTodos}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onEdit={editTodo}
          />
        </div>
      </main>

      <footer className="todo-footer">
        <p className="muted">A lightweight, minimalistic todo — no backend required.</p>
      </footer>
    </div>
  );
}

function AddTodoForm({ onAdd }) {
  const [value, setValue] = useState('');

  const submit = (e) => {
    e.preventDefault();
    onAdd(value);
    setValue('');
  };

  return (
    <form className="add-form" onSubmit={submit} aria-label="Add new task">
      <input
        className="input"
        type="text"
        placeholder="Add a new task..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Task title"
      />
      <button className="btn primary" type="submit" disabled={!value.trim()}>
        Add
      </button>
    </form>
  );
}

function ActionsBar({ filter, setFilter, activeCount, hasCompleted, onClearCompleted }) {
  return (
    <div className="actions-bar" role="region" aria-label="Filters and actions">
      <div className="filters" role="tablist" aria-label="Filter tasks">
        <button
          role="tab"
          aria-selected={filter === 'all'}
          className={`chip ${filter === 'all' ? 'chip-active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          role="tab"
          aria-selected={filter === 'active'}
          className={`chip ${filter === 'active' ? 'chip-active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button
          role="tab"
          aria-selected={filter === 'completed'}
          className={`chip ${filter === 'completed' ? 'chip-active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>
      <div className="spacer" />
      <div className="right-actions">
        <span className="muted">{activeCount} items left</span>
        <button
          className="btn ghost"
          onClick={onClearCompleted}
          disabled={!hasCompleted}
          title="Clear completed tasks"
        >
          Clear completed
        </button>
      </div>
    </div>
  );
}

function TodoList({ items, onToggle, onDelete, onEdit }) {
  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul className="todo-list" aria-label="Todo list">
      {items.map((t) => (
        <TodoItem key={t.id} item={t} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </ul>
  );
}

function EmptyState() {
  return (
    <div className="empty">
      <div className="empty-icon">📝</div>
      <div className="empty-text">No tasks here yet. Add your first task!</div>
    </div>
  );
}

function TodoItem({ item, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.title);

  useEffect(() => setDraft(item.title), [item.title]);

  const handleSave = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== item.title) {
      onEdit(item.id, trimmed);
    }
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setDraft(item.title);
      setEditing(false);
    }
  };

  return (
    <li className={`todo-item ${item.completed ? 'completed' : ''}`}>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={item.completed}
          onChange={() => onToggle(item.id)}
          aria-label={`Mark "${item.title}" as ${item.completed ? 'incomplete' : 'complete'}`}
        />
        <span className="checkmark" />
      </label>

      {editing ? (
        <input
          className="edit-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
          aria-label="Edit task title"
        />
      ) : (
        <span
          className="title"
          onDoubleClick={() => setEditing(true)}
          title="Double-click to edit"
          role="textbox"
          aria-readonly="true"
        >
          {item.title}
        </span>
      )}

      <div className="item-actions">
        {!editing && (
          <button
            className="icon-btn"
            onClick={() => setEditing(true)}
            aria-label={`Edit ${item.title}`}
            title="Edit"
          >
            ✏️
          </button>
        )}
        <button
          className="icon-btn danger"
          onClick={() => onDelete(item.id)}
          aria-label={`Delete ${item.title}`}
          title="Delete"
        >
          🗑
        </button>
      </div>
    </li>
  );
}
