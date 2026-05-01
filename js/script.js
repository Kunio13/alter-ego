const body = document.querySelector('body');
const searchToggleBtn = document.querySelector('[data-search-toggle]');
const searchToggleContainer = document.querySelector('[data-search-container]');
const searchInput = document.querySelector('[data-search-input]');
const searchResults = document.querySelector('[data-search-results]');
const themeToggleBtn = document.querySelector('[data-theme-toggle]');
const menuToggleBtn = document.querySelector('[data-burger-btn]');
const menuToggleContainer = document.querySelector('[data-menu-sidebar]');
const menuCloseBtn = document.querySelector('[data-close-menu]');
const decreaseFont = document.querySelector('[data-decrease-font]');
const resetFont = document.querySelector('[data-reset-font]');
const increaseFont = document.querySelector('[data-increase-font]');
const text = document.querySelectorAll('.text__desc');
const textDate = document.querySelectorAll('.text__date');
const lineHeightControl = document.querySelector('[data-line-height-control]');
const textContent = document.querySelector('[data-text-content]');
const searchResultsList = document.querySelector('[data-results-list]');
const searchCloseBtn = document.querySelector('[data-search-close-btn]');

// Устанавливает текущий год в элемент data-current-year
let currentYear = document.querySelector('[data-current-year]');
if (currentYear) {
	let date = new Date();
	currentYear.textContent = date.getFullYear();
}

// Начальные значения
const FONT_MIN = 14;
const FONT_MAX = 24;
const FONT_DEFAULT = 18;
const LINE_HEIGHT_DEFAULT = 1.5;

let fontSize = FONT_DEFAULT;
let lineHeight = LINE_HEIGHT_DEFAULT;

// menuToggle
const menuToggle = (() => {
	if (menuToggleBtn) {
		menuToggleBtn.addEventListener('click', () => {
			menuToggleContainer.classList.toggle('open');
			menuToggleBtn.classList.toggle('active');
		});
	}
})();

const menuClose = (() => {
	if (menuCloseBtn) {
		menuCloseBtn.addEventListener('click', () => {
			menuToggleContainer.classList.remove('open');
			menuToggleBtn.classList.remove('active');
		});
	}
})();

// searchToggle
const searchToggle = (() => {
	if (searchToggleBtn) {
		searchToggleBtn.addEventListener('click', () => {
			searchToggleContainer.classList.toggle('open');
			searchToggleBtn.classList.toggle('active');
			if (searchToggleContainer.classList.contains('open')) {
				searchInput.focus();
			}
			if (!searchToggleContainer.classList.contains('open')) {
				searchInput.value = '';
				searchResultsList.innerHTML = '';
			}
		});
	}
})();

// themeToggle + Сохранение темы при изменении
const themeToggle = (() => {
	if (themeToggleBtn) {
		themeToggleBtn.addEventListener('click', () => {
			body.classList.toggle('dark');
			themeToggleBtn.classList.toggle('active');

			if (body.classList.contains('dark')) {
				localStorage.setItem('theme', 'dark');
			} else {
				localStorage.setItem('theme', 'light');
			}
		});
	}
})();

if (searchInput && textContent && searchResultsList) {
	searchInput.addEventListener('input', function () {
		const query = this.value.trim().toLowerCase();
		searchResultsList.innerHTML = '';

		if (query.length < 3) {
			searchResultsList.classList.add('hidden');
			return;
		}

		const paragraphs = textContent.querySelectorAll('p.text__desc');
		const results = [];

		paragraphs.forEach(p => {
			const paragraphText = p.innerText.toLowerCase();
			if (paragraphText.includes(query)) {
				let title = '';
				const chapterItem = p.closest('.text__chapter-item');
				if (chapterItem) {
					const chapterTitle = chapterItem.querySelector('.text__chapter-title');
					title = chapterTitle ? chapterTitle.innerText.trim() : 'Глава без названия';
				} else {
					// Если не в главе — используем общий заголовок секции
					title = document.querySelector('.text__title')?.innerText.trim() || 'Текст';
				}
				// const sectionTitle = document.querySelector('.text__title')?.innerText.trim() || 'Текст';
				
				let snippet = p.innerText;
				const index = paragraphText.indexOf(query);
				const start = Math.max(0, index - 50);
				const end = Math.min(snippet.length, index + query.length + 50);
				snippet = (start > 0 ? '...' : '') + snippet.substring(start, end) + (end < snippet.length ? '...' : '');
				
				const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
				snippet = snippet.replace(regex, match => `<mark>${match}</mark>`);

				results.push({
					title: title,
					snippet: snippet,
					element: p 
				});
			}
		});

		if (results.length > 0) {
			searchResultsList.classList.remove('hidden');
			results.forEach(result => {
				const li = document.createElement('li');
				li.className = 'search-container__result-item flex-fl_center';
				
				const a = document.createElement('a');
				a.href = '#';
				a.className = 'search-container__result-link flex-fl_column';

				a.addEventListener('click', (evt) => {
					evt.preventDefault();
					result.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
					searchToggleContainer.classList.remove('open');
					searchToggleBtn.classList.remove('active');
					searchInput.value = '';
					searchResultsList.innerHTML = '';
					// searchContainer.classList.add('hidden');
				});

				const h2 = document.createElement('h2');
				h2.className = 'search-container__result-title';
				h2.textContent = result.title;

				const pDesc = document.createElement('p');
				pDesc.className = 'search-container__result-desc';
				pDesc.innerHTML = result.snippet;

				a.appendChild(h2);
				a.appendChild(pDesc);
				li.appendChild(a);
				searchResultsList.appendChild(li);
			});
		} else {
			searchResultsList.classList.add('hidden');
		}
	});
}

if (searchCloseBtn) {
	searchCloseBtn.addEventListener('click', () => {
		searchInput.value = '';
		searchResultsList.innerHTML = '';
		// searchResults.classList.add('hidden');
	});
}

function applyFontSize(size) {
	const elements = [...document.querySelectorAll('.text__desc, .text__date, .text__divider')];
	elements.forEach(el => {
		el.style.fontSize = `${size}px`;
	});
}

function applyLineHeight(value) {
	const elements = [...document.querySelectorAll('.text__desc, .text__date')];
	elements.forEach(el => {
		el.style.lineHeight = value;
	});
}

function saveSetting(key, value) {
   localStorage.setItem(key, value);
}

function getSavedSetting(key, defaultValue, parser = null) {
	const saved = localStorage.getItem(key);
	if (saved === null) return defaultValue;
	return parser ? parser(saved) : saved;
}

// === Инициализация значений при загрузке ===
function initSettings() {
	// Font size: localStorage → dataset → default
	const savedFontSize = getSavedSetting('fontSize', null, parseInt);
	if (savedFontSize !== null) {
		fontSize = savedFontSize;
	} else if (increaseFont?.dataset?.increase) {
		fontSize = parseInt(increaseFont.dataset.increase) || FONT_DEFAULT;
	}
	
	fontSize = Math.max(FONT_MIN, Math.min(FONT_MAX, fontSize));
	applyFontSize(fontSize);
	if (increaseFont) {
		increaseFont.dataset.increase = fontSize.toString();
	}

	// Line height: localStorage → input value → default
	const savedLineHeight = getSavedSetting('lineHeight', null, parseFloat);
	if (savedLineHeight !== null) {
		lineHeight = savedLineHeight;
	} else if (lineHeightControl?.value) {
		lineHeight = parseFloat(lineHeightControl.value) || LINE_HEIGHT_DEFAULT;
	}
	applyLineHeight(lineHeight);
	if (lineHeightControl) {
		lineHeightControl.value = lineHeight;
	}

	// Theme
	const savedTheme = localStorage.getItem('theme');
	if (savedTheme === 'dark') {
		body.classList.add('dark');
		themeToggleBtn?.classList.add('active');
	}
}

// === Обработчики кнопок размера шрифта ===
function changeFontSize(delta) {
	fontSize = Math.max(FONT_MIN, Math.min(FONT_MAX, fontSize + delta));
	applyFontSize(fontSize);
	if (increaseFont) {
		increaseFont.dataset.increase = fontSize.toString();
	}
	saveSetting('fontSize', fontSize);
}

if (decreaseFont) {
   decreaseFont.addEventListener('click', () => changeFontSize(-1));
}

if (resetFont) {
	resetFont.addEventListener('click', () => {
		fontSize = FONT_DEFAULT;
		applyFontSize(fontSize);
		if (increaseFont) {
			increaseFont.dataset.increase = fontSize.toString();
		}
		saveSetting('fontSize', fontSize);
	});
}

if (increaseFont) {
   increaseFont.addEventListener('click', () => changeFontSize(1));
}

// === Обработчик межстрочного интервала ===
if (lineHeightControl) {
	lineHeightControl.addEventListener('input', function () {
		lineHeight = parseFloat(this.value);
		applyLineHeight(lineHeight);
		saveSetting('lineHeight', lineHeight);
	});
}

// === Запуск инициализации ===
initSettings();

let chapterItems = document.querySelectorAll('.text__chapter-item');
if (chapterItems) {
	chapterItems.forEach((el) => {
		const head = el.querySelector('.text__chapter-head');
		head.addEventListener('click', () => {			
			const body = el.querySelector('.text__chapter-body');

			const isActive = head.classList.contains('text__chapter-head--active');
				if (isActive) {
					head.classList.remove('text__chapter-head--active');
					body.classList.remove('text__chapter-body--active');
					head.setAttribute('aria-label', 'Раскрыть главу');
				} else {
					head.classList.add('text__chapter-head--active');
					body.classList.add('text__chapter-body--active');
					head.setAttribute('aria-label', 'Свернуть главу');
				}
		});
	});
}

class UpButton {
	constructor() {
		this.goTop = document.querySelector("[data-button-up]");
		if (this.goTop) {
			this.init();
		}
	}

	trackScroll = () => {
		const scrolled = window.scrollY;
		const coords = document.documentElement.clientHeight;
		const scrollBottom =
		document.documentElement.scrollHeight -
		document.documentElement.scrollTop -
		document.documentElement.clientHeight;

		if (scrolled > coords) {
			this.goTop.classList.add("button-up--show");
		}
		if (scrolled < coords || scrollBottom < 20) {
			this.goTop.classList.remove("button-up--show");
		}
	};

	backToTop = () => {
		if (window.scrollY > 0) {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
		}
	};

	init() {
		window.addEventListener("scroll", this.trackScroll);
		this.goTop.addEventListener("click", this.backToTop);
	}
}

new UpButton();