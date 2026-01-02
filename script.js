const dingSound = new Audio('ding.mp3');
let num1, num2, currentOp = '+', maxRange = 10;
let totalCount = 0, correctCount = 0;
let isSolved = false;
let wrongAnswers = new Set();

// 随机特效生成
function triggerRandomConfetti() {
    const modes = [
        () => confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } }), // 经典
        () => confetti({ particleCount: 100, angle: 90, spread: 360, origin: { x: Math.random(), y: Math.random() * 0.5 } }), // 随机位置爆炸
        () => { // 喷泉
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

function generateQuestion() {
    isSolved = false;
    wrongAnswers.clear();
    const btns = document.querySelectorAll('.ans-btn');
    btns.forEach(b => {
        b.className = 'ans-btn';
        b.disabled = false;
    });

    // 逻辑迁移
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
        // 简化乘法逻辑
        num1 = Math.floor(Math.random() * (Math.sqrt(maxRange))) + 1;
        num2 = Math.floor(Math.random() * (maxRange / num1)) + 1;
        correctAnswer = num1 * num2;
    } else {
        num2 = Math.floor(Math.random() * (maxRange / 2)) + 1;
        const res = Math.floor(Math.random() * (maxRange / num2)) + 1;
        num1 = res * num2;
        correctAnswer = num1 / num2;
    }

    document.getElementById('question-text').innerText = `${num1} ${currentOp} ${num2} =`;

    // 生成选项
    let opts = new Set([correctAnswer]);
    while(opts.size < 4) opts.add(Math.floor(Math.random() * (maxRange * 1.2)));
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
        // --- 添加这一行播放声音 ---
        dingSound.play().catch(e => console.log("音频播放失败，请先点击页面任意位置"));
        if (isFirstAttempt) {
            correctCount++;
            totalCount++;
        }
        updateStats();
        triggerRandomConfetti();
        if (navigator.vibrate) navigator.vibrate(200); // 震动
    } else {
        if (isFirstAttempt) totalCount++;
        wrongAnswers.add(val);
        btn.classList.add('wrong');
        updateStats();
    }
}

function updateStats() {
    document.getElementById('total-count').innerText = `${totalCount} Qs`;
    const rate = totalCount === 0 ? 0 : Math.round((correctCount / totalCount) * 100);
    document.getElementById('accuracy').innerText = `${rate}%`;
}

// 初始化事件
document.querySelectorAll('.op-btn').forEach(b => {
    b.onclick = (e) => {
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

// 启动
generateQuestion();