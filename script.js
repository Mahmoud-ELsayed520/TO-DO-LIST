const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const themeToggle = document.getElementById("themeToggle");
const filters = document.querySelectorAll(".filters button");
const searchInput = document.getElementById("searchInput");
const prioritySelect = document.getElementById("prioritySelect");
const priorityFilter = document.getElementById("priorityFilter");
const errorMsg = document.getElementById("errorMsg");
const addSound = document.getElementById("addSound");
const completeSound = document.getElementById("completeSound");

window.onload = () => {
  const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  savedTasks.forEach(task => addTask(task.text, task.completed, task.priority));
  if(localStorage.getItem("theme")==="dark"){document.body.classList.add("dark"); themeToggle.textContent="☀️";}
  updateStats(); applyFilters();
};

addBtn.addEventListener("click", handleAddTask);
taskInput.addEventListener("keypress", e=>{if(e.key==="Enter") handleAddTask();});

function handleAddTask(){
  const text=taskInput.value.trim();
  if(!text){showError("Please enter a task!"); return;}
  const priority = prioritySelect.value || "medium";
  addTask(text,false,priority); saveTasks(); taskInput.value=""; errorMsg.textContent="";
  updateStats(); applyFilters();
}

function addTask(text,completed=false,priority="medium"){
  const li=document.createElement("li");
  if(completed) li.classList.add("completed");
  li.classList.add(`priority-${priority}`);
  li.innerHTML=`
    <span class="task-text">${escapeHtml(text)}</span>
    <div class="actions">
      <button class="done" title="Toggle done">✓</button>
      <button class="edit" title="Edit">✏️</button>
      <button class="delete" title="Delete">✗</button>
    </div>
  `;
  li.querySelector(".done").addEventListener("click",()=>{
    li.classList.toggle("completed");
    if(li.classList.contains("completed")) completeSound.play();
    saveTasks(); updateStats(); applyFilters();
  });
  li.querySelector(".edit").addEventListener("click",()=>{
    const span=li.querySelector(".task-text"); const oldText=span.textContent;
    const input=document.createElement("input"); input.type="text"; input.value=oldText; input.className="edit-input"; input.style.flex="1";
    li.insertBefore(input,span); span.style.display="none"; input.focus();
    const finishEdit=()=>{const newText=input.value.trim()||oldText; span.textContent=newText; span.style.display="inline"; input.remove(); saveTasks(); updateStats(); applyFilters();}
    input.addEventListener("keyup",e=>{if(e.key==="Enter") finishEdit();});
    input.addEventListener("blur",finishEdit);
  });
  li.querySelector(".delete").addEventListener("click",()=>{
    li.style.opacity="0"; setTimeout(()=>{li.remove(); saveTasks(); updateStats(); applyFilters();},220);
  });

  taskList.appendChild(li);
  li.scrollIntoView({behavior:"smooth",block:"end"});
  li.classList.add("new-task");
  setTimeout(()=>li.classList.remove("new-task"),800);
  addSound.play();
}

function saveTasks(){
  const tasks=[];
  document.querySelectorAll("#taskList li").forEach(li=>{
    const priority = li.classList.contains("priority-high") ? "high"
                    : li.classList.contains("priority-low") ? "low" : "medium";
    tasks.push({text:li.querySelector(".task-text").innerText,completed:li.classList.contains("completed"),priority});
  });
  localStorage.setItem("tasks",JSON.stringify(tasks));
}

themeToggle.addEventListener("click",()=>{
  document.body.classList.toggle("dark");
  if(document.body.classList.contains("dark")){themeToggle.textContent="☀️"; localStorage.setItem("theme","dark");}
  else{themeToggle.textContent="🌙"; localStorage.setItem("theme","light");}
});

filters.forEach(btn=>{btn.addEventListener("click",()=>{
  filters.forEach(b=>b.classList.remove("active")); btn.classList.add("active"); applyFilters();
})});
priorityFilter.addEventListener("change",applyFilters);
searchInput.addEventListener("input",applyFilters);

function applyFilters(){
  const state=document.querySelector(".filters button.active").getAttribute("data-filter");
  const priority=priorityFilter.value; const q=searchInput.value.trim().toLowerCase();
  document.querySelectorAll("#taskList li").forEach(li=>{
    const text=li.querySelector(".task-text").textContent.toLowerCase();
    let okState=true;
    if(state==="active" && li.classList.contains("completed")) okState=false;
    if(state==="completed" && !li.classList.contains("completed")) okState=false;
    let okPriority=true;
    if(priority!=="all") okPriority=li.classList.contains(`priority-${priority}`);
    const okSearch=text.includes(q);
    li.style.display=(okState && okPriority && okSearch) ? "flex":"none";
  });
}

function updateStats(){
  const tasks=document.querySelectorAll("#taskList li");
  const total=tasks.length;
  const completed=document.querySelectorAll("#taskList li.completed").length;
  const active=total-completed;
  document.getElementById("totalCount").textContent=`Total: ${total}`;
  document.getElementById("activeCount").textContent=`Active: ${active}`;
  document.getElementById("completedCount").textContent=`Completed: ${completed}`;
}

function showError(msg){
  errorMsg.textContent=msg;
  setTimeout(()=>{if(errorMsg.textContent===msg) errorMsg.textContent="";},2000);
}

function escapeHtml(unsafe){
  return unsafe.replace(/[&<"'>]/g,function(m){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#039;"}[m]);});
}
