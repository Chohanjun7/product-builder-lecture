// Teachable Machine Model URL
const URL = "https://teachablemachine.withgoogle.com/models/tM5NC3zbJ/";

let model, labelContainer, maxPredictions;

// Load the image model
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    try {
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        console.log("Model loaded successfully");
    } catch (e) {
        console.error("Failed to load model", e);
    }
}

// DOM Elements
const imageInput = document.getElementById('image-input');
const uploadBox = document.getElementById('upload-box');
const previewContainer = document.getElementById('preview-container');
const imagePreview = document.getElementById('image-preview');
const removeBtn = document.getElementById('remove-btn');
const loading = document.getElementById('loading');
const resultContainer = document.getElementById('result-container');
const labelContainerDiv = document.getElementById('label-container');
const resultMessage = document.getElementById('result-message');

// Event Listeners
uploadBox.addEventListener('click', () => imageInput.click());

uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = 'var(--primary-color)';
    uploadBox.style.backgroundColor = '#f1f0ff';
});

uploadBox.addEventListener('dragleave', () => {
    uploadBox.style.borderColor = 'var(--accent-color)';
    uploadBox.style.backgroundColor = '#fdfdff';
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleImage(files[0]);
    }
});

imageInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleImage(e.target.files[0]);
    }
});

removeBtn.addEventListener('click', () => {
    resetUI();
});

async function handleImage(file) {
    if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        imagePreview.src = e.target.result;
        uploadBox.style.display = 'none';
        previewContainer.style.display = 'block';
        
        // Start prediction
        await predict();
    };
    reader.readAsDataURL(file);
}

async function predict() {
    if (!model) {
        await init();
    }

    loading.style.display = 'block';
    resultContainer.style.display = 'none';

    // Wait for image to load to ensure it's ready for prediction
    await new Promise(resolve => {
        if (imagePreview.complete) resolve();
        else imagePreview.onload = resolve;
    });

    const prediction = await model.predict(imagePreview);
    
    // Sort predictions by probability
    prediction.sort((a, b) => b.probability - a.probability);

    renderResults(prediction);
}

function renderResults(predictions) {
    loading.style.display = 'none';
    resultContainer.style.display = 'block';
    labelContainerDiv.innerHTML = '';

    // Label mapping (Class 1 -> 강아지, Class 2 -> 고양이)
    const labelMapping = {
        "Class 1": "강아지",
        "Class 2": "고양이",
        "클래스 1": "강아지",
        "클래스 2": "고양이",
        "클래스1": "강아지",
        "클래스2": "고양이"
    };

    // Apply mapping to predictions
    const mappedPredictions = predictions.map(p => ({
        ...p,
        className: labelMapping[p.className] || p.className
    }));

    const topResult = mappedPredictions[0];
    let message = "";
    
    if (topResult.className.includes("강아지")) {
        message = "당신은 귀여운 강아지상! 🐶";
    } else if (topResult.className.includes("고양이")) {
        message = "당신은 도도한 고양이상! 🐱";
    } else {
        message = `당신은 ${topResult.className}상!`;
    }
    
    resultMessage.innerText = message;

    mappedPredictions.forEach(p => {
        const prob = (p.probability * 100).toFixed(1);
        const resultBar = `
            <div class="result-bar-container">
                <span class="label-text">${p.className}</span>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${prob}%">
                        <span class="percent-text">${prob}%</span>
                    </div>
                </div>
            </div>
        `;
        labelContainerDiv.innerHTML += resultBar;
    });
}

function resetUI() {
    imageInput.value = '';
    imagePreview.src = '';
    uploadBox.style.display = 'block';
    previewContainer.style.display = 'none';
    resultContainer.style.display = 'none';
    loading.style.display = 'none';
    uploadBox.style.borderColor = 'var(--accent-color)';
    uploadBox.style.backgroundColor = '#fdfdff';
}

// Initialize model on load
init();
