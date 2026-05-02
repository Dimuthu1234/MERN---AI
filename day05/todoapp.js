const { useState } = React;

function TodoApp() {
  // State: todos array + input text
  const [todos, setTodos] = useState([
    { id: 1, text: 'React basics ඉගෙන ගන්න', completed: false },
    { id: 2, text: 'Assignment 3 submit කරන්න', completed: false }
  ]);
  const [inputText, setInputText] = useState('');

  // Next ID for new todos
  const [nextId, setNextId] = useState(3);

  // Add new todo
  const addTodo = () => {
    // Empty input check
    if (inputText.trim() === '') return;

    const newTodo = {
      id: nextId,
      text: inputText.trim(),
      completed: false
    };

    // Spread operator — existing todos + new todo
    setTodos([...todos, newTodo]);
    setNextId(nextId + 1);
    setInputText(''); // Input clear කරනවා
  };

  // Enter key support
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') addTodo();
  };

  // Toggle complete/incomplete
  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id
        ? { ...todo, completed: !todo.completed }
        : todo
    ));
  };

  // Delete todo
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // Clear all completed
  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  // Remaining count
  const remainingCount = todos.filter(todo => !todo.completed).length;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700
                      shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-teal-400 text-center mb-6">
          📝 Todo List
        </h2>

        {/* Input Section */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="New todo එකක් add කරන්න..."
            className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-xl
                       border border-slate-600 focus:border-teal-500
                       focus:outline-none transition"
          />
          <button onClick={addTodo}
                  className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2
                             rounded-xl font-bold transition">
            +
          </button>
        </div>

        {/* Todo List */}
        <div className="space-y-2 mb-4">
          {todos.length === 0 ? (
            // Empty state
            <div className="text-center py-8">
              <p className="text-slate-500 text-lg">🎉 All done!</p>
              <p className="text-slate-600 text-sm">Todo items නැහැ</p>
            </div>
          ) : (
            // Todo items render — .map() use කරනවා
            todos.map(todo => (
              <div key={todo.id}
                   className={`flex items-center gap-3 p-3 rounded-xl border
                              transition duration-200
                              ${todo.completed
                                ? 'bg-slate-700/50 border-slate-600'
                                : 'bg-slate-700 border-slate-600 hover:border-teal-500/30'
                              }`}>
                {/* Checkbox */}
                <button onClick={() => toggleTodo(todo.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center
                                   justify-center transition text-xs
                                   ${todo.completed
                                     ? 'bg-teal-500 border-teal-500 text-white'
                                     : 'border-slate-500 hover:border-teal-400'
                                   }`}>
                  {todo.completed && '✓'}
                </button>

                {/* Todo text — completed = strikethrough */}
                <span className={`flex-1 transition ${
                  todo.completed
                    ? 'line-through text-slate-500'
                    : 'text-white'
                }`}>
                  {todo.text}
                </span>

                {/* Delete button */}
                <button onClick={() => deleteTodo(todo.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10
                                   w-8 h-8 rounded-lg flex items-center justify-center
                                   transition text-sm">
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer — remaining count + clear */}
        {todos.length > 0 && (
          <div className="flex items-center justify-between pt-4
                          border-t border-slate-700">
            <span className="text-slate-400 text-sm">
              {remainingCount} item{remainingCount !== 1 ? 's' : ''} remaining
            </span>
            <button onClick={clearCompleted}
                    className="text-slate-500 hover:text-red-400 text-sm transition">
              Clear Completed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TodoApp />);