let num1, num2, currentOp = '+', maxRange = 10;
let totalCount = 0, correctCount = 0;
let isSolved = false;
let wrongAnswers = new Set();
let comboCount = 0;
let errorBook = []; 

const dingSound = new Audio('ding.mp3'); 
const praises = ["Good!", "Great Job!", "Amazing!", "Unstoppable!"];
const ranks = ["Rookie", "Explorer", "Hero", "Master"];
const rankThresholds = [0, 10, 50, 100];

function saveData() {
    const data = { totalCount, correctCount, errorBook };
    localStorage.setItem('mathMasterData', JSON.stringify(data));
}

function loadData() {
    const saved = localStorage.getItem('mathMasterData');
    if (saved) {
        const data = JSON.parse(saved);
        totalCount = data.totalCount || 0;
        correctCount = data.correctCount || 0;
        errorBook = data.errorBook || [];
        updateStats();
        updateErrorListUI();
    }
}

function triggerRandomConfetti() {
    if (typeof confetti === 'undefined') return;
    const modes = [
        () => confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } }),
        () => confetti({ particleCount: 100, angle: 90, spread: 360, origin: { x: Math.random(), y: Math.random() * 0.5 } }),
        () => {
            var end = Date.now() + (1 * 1000);
            (function frame() {
                confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } });
                confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } });
                if (Date.now() < end) requestAnimationFrame(frame);
            }());
        }
    ];
    modes[Math.floor(Math.random() * modes.length)]();
}

function showPraise(text) {
    const popup = document.createElement('div');
    popup.innerText = text;
    popup.className = 'praise-popup';
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 1200);
}

function generateQuestion() {
    isSolved = false;
    wrongAnswers.clear();
    const btns = document.querySelectorAll('.ans-btn');
    btns.forEach(b => {
        b.className = 'ans-btn';
        b.disabled = false;
    });
    document.body.classList.remove('flash-green', 'flash-red');
    document.getElementById('question-text').classList.remove('shake');

    let correctAnswer;
    if (currentOp === '+') {
        const res = Math.floor(Math.random() * (maxRange - 1)) + 2;
        num1 = Math.floor(Math.random() * (res - 1)) + 1;
        num2 = res - num1;
        correctAnswer = num1 + num2;
    } else if (currentOp === '-') {
        num1 = Math.floor(Math.random() * maxRange) + 1;
        num2 = Math.floor(Math.random() * num1) + 1;
        correctAnswer = num1 - num2;
    } else if (currentOp === '×') {
        num1 = Math.floor(Math.random() * (Math.sqrt(maxRange))) + 1;
        num2 = Math.floor(Math.random() * (maxRange / num1)) + 1;
        correctAnswer = num1 * num2;
    } else {
        num2 = Math.floor(Math.random() * (maxRange / 2 - 1)) + 2;
        const res = Math.floor(Math.random() * (maxRange / num2)) + 1;
        num1 = res * num2;
        correctAnswer = num1 / num2;
    }

    document.getElementById('question-text').innerText = `${num1} ${currentOp} ${num2} =`;

    let opts = new Set([correctAnswer]);
    while(opts.size < 4) {
        let randomOption = Math.floor(Math.random() * (maxRange * 1.5));
        if (randomOption !== correctAnswer) opts.add(randomOption);
    }
    let shuffledOpts = Array.from(opts).sort(() => Math.random() - 0.5);

    btns.forEach((btn, i) => {
        btn.innerText = shuffledOpts[i];
        btn.onclick = () => checkAnswer(shuffledOpts[i], btn, correctAnswer);
    });
}

function checkAnswer(val, btn, correct) {
    if (isSolved || wrongAnswers.has(val)) return;
    const isFirstAttempt = wrongAnswers.size === 0;

    if (val === correct) {
        isSolved = true;
        btn.classList.add('correct');
        document.body.classList.add('flash-green');
        
        triggerRandomConfetti();

        comboCount++;
        if (comboCount >= 2 && comboCount <= 4) showPraise(praises[0]);
        else if (comboCount >= 5 && comboCount <= 7) showPraise(praises[1]);
        else if (comboCount >= 8 && comboCount <= 10) showPraise(praises[2]);
        else if (comboCount > 10) showPraise(praises[3]);

        if (isFirstAttempt) {
            correctCount++;
            totalCount++;
            saveData();
        }
        updateStats();
        dingSound.currentTime = 0;
        dingSound.play().catch(e => {});

    } else {
        if (isFirstAttempt) {
            totalCount++;
            const now = new Date();
            const dateStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            errorBook.unshift({
                date: dateStr,
                formula: `${num1} ${currentOp} ${num2}`,
                correct: correct
            });
            updateErrorListUI();
            saveData();
        }
        wrongAnswers.add(val);
        btn.classList.add('wrong');
        document.body.classList.add('flash-red');
        document.getElementById('question-text').classList.add('shake');
        comboCount = 0;
        updateStats();
    }
}

function updateErrorListUI() {
    const listContainer = document.getElementById('error-list');
    const noErrorMsg = document.getElementById('no-errors');
    
    if (errorBook.length > 0) noErrorMsg.style.display = 'none';
    else noErrorMsg.style.display = 'block';
    
    const items = document.querySelectorAll('.error-item');
    items.forEach(el => el.remove());

    errorBook.forEach(item => {
        const div = document.createElement('div');
        div.className = 'error-item';
        div.innerHTML = `
            <div class="error-content">
                <span class="error-date">${item.date}</span>
                <span class="error-formula">${item.formula} = ?</span>
            </div>
            <span class="error-answer">Ans: ${item.correct}</span>
        `;
        listContainer.appendChild(div);
    });
}

function updateStats() {
    document.getElementById('total-count').innerText = `${totalCount}`;
    
    const rate = totalCount === 0 ? 0 : Math.round((correctCount / totalCount) * 100);
    const accuracyEl = document.getElementById('accuracy');
    if (accuracyEl) accuracyEl.innerText = `${rate}%`;

    let currentRank = ranks[0];
    for (let i = 0; i < rankThresholds.length; i++) {
        if (totalCount >= rankThresholds[i]) currentRank = ranks[i];
    }
    document.getElementById('player-rank').innerText = currentRank;
}

// 按钮逻辑
document.getElementById('review-btn').onclick = () => {
    document.getElementById('review-page').classList.remove('hidden');
};
document.getElementById('back-btn').onclick = () => {
    document.getElementById('review-page').classList.add('hidden');
};

// Clear Mistakes (仅清空错题)
document.getElementById('clear-btn').onclick = () => {
    if(confirm("Clear all mistakes history?")) {
        errorBook = [];
        updateErrorListUI();
        saveData();
    }
};

// Reset Stats (仅重置主页面统计)
document.getElementById('reset-btn').onclick = () => {
    if(confirm("Reset all game stats (Count, Rank, Accuracy)?")) {
        totalCount = 0;
        correctCount = 0;
        comboCount = 0;
        updateStats(); // 更新界面
        saveData(); // 保存归零后的状态
    }
};

document.querySelectorAll('.op-btn').forEach(b => {
    b.onclick = () => {
        document.querySelector('.op-btn.active').classList.remove('active');
        b.classList.add('active');
        currentOp = b.dataset.op;
        generateQuestion();
    };
});

document.getElementById('next-btn').onclick = generateQuestion;
document.getElementById('range-select').onchange = (e) => {
    maxRange = parseInt(e.target.value);
    generateQuestion();
};

loadData();
generateQuestion();