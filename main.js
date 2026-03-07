// --- Global State & Config ---
const URL = "https://teachablemachine.withgoogle.com/models/tM5NC3zbJ/";
let model, maxPredictions;

// --- DOM Elements ---
const lottoView = document.getElementById('lotto-view');
const animalView = document.getElementById('animal-view');
const navBtn = document.getElementById('nav-btn');
const backBtn = document.getElementById('back-to-lotto');
const themeBtn = document.getElementById('theme-btn');

// Lotto Elements
const generateBtn = document.getElementById('generate-btn');
const lottoNumbersContainer = document.getElementById('lotto-numbers');

// Animal Test Elements
const imageInput = document.getElementById('image-input');
const uploadBox = document.getElementById('upload-box');
const previewContainer = document.getElementById('preview-container');
const imagePreview = document.getElementById('image-preview');
const removeBtn = document.getElementById('remove-btn');
const loading = document.getElementById('loading');
const resultContainer = document.getElementById('result-container');
const labelContainerDiv = document.getElementById('label-container');
const resultMessage = document.getElementById('result-message');

// --- Navigation & Theme ---
navBtn.addEventListener('click', () => {
    lottoView.style.display = 'none';
    animalView.style.display = 'block';
    navBtn.style.display = 'none';
});

backBtn.addEventListener('click', () => {
    animalView.style.display = 'none';
    lottoView.style.display = 'block';
    navBtn.style.display = 'block';
});

let currentTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', currentTheme);
updateThemeButton();

themeBtn.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeButton();
});

function updateThemeButton() {
    themeBtn.textContent = currentTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
}

// --- Lotto Logic ---
function generateLottoNumbers() {
    lottoNumbersContainer.innerHTML = '';
    const numbers = new Set();
    while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);

    sortedNumbers.forEach((num, i) => {
        setTimeout(() => {
            const ball = document.createElement('div');
            ball.className = 'ball';
            ball.style.cssText = `
                width: 50px; height: 50px; border-radius: 50%; display: inline-flex;
                justify-content: center; align-items: center; margin: 5px;
                font-weight: bold; color: white; background: ${getBallColor(num)};
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            `;
            ball.innerText = num;
            lottoNumbersContainer.appendChild(ball);
        }, i * 150);
    });
}

function getBallColor(n) {
    if (n <= 10) return '#f44336';
    if (n <= 20) return '#ff9800';
    if (n <= 30) return '#ffeb3b';
    if (n <= 40) return '#4caf50';
    return '#2196f3';
}

generateBtn.addEventListener('click', generateLottoNumbers);

// --- Animal Test Logic ---
async function initModel() {
    if (model) return;
    try {
        model = await tmImage.load(URL + "model.json", URL + "metadata.json");
        maxPredictions = model.getTotalClasses();
    } catch (e) { console.error("Model load failed", e); }
}

uploadBox.addEventListener('click', () => imageInput.click());

imageInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleImage(e.target.files[0]);
});

async function handleImage(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        imagePreview.src = e.target.result;
        uploadBox.style.display = 'none';
        previewContainer.style.display = 'block';
        await predict();
    };
    reader.readAsDataURL(file);
}

async function predict() {
    await initModel();
    loading.style.display = 'block';
    resultContainer.style.display = 'none';

    await new Promise(resolve => {
        if (imagePreview.complete) resolve();
        else imagePreview.onload = resolve;
    });

    const prediction = await model.predict(imagePreview);
    prediction.sort((a, b) => b.probability - a.probability);
    renderResults(prediction);
}

function renderResults(predictions) {
    loading.style.display = 'none';
    resultContainer.style.display = 'block';
    labelContainerDiv.innerHTML = '';

    const labelMapping = {
        "Class 1": "강아지", "Class 2": "고양이",
        "클래스 1": "강아지", "클래스 2": "고양이",
        "클래스1": "강아지", "클래스2": "고양이"
    };

    const mapped = predictions.map(p => ({
        ...p, className: labelMapping[p.className] || p.className
    }));

    const top = mapped[0];
    resultMessage.innerText = top.className.includes("강아지") ? "당신은 귀여운 강아지상! 🐶" : 
                             top.className.includes("고양이") ? "당신은 도도한 고양이상! 🐱" : 
                             `당신은 ${top.className}상!`;

    mapped.forEach(p => {
        const prob = (p.probability * 100).toFixed(1);
        labelContainerDiv.innerHTML += `
            <div class="result-bar">
                <span style="font-size: 0.9rem; font-weight: bold;">${p.className}</span>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${prob}%">
                        <span class="percent-text">${prob}%</span>
                    </div>
                </div>
            </div>
        `;
    });
}

removeBtn.addEventListener('click', () => {
    imageInput.value = '';
    uploadBox.style.display = 'block';
    previewContainer.style.display = 'none';
    resultContainer.style.display = 'none';
});

// Initial
generateLottoNumbers();
