// ─── 상수 ───────────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:8000/api';
const POLL_INTERVAL_MS = 3000;

// ─── 상태 (모듈 변수) ────────────────────────────────────────────────────────
let tasks = [];
let editingTaskId = null;
let deletingTaskId = null;
let pollingTimer = null;

// ─── 상태 배지 설정 ──────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  todo: {
    label: 'Todo',
    classes: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  },
  in_progress: {
    label: 'In Progress',
    classes: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  },
  done: {
    label: 'Done',
    classes: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  },
};

// ─── API 유틸 ────────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (response.status === 204) return null;
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

async function fetchTasks() {
  try {
    tasks = await apiFetch('/tasks');
    renderTasks();
  } catch (e) {
    console.error('목록 조회 실패:', e.message);
  }
}

async function createTask(data) {
  await apiFetch('/tasks', { method: 'POST', body: JSON.stringify(data) });
  await fetchTasks();
}

async function updateTask(id, data) {
  await apiFetch(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  await fetchTasks();
}

async function deleteTask(id) {
  await apiFetch(`/tasks/${id}`, { method: 'DELETE' });
  await fetchTasks();
}

// ─── 날짜 유틸 ───────────────────────────────────────────────────────────────
function formatDueAt(dueAtStr) {
  if (!dueAtStr) return null;
  const due = new Date(dueAtStr);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const absDiffMs = Math.abs(diffMs);

  const totalMinutes = Math.floor(absDiffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const remainMinutes = totalMinutes % (60 * 24);
  const hours = String(Math.floor(remainMinutes / 60)).padStart(2, '0');
  const minutes = String(remainMinutes % 60).padStart(2, '0');

  return diffMs < 0
    ? { text: `D+${days} ${hours}:${minutes}`, overdue: true }
    : { text: `D-${days} ${hours}:${minutes}`, overdue: false };
}

// ISO 문자열 → datetime-local 입력값 (로컬 시간)
function toDatetimeLocal(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

// XSS 방지 이스케이프
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── 렌더링 ──────────────────────────────────────────────────────────────────
function renderTasks() {
  const list = document.getElementById('task-list');
  const empty = document.getElementById('empty-state');

  if (tasks.length === 0) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  list.innerHTML = tasks.map(renderCard).join('');
}

function renderCard(task) {
  const { label, classes } = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
  const due = task.due_at ? formatDueAt(task.due_at) : null;

  const dueHtml = due
    ? `<span class="text-xs font-medium ${due.overdue ? 'text-red-500' : 'text-blue-500 dark:text-blue-400'}">
        ⏰ ${due.text}
       </span>`
    : '';

  return `
    <div class="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-4 hover:shadow-xl transition-shadow flex flex-col gap-2">
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs font-medium px-2.5 py-1 rounded-lg ${classes} shrink-0">${label}</span>
        <div class="flex gap-0.5 ml-auto">
          <button
            onclick="openEditModal(${task.id})"
            class="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-blue-500"
            aria-label="수정"
          >✏️</button>
          <button
            onclick="openDeleteDialog(${task.id})"
            class="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-red-500"
            aria-label="삭제"
          >🗑️</button>
        </div>
      </div>
      <p
        class="text-sm font-medium text-gray-900 dark:text-white leading-snug cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        onclick="openEditModal(${task.id})"
      >${escapeHtml(task.title)}</p>
      ${dueHtml}
    </div>
  `;
}

// ─── 수정 모달 (3-04) ────────────────────────────────────────────────────────
function openEditModal(taskId) {
  // 단건 조회로 description 포함 전체 데이터 가져오기
  apiFetch(`/tasks/${taskId}`)
    .then((detail) => {
      editingTaskId = taskId;
      document.getElementById('edit-title').value = detail.title;
      document.getElementById('edit-description').value = detail.description || '';
      document.getElementById('edit-due-at').value = toDatetimeLocal(detail.due_at);
      document.getElementById('edit-status').value = detail.status;
      document.getElementById('edit-modal').classList.remove('hidden');
    })
    .catch((e) => console.error('단건 조회 실패:', e.message));
}

function closeEditModal() {
  editingTaskId = null;
  document.getElementById('edit-modal').classList.add('hidden');
}

// ─── 삭제 다이얼로그 (3-05) ──────────────────────────────────────────────────
function openDeleteDialog(taskId) {
  deletingTaskId = taskId;
  document.getElementById('delete-dialog').classList.remove('hidden');
}

function closeDeleteDialog() {
  deletingTaskId = null;
  document.getElementById('delete-dialog').classList.add('hidden');
}

// ─── 테마 토글 (3-06) ────────────────────────────────────────────────────────
function initTheme() {
  // 1순위: localStorage, 2순위: 시스템 prefers-color-scheme
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = saved ? saved === 'dark' : prefersDark;
  applyTheme(isDark);
}

function applyTheme(isDark) {
  document.documentElement.classList.toggle('dark', isDark);
  document.getElementById('theme-icon').textContent = isDark ? '☀️' : '🌙';
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  document.getElementById('theme-icon').textContent = isDark ? '☀️' : '🌙';
}

// ─── 이벤트 바인딩 (3-07) ────────────────────────────────────────────────────
function bindEvents() {
  // 태스크 추가
  document.getElementById('add-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('new-title').value.trim();
    const dueAt = document.getElementById('new-due-at').value;
    const status = document.getElementById('new-status').value;
    if (!title) return;

    try {
      await createTask({
        title,
        status,
        due_at: dueAt ? new Date(dueAt).toISOString() : null,
      });
      document.getElementById('new-title').value = '';
      document.getElementById('new-due-at').value = '';
      document.getElementById('new-status').value = 'todo';
    } catch (e) {
      alert(`추가 실패: ${e.message}`);
    }
  });

  // 수정 저장
  document.getElementById('edit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!editingTaskId) return;
    const dueAt = document.getElementById('edit-due-at').value;

    try {
      await updateTask(editingTaskId, {
        title: document.getElementById('edit-title').value.trim(),
        description: document.getElementById('edit-description').value || null,
        status: document.getElementById('edit-status').value,
        due_at: dueAt ? new Date(dueAt).toISOString() : null,
      });
      closeEditModal();
    } catch (e) {
      alert(`수정 실패: ${e.message}`);
    }
  });

  // 모달 닫기
  document.getElementById('cancel-edit').addEventListener('click', closeEditModal);
  document.getElementById('modal-backdrop').addEventListener('click', closeEditModal);

  // 삭제 확인
  document.getElementById('confirm-delete').addEventListener('click', async () => {
    if (!deletingTaskId) return;
    try {
      await deleteTask(deletingTaskId);
      closeDeleteDialog();
    } catch (e) {
      alert(`삭제 실패: ${e.message}`);
    }
  });
  document.getElementById('cancel-delete').addEventListener('click', closeDeleteDialog);
  document.getElementById('delete-backdrop').addEventListener('click', closeDeleteDialog);

  // 테마 토글
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  // ESC 키로 모달/다이얼로그 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeEditModal();
      closeDeleteDialog();
    }
  });
}

// ─── 3초 폴링 ────────────────────────────────────────────────────────────────
function startPolling() {
  pollingTimer = setInterval(fetchTasks, POLL_INTERVAL_MS);
}

// ─── 초기화 ──────────────────────────────────────────────────────────────────
async function init() {
  initTheme();
  bindEvents();
  await fetchTasks();
  startPolling();
}

init();
