// Simple To-Do app with localStorage, edit, delete, complete, filter, import/export
const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');
const countEl = document.getElementById('count');
const filters = document.querySelectorAll('.filter');
const clearCompleted = document.getElementById('clearCompleted');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');

let todos = JSON.parse(localStorage.getItem('todos_v1') || '[]');
let filter = 'all';

function save(){ localStorage.setItem('todos_v1', JSON.stringify(todos)); render(); }

function addTodo(text){
  const t = {id:Date.now(), text: text.trim(), completed:false};
  todos.unshift(t); save();
}

function updateTodo(id, updates){
  todos = todos.map(t => t.id === id ? {...t, ...updates} : t); save();
}

function removeTodo(id){
  todos = todos.filter(t => t.id !== id); save();
}

function clearCompletedTodos(){
  todos = todos.filter(t => !t.completed); save();
}

function setFilter(f){
  filter = f;
  filters.forEach(b => b.classList.toggle('active', b.dataset.filter === f));
  render();
}

function render(){
  todoList.innerHTML = '';
  const visible = todos.filter(t => filter === 'all' ? true : filter === 'active' ? !t.completed : t.completed);
  visible.forEach(t => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (t.completed ? ' completed' : '');
    li.innerHTML = `
      <input type="checkbox" ${t.completed ? 'checked' : ''} class="toggle" />
      <div class="title" contenteditable="false">${escapeHtml(t.text)}</div>
      <div class="btns">
        <button class="edit">✏️</button>
        <button class="delete">🗑️</button>
      </div>
    `;
    // events
    li.querySelector('.toggle').addEventListener('change', ()=> updateTodo(t.id, {completed: !t.completed}));
    const titleEl = li.querySelector('.title');
    const editBtn = li.querySelector('.edit');
    const deleteBtn = li.querySelector('.delete');

    editBtn.addEventListener('click', ()=> {
      if(titleEl.isContentEditable){
        titleEl.contentEditable = 'false';
        titleEl.blur();
        updateTodo(t.id, {text: titleEl.textContent.trim()});
        editBtn.textContent = '✏️';
      } else {
        titleEl.contentEditable = 'true';
        titleEl.focus();
        editBtn.textContent = '✅';
      }
    });

    deleteBtn.addEventListener('click', ()=> removeTodo(t.id));

    todoList.appendChild(li);
  });
  countEl.textContent = todos.length;
}

function escapeHtml(s){ return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

// form submit
todoForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const v = todoInput.value.trim();
  if(!v) return;
  addTodo(v);
  todoInput.value = '';
});

// filters
filters.forEach(b => b.addEventListener('click', ()=> setFilter(b.dataset.filter)));
setFilter('all');

// clear completed
clearCompleted.addEventListener('click', ()=> {
  clearCompletedTodos();
});

// export
exportBtn.addEventListener('click', ()=> {
  const blob = new Blob([JSON.stringify(todos, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'todos.json';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
});

// import
importBtn.addEventListener('click', ()=> importFile.click());
importFile.addEventListener('change', (e)=> {
  const f = e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const data = JSON.parse(reader.result);
      if(Array.isArray(data)) { todos = data; save(); alert('Imported successfully'); }
      else alert('Invalid file format');
    }catch(err){ alert('Could not parse file'); }
  };
  reader.readAsText(f);
});

// init render
render();
