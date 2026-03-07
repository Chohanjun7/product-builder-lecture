
class LottoBall extends HTMLElement {
    static get observedAttributes() {
        return ['number', 'color'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && this.shadowRoot) {
            this.render();
        }
    }

    render() {
        const number = this.getAttribute('number') || '';
        const color = this.getAttribute('color') || '#333';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                }
                .ball {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 1.5rem;
                    font-weight: bold;
                    /* 호스트에서 설정한 --ball-text-color를 사용하고, 없으면 흰색(#ffffff) 사용 */
                    color: var(--ball-text-color, #ffffff);
                    background-color: ${color};
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.2);
                    animation: appear 0.5s ease-out forwards;
                    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
                }

                @keyframes appear {
                    from {
                        transform: scale(0);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            </style>
            <div class="ball">${number}</div>
        `;
    }
}

customElements.define('lotto-ball', LottoBall);

const generateBtn = document.getElementById('generate-btn');
const lottoNumbersContainer = document.getElementById('lotto-numbers');

function generateLottoNumbers() {
    lottoNumbersContainer.innerHTML = '';
    const numbers = new Set();
    while (numbers.size < 6) {
        const randomNumber = Math.floor(Math.random() * 45) + 1;
        numbers.add(randomNumber);
    }

    const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);

    sortedNumbers.forEach((number, index) => {
        setTimeout(() => {
            const lottoBall = document.createElement('lotto-ball');
            const bgColor = getBallColor(number);
            
            // 번호와 색상 속성 설정
            lottoBall.setAttribute('number', number);
            lottoBall.setAttribute('color', bgColor);
            
            // 노란색 공(21-30번)은 검은색 글자, 나머지는 흰색 글자로 설정
            if (number > 20 && number <= 30) {
                lottoBall.style.setProperty('--ball-text-color', '#000000');
            } else {
                lottoBall.style.setProperty('--ball-text-color', '#ffffff');
            }
            
            lottoNumbersContainer.appendChild(lottoBall);
        }, index * 200);
    });
}

function getBallColor(number) {
    if (number <= 10) return '#f44336'; // Red
    if (number <= 20) return '#ff9800'; // Orange
    if (number <= 30) return '#ffeb3b'; // Yellow
    if (number <= 40) return '#4caf50'; // Green
    return '#2196f3'; // Blue
}

generateBtn.addEventListener('click', generateLottoNumbers);

// Initial generation
generateLottoNumbers();
