let num1, num2, currentOp = '+', maxRange = 10;
let totalCount = 0, correctCount = 0;
let isSolved = false;
let wrongAnswers = new Set();
let comboCount = 0; // 新增：连击计数

// 声音对象（确保你的 ding.mp3 在同一文件夹）
const dingSound = new Audio('ding.mp3'); 
const buzzSound = new Audio('buzz.mp3'); // 假设有答错音效

// 夸奖语和连击提示
const praises = ["Good!", "Great Job!", "Amazing!", "Unstoppable!"];
const ranks = ["Rookie", "Explorer", "Hero", "Master"];
const rankThresholds = [0, 10, 50, 100]; // 对应等级的总题数门槛

// 触发随机烟花特效
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

// 显示夸奖语
function showPraise(text) {
    const popup = document.createElement('div');
    popup.innerText = text;
    popup.className = 'praise-popup';
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 1200); // 1.2秒后消失
}

// 生成题目
function generateQuestion() {
    isSolved = false;
    wrongAnswers.clear();
    const btns = document.querySelectorAll('.ans-btn');
    btns.forEach(b => {
        b.className = 'ans-btn'; // 清除所有状态类
        b.disabled = false;
    });
    document.body.classList.remove('flash-green', 'flash-red'); // 清除闪烁
    document.getElementById('question-text').classList.remove('shake'); // 清除晃动

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
    } else { // ÷
        num2 = Math.floor(Math.random() * (maxRange / 2 - 1)) + 2; // 确保除数不为0或1，防止简单题目
        const res = Math.floor(Math.random() * (maxRange / num2)) + 1;
        num1 = res * num2;
        correctAnswer = num1 / num2;
    }

    document.getElementById('question-text').innerText = `${num1} ${currentOp} ${num2} =`;

    let opts = new Set([correctAnswer]);
    while(opts.size < 4) {
        let randomOption = Math.floor(Math.random() * (maxRange * 1.5)) + (currentOp === '÷' ? 0 : 0); // 确保除法选项不是负数
        if (randomOption !== correctAnswer) opts.add(randomOption);
    }
    let shuffledOpts = Array.from(opts).sort(() => Math.random() - 0.5);

    btns.forEach((btn, i) => {
        btn.innerText = shuffledOpts[i];
        btn.onclick = () => checkAnswer(shuffledOpts[i], btn, correctAnswer);
    });
}

// 检查答案
function checkAnswer(val, btn, correct) {
    if (isSolved || wrongAnswers.has(val)) return;

    const isFirstAttempt = wrongAnswers.size === 0;

    if (val === correct) {
        isSolved = true;
        btn.classList.add('correct');
        document.body.classList.add('flash-green'); // 屏幕闪烁绿色

        // 连击处理
        comboCount++;
        if (comboCount >= 2 && comboCount <= 4) showPraise(praises[0]); // Good!
        else if (comboCount >= 5 && comboCount <= 7) showPraise(praises[1]); // Great Job!
        else if (comboCount >= 8 && comboCount <= 10) showPraise(praises[2]); // Amazing!
        else if (comboCount > 10) showPraise(praises[3]); // Unstoppable!

        if (isFirstAttempt) {
            correctCount++;
            totalCount++;
        }
        updateStats();
        triggerRandomConfetti();
        if (navigator.vibrate) navigator.vibrate(200);
        
        dingSound.currentTime = 0; // 重置音频播放位置
        dingSound.play().catch(e => console.log("Audio play failed, please interact with the page first.")); // 播放正确音效

    } else {
        if (isFirstAttempt) totalCount++;
        wrongAnswers.add(val);
        btn.classList.add('wrong');
        document.body.classList.add('flash-red'); // 屏幕闪烁红色
        document.getElementById('question-text').classList.add('shake'); // 题目晃动
        comboCount = 0; // 连击归零

        // buzzSound.currentTime = 0; // 重置音频播放位置，如果需要答错音效
        // buzzSound.play().catch(e => console.log("Buzz sound failed."));
    }
}

// 更新统计数据和等级
function updateStats() {
    document.getElementById('total-count').innerText = `${totalCount} Qs`;
    const rate = totalCount === 0 ? 0 : Math.round((correctCount / totalCount) * 100);
    document.getElementById('accuracy').innerText = `${rate}%`;

    // 更新等级
    let currentRank = ranks[0];
    for (let i = 0; i < rankThresholds.length; i++) {
        if (totalCount >= rankThresholds[i]) {
            currentRank = ranks[i];
        }
    }
    document.getElementById('player-rank').innerText = currentRank;
}

// 事件监听
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

// 初始化
generateQuestion();
updateStats(); // 首次加载也更新统计