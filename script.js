// Global variables for Question Timer
let sessionTime;
let questionCount = 0;
let skippedCount = 0;
let timestamps = [];
let questionTimes = [];
let skippedQuestions = [];
let sessionStartTime;
let timerInterval;
let lastQuestionTime = 0;
let doubtCount = 0;
let doubtQuestions = [];
let startingQuestionNumber = 1;
let currentQuestionNumber = 0;
let questionSessionName = ''; // Add to global variables
// Global variables for Page Timer
let pageCount = 0;
let pageTimes = [];
let pageStartTime;
let pageTimerInterval;
let lastPageTime = 0;
let currentPageNumber = 0;
let pageSessionName = ''; // Add to global variables

// Add to global variables section
let writePageCount = 0;
let writePageTimes = [];
let writePageStartTime;
let writePageTimerInterval;
let writeLastPageTime = 0;
let writeCurrentPageNumber = 0;
let writePageSessionName = '';

// Add to global variables section at the top
let currentStreak = 0;
let bestStreak = 0;

// Add to global variables
let targetQuestionCount = 0;

// Add Chart.js script to the page
const chartScript = document.createElement('script');
chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
document.head.appendChild(chartScript);

// Mode Selection
document.getElementById('questionModeBtn').addEventListener('click', () => {
    document.getElementById('modeSelect').style.display = 'none';
    document.getElementById('questionTimer').style.display = 'block';
});
document.getElementById('pageModeBtn').addEventListener('click', () => {
    document.getElementById('modeSelect').style.display = 'none';
    document.getElementById('pageTimer').style.display = 'block';
});
// Add to Mode Selection section
document.getElementById('writePageModeBtn').addEventListener('click', () => {
    document.getElementById('modeSelect').style.display = 'none';
    document.getElementById('writePageTimer').style.display = 'block';
});
// Question Timer Event Listeners
document.getElementById('startButton').addEventListener('click', startSession);
document.getElementById('endButton').addEventListener('click', () => endSession('manual'));
document.getElementById('restartButton').addEventListener('click', restartSession);
// Page Timer Event Listeners
document.getElementById('startPageSession').addEventListener('click', startPageSession);
document.getElementById('endPageSession').addEventListener('click', endPageSession);
document.getElementById('restartPageTimer').addEventListener('click', restartPageSession);
// Add Write Page Timer Event Listeners
document.getElementById('startWritePageSession').addEventListener('click', startWritePageSession);
document.getElementById('endWritePageSession').addEventListener('click', endWritePageSession);
document.getElementById('restartWritePageTimer').addEventListener('click', restartWritePageSession);
// Back to Mode Select Buttons
document.querySelectorAll('#backToModeSelect').forEach(button => {
    button.addEventListener('click', () => {
        location.reload(); // Simplest way to reset everything
    });
});
// Tab Navigation
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(button.dataset.tab + 'Tab').classList.add('active');
    });
});
// Prevent negative numbers in inputs
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', function () {
        if (this.value < 0) this.value = 0;
    });
});
// Question Timer Functions
function startSession() {
    questionSessionName = document.getElementById('questionSessionName').value.trim();
    if (!questionSessionName) {
        alert('Please enter a session name');
        return;
    }
    const hours = parseInt(document.getElementById('hours').value) || 0;
    const minutes = parseInt(document.getElementById('minutes').value) || 0;
    const seconds = parseInt(document.getElementById('seconds').value) || 0;

    if (hours === 0 && minutes === 0 && seconds === 0) {
        alert('Please set a session time greater than 0');
        return;
    }

    sessionTime = (hours * 3600) + (minutes * 60) + seconds;
    sessionStartTime = Date.now();
    lastQuestionTime = sessionStartTime;
    startingQuestionNumber = parseInt(document.getElementById('startQuestion').value) || 1;
    currentQuestionNumber = startingQuestionNumber - 1;

    targetQuestionCount = parseInt(document.getElementById('targetQuestions').value) || 0;
    if (targetQuestionCount > 0) {
        document.getElementById('goalProgressContainer').style.display = 'block';
        updateGoalProgress(0);
    }

    document.getElementById('window1').style.display = 'none';
    document.getElementById('window2').style.display = 'block';

    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
    document.addEventListener('keydown', handleKeyPress);
}
function updateTimer() {
    const elapsedTime = Math.floor((Date.now() - sessionStartTime) / 1000);
    const remainingTime = sessionTime - elapsedTime;

    if (remainingTime <= 0) {
        endSession('timeout');
        return;
    }

    const hours = Math.floor(remainingTime / 3600);
    const minutes = Math.floor((remainingTime % 3600) / 60);
    const seconds = remainingTime % 60;

    document.getElementById('timerDisplay').textContent =
        `${hours}h ${minutes}m ${seconds}s`;
}
function handleKeyPress(event) {
    const currentTime = Date.now();
    const timeSpent = (currentTime - lastQuestionTime) / 1000;

    if (event.code === 'Space') {
        event.preventDefault();
        registerQuestion(timeSpent, 'solved');
    } else if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
        event.preventDefault();
        registerQuestion(timeSpent, 'skipped');
    } else if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
        event.preventDefault();
        registerQuestion(timeSpent, 'doubt');
    }

    lastQuestionTime = currentTime;
}
function registerQuestion(timeSpent, type) {
    currentQuestionNumber++;
    
    const li = document.createElement('li');
    li.textContent = `Question ${currentQuestionNumber} - ${timeSpent.toFixed(1)} seconds`;

    switch(type) {
        case 'solved':
            questionCount++;
            questionTimes.push(timeSpent);
            li.className = 'solved-question';
            document.getElementById('questionCount').textContent = questionCount;
            // Update streak
            currentStreak++;
            if (currentStreak > bestStreak) {
                bestStreak = currentStreak;
            }
            // Update streak display with animation
            const streakElement = document.getElementById('currentStreak');
            streakElement.textContent = currentStreak;
            streakElement.classList.add('streak-update');
            setTimeout(() => streakElement.classList.remove('streak-update'), 500);
            document.getElementById('bestStreak').textContent = bestStreak;
            updateGoalProgress(questionCount);
            break;
        case 'skipped':
        case 'doubt':
            // Reset streak on skip or doubt
            currentStreak = 0;
            document.getElementById('currentStreak').textContent = currentStreak;
            // Rest of the existing code for these cases...
            if (type === 'skipped') {
                skippedCount++;
                skippedQuestions.push({
                    number: currentQuestionNumber,
                    time: timeSpent
                });
                li.className = 'skipped-question';
                li.textContent += ' (Skipped)';
                document.getElementById('skippedCount').textContent = skippedCount;
            } else {
                doubtCount++;
                doubtQuestions.push({
                    number: currentQuestionNumber,
                    time: timeSpent
                });
                li.className = 'doubt-question';
                li.textContent += ' (Doubt)';
                document.getElementById('doubtCount').textContent = doubtCount;
            }
            break;
    }

    document.getElementById('timestamps').appendChild(li);
    
    // Add autoscroll
    const container = document.getElementById('timestamps').parentElement;
    container.scrollTop = container.scrollHeight;
}
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`;
    } else {
        return `${remainingSeconds}s`;
    }
}
function endSession(reason) {
    clearInterval(timerInterval);
    document.removeEventListener('keydown', handleKeyPress);

    const sessionEndTime = Date.now();
    const totalSessionTime = (sessionEndTime - sessionStartTime) / 1000;

    document.getElementById('window2').style.display = 'none';
    document.getElementById('window3').style.display = 'block';

    // Reset statistics display
    document.getElementById('totalQuestions').textContent = questionCount;
    document.getElementById('totalSkipped').textContent = skippedCount;
    document.getElementById('minTime').textContent = '-';
    document.getElementById('maxTime').textContent = '-';
    document.getElementById('averageTime').textContent = '-';

    // Create solved questions table
    const solvedHTML = questionCount > 0 ? `
        <table class="summary-table">
            <thead>
                <tr>
                    <th>Question</th>
                    <th>Time Taken</th>
                </tr>
            </thead>
            <tbody>
                ${questionTimes.map((time, index) => `
                    <tr>
                        <td>Question ${index + 1}</td>
                        <td>${formatTime(time)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    ` : '<p>No questions solved in this session.</p>';
    
    // Create skipped questions table
    const skippedHTML = skippedCount > 0 ? `
        <table class="summary-table">
            <thead>
                <tr>
                    <th>Question</th>
                    <th>Time Spent</th>
                </tr>
            </thead>
            <tbody>
                ${skippedQuestions.map(q => `
                    <tr>
                        <td>Question ${q.number}</td>
                        <td>${formatTime(q.time)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    ` : '<p>No questions skipped in this session.</p>';

    // Add doubt questions table
    const doubtHTML = doubtCount > 0 ? `
        <table class="summary-table">
            <thead>
                <tr>
                    <th>Question</th>
                    <th>Time Spent</th>
                </tr>
            </thead>
            <tbody>
                ${doubtQuestions.map(q => `
                    <tr>
                        <td>Question ${q.number}</td>
                        <td>${formatTime(q.time)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    ` : '<p>No questions marked as doubt in this session.</p>';

    document.getElementById('timePerQuestion').innerHTML = solvedHTML;
    document.getElementById('skippedQuestions').innerHTML = skippedHTML;
    document.getElementById('doubtQuestions').innerHTML = doubtHTML;

    // Update statistics only if questions were solved
    if (questionCount > 0) {
        const minTime = Math.min(...questionTimes);
        const maxTime = Math.max(...questionTimes);
        const averageTime = questionTimes.reduce((a, b) => a + b, 0) / questionCount;

        document.getElementById('minTime').textContent = formatTime(minTime);
        document.getElementById('maxTime').textContent = formatTime(maxTime);
        document.getElementById('averageTime').textContent = formatTime(averageTime);
    }

    const finalSessionLength = reason === 'timeout' ? sessionTime : totalSessionTime;
    document.getElementById('sessionLength').textContent = formatTime(finalSessionLength);

    // Create pie chart
    const ctx = document.getElementById('questionDistribution').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Solved', 'Skipped', 'Doubt'],
            datasets: [{
                data: [questionCount, skippedCount, doubtCount],
                backgroundColor: ['#00ff00', '#ff4444', '#ffa500']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#f0f0f0'
                    }
                }
            }
        }
    });

    // Add best streak to summary
    document.getElementById('finalBestStreak').textContent = bestStreak;

    // Add goal status to summary
    if (targetQuestionCount > 0) {
        const goalContainer = document.getElementById('goalResultContainer');
        const goalStatus = document.getElementById('goalStatus');
        goalContainer.style.display = 'block';
        
        if (questionCount >= targetQuestionCount) {
            goalStatus.textContent = '🎉 Goal Achieved! 🎯';
            goalStatus.className = 'goal-achieved';
        } else {
            goalStatus.textContent = `📊 ${questionCount}/${targetQuestionCount} Questions Solved`;
            goalStatus.className = 'goal-not-achieved';
        }
    }

    // Add question calculator functionality
    if (questionCount > 0) {
        const averageTime = questionTimes.reduce((a, b) => a + b, 0) / questionCount;
        
        document.getElementById('endWindowQuestionCount').addEventListener('input', function() {
            const questionCount = parseInt(this.value) || 0;
            if (questionCount > 0) {
                const estimatedTime = questionCount * averageTime;
                document.getElementById('endWindowEstimatedTime').textContent = formatTime(estimatedTime);
            } else {
                document.getElementById('endWindowEstimatedTime').textContent = '-';
            }
        });
    }
}
function restartSession() {
    questionCount = 0;
    skippedCount = 0;
    timestamps = [];
    questionTimes = [];
    skippedQuestions = [];
    lastQuestionTime = 0;
    doubtCount = 0;
    doubtQuestions = [];
    currentStreak = 0;
    bestStreak = 0;
    targetQuestionCount = 0;
    document.getElementById('currentStreak').textContent = '0';
    document.getElementById('bestStreak').textContent = '0';
    document.getElementById('finalBestStreak').textContent = '0';
    document.getElementById('targetQuestions').value = '';
    document.getElementById('goalProgressContainer').style.display = 'none';
    document.getElementById('goalResultContainer').style.display = 'none';

    document.getElementById('window3').style.display = 'none';
    document.getElementById('window1').style.display = 'block';
    document.getElementById('timestamps').innerHTML = '';
    document.getElementById('questionCount').textContent = '0';
    document.getElementById('skippedCount').textContent = '0';
    document.getElementById('doubtCount').textContent = '0';
    document.getElementById('hours').value = '0';
    document.getElementById('minutes').value = '0';
    document.getElementById('seconds').value = '0';
    document.getElementById('startQuestion').value = '1';
    document.getElementById('totalQuestions').value = '';
    document.getElementById('estimatedQuestionTime').textContent = '-';
    document.getElementById('endWindowQuestionCount').value = '';
    document.getElementById('endWindowEstimatedTime').textContent = '-';
}
function updateGoalProgress(solved) {
    if (targetQuestionCount > 0) {
        const progress = Math.min((solved / targetQuestionCount) * 100, 100);
        document.getElementById('goalProgress').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = `${Math.round(progress)}%`;
    }
}
// Page Timer Functions
function startPageSession() {
    pageSessionName = document.getElementById('pageSessionName').value.trim();
    if (!pageSessionName) {
        alert('Please enter a session name');
        return;
    }
    const startPage = parseInt(document.getElementById('startPage').value) || 1;
    if (startPage < 1) {
        alert('Please enter a valid starting page number');
        return;
    }

    currentPageNumber = startPage - 1;
    pageStartTime = Date.now();
    lastPageTime = pageStartTime;

    document.getElementById('pageWindow1').style.display = 'none';
    document.getElementById('pageWindow2').style.display = 'block';

    updatePageTimer();
    pageTimerInterval = setInterval(updatePageTimer, 1000);
    document.addEventListener('keydown', handlePageKeyPress);
}
function updatePageTimer() {
    const elapsedTime = Math.floor((Date.now() - pageStartTime) / 1000);
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = elapsedTime % 60;

    document.getElementById('pageTimerDisplay').textContent =
        `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
function handlePageKeyPress(event) {
    if (event.code === 'Space') {
        event.preventDefault();
        const currentTime = Date.now();
        const timeSpent = (currentTime - lastPageTime) / 1000;
        currentPageNumber++;

        pageTimes.push({
            page: currentPageNumber,
            time: timeSpent
        });

        document.getElementById('currentPage').textContent = currentPageNumber;

        const li = document.createElement('li');
        li.textContent = `Page ${currentPageNumber} - ${formatTime(timeSpent)}`;
        li.className = 'solved-question';
        document.getElementById('pageTimestamps').appendChild(li);

        // Auto scroll
        const container = document.getElementById('pageTimestamps').parentElement;
        container.scrollTop = container.scrollHeight;

        lastPageTime = currentTime;
    }
}
function endPageSession() {
    clearInterval(pageTimerInterval);
    document.removeEventListener('keydown', handlePageKeyPress);

    document.getElementById('pageWindow2').style.display = 'none';
    document.getElementById('pageWindow3').style.display = 'block';

    const totalPages = pageTimes.length;
    const totalTime = pageTimes.reduce((sum, page) => sum + page.time, 0);
    const averageTime = totalTime / totalPages;

    document.getElementById('totalPages').textContent = totalPages;
    document.getElementById('avgTimePerPage').textContent = formatTime(averageTime);
    document.getElementById('totalReadingTime').textContent = formatTime(totalTime);

    // Create pages table
    const tableHTML = `
        <table class="summary-table">
            <thead>
                <tr>
                    <th>Page</th>
                    <th>Time Taken</th>
                </tr>
            </thead>
            <tbody>
                ${pageTimes.map(page => `
                    <tr>
                        <td>Page ${page.page}</td>
                        <td>${formatTime(page.time)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    document.getElementById('pageTimesTable').innerHTML = tableHTML;

    // Setup book calculator
    document.getElementById('totalBookPages').addEventListener('input', function () {
        const totalBookPages = parseInt(this.value) || 0;
        if (totalBookPages > 0 && averageTime > 0) {
            const estimatedTime = totalBookPages * averageTime;
            document.getElementById('estimatedTime').textContent = formatTime(estimatedTime);
        } else {
            document.getElementById('estimatedTime').textContent = '-';
        }
    });
}
function restartPageSession() {
    pageCount = 0;
    pageTimes = [];
    currentPageNumber = 0;
    lastPageTime = 0;

    document.getElementById('pageWindow3').style.display = 'none';
    document.getElementById('pageWindow1').style.display = 'block';
    document.getElementById('pageTimestamps').innerHTML = '';
    document.getElementById('currentPage').textContent = '0';
    document.getElementById('startPage').value = '';
    document.getElementById('totalBookPages').value = '';
    document.getElementById('estimatedTime').textContent = '-';

    // Also reset the pageTimestamps container scroll position
    const container = document.querySelector('.timestamps-container');
    if (container) {
        container.scrollTop = 0;
    }
}

// Add Write Page Timer Functions
function startWritePageSession() {
    writePageSessionName = document.getElementById('writePageSessionName').value.trim();
    if (!writePageSessionName) {
        alert('Please enter a session name');
        return;
    }
    const startPage = parseInt(document.getElementById('writeStartPage').value) || 1;
    if (startPage < 1) {
        alert('Please enter a valid starting page number');
        return;
    }

    writeCurrentPageNumber = startPage - 1;
    writePageStartTime = Date.now();
    writeLastPageTime = writePageStartTime;

    document.getElementById('writePageWindow1').style.display = 'none';
    document.getElementById('writePageWindow2').style.display = 'block';

    updateWritePageTimer();
    writePageTimerInterval = setInterval(updateWritePageTimer, 1000);
    document.addEventListener('keydown', handleWritePageKeyPress);
}

function updateWritePageTimer() {
    const elapsedTime = Math.floor((Date.now() - writePageStartTime) / 1000);
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = elapsedTime % 60;

    document.getElementById('writePageTimerDisplay').textContent =
        `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function handleWritePageKeyPress(event) {
    if (event.code === 'Space') {
        event.preventDefault();
        const currentTime = Date.now();
        const timeSpent = (currentTime - writeLastPageTime) / 1000;
        writeCurrentPageNumber++;

        writePageTimes.push({
            page: writeCurrentPageNumber,
            time: timeSpent
        });

        document.getElementById('writeCurrentPage').textContent = writeCurrentPageNumber;

        const li = document.createElement('li');
        li.textContent = `Page ${writeCurrentPageNumber} - ${formatTime(timeSpent)}`;
        li.className = 'solved-question';
        document.getElementById('writePageTimestamps').appendChild(li);

        const container = document.getElementById('writePageTimestamps').parentElement;
        container.scrollTop = container.scrollHeight;

        writeLastPageTime = currentTime;
    }
}

function endWritePageSession() {
    clearInterval(writePageTimerInterval);
    document.removeEventListener('keydown', handleWritePageKeyPress);

    document.getElementById('writePageWindow2').style.display = 'none';
    document.getElementById('writePageWindow3').style.display = 'block';

    const totalPages = writePageTimes.length;
    const totalTime = writePageTimes.reduce((sum, page) => sum + page.time, 0);
    const averageTime = totalTime / totalPages;

    document.getElementById('totalPagesWritten').textContent = totalPages;
    document.getElementById('avgTimePerWrittenPage').textContent = formatTime(averageTime);
    document.getElementById('totalWritingTime').textContent = formatTime(totalTime);

    const tableHTML = `
        <table class="summary-table">
            <thead>
                <tr>
                    <th>Page</th>
                    <th>Time Taken</th>
                </tr>
            </thead>
            <tbody>
                ${writePageTimes.map(page => `
                    <tr>
                        <td>Page ${page.page}</td>
                        <td>${formatTime(page.time)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    document.getElementById('writePageTimesTable').innerHTML = tableHTML;

    document.getElementById('totalWritePages').addEventListener('input', function () {
        const totalWritePages = parseInt(this.value) || 0;
        if (totalWritePages > 0 && averageTime > 0) {
            const estimatedTime = totalWritePages * averageTime;
            document.getElementById('estimatedWriteTime').textContent = formatTime(estimatedTime);
        } else {
            document.getElementById('estimatedWriteTime').textContent = '-';
        }
    });
}

function restartWritePageSession() {
    writePageCount = 0;
    writePageTimes = [];
    writeCurrentPageNumber = 0;
    writeLastPageTime = 0;

    document.getElementById('writePageWindow3').style.display = 'none';
    document.getElementById('writePageWindow1').style.display = 'block';
    document.getElementById('writePageTimestamps').innerHTML = '';
    document.getElementById('writeCurrentPage').textContent = '0';
    document.getElementById('writeStartPage').value = '';
    document.getElementById('totalWritePages').value = '';
    document.getElementById('estimatedWriteTime').textContent = '-';

    const container = document.querySelector('.timestamps-container');
    if (container) {
        container.scrollTop = 0;
    }
}

// Add new export functions
function exportQuestionData() {
    const headers = ['Session Name', 'Total Questions', 'Questions Solved', 'Questions Skipped', 
                    'Questions with Doubt', 'Best Streak', 'Total Time', 'Target Questions', 'Goal Achieved'];
    const data = [
        questionSessionName,
        questionCount + skippedCount + doubtCount,
        questionCount,
        skippedCount,
        doubtCount,
        bestStreak,
        formatTime((Date.now() - sessionStartTime) / 1000),
        targetQuestionCount,
        targetQuestionCount > 0 ? (questionCount >= targetQuestionCount ? 'Yes' : 'No') : 'No Target Set'
    ];

    let csvContent = headers.join(',') + '\n' + data.join(',') + '\n\n';
    
    csvContent += 'Question Details\n';
    csvContent += 'Number,Status,Time\n';
    
    // Add solved questions
    questionTimes.forEach((time, index) => {
        csvContent += `${startingQuestionNumber + index},Solved,${formatTime(time)}\n`;
    });
    
    // Add skipped questions
    skippedQuestions.forEach(q => {
        csvContent += `${q.number},Skipped,${formatTime(q.time)}\n`;
    });
    
    // Add doubt questions
    doubtQuestions.forEach(q => {
        csvContent += `${q.number},Doubt,${formatTime(q.time)}\n`;
    });

    downloadCSV(csvContent, `question_session_${questionSessionName}_${new Date().toISOString().split('T')[0]}.csv`);
}

function exportPageData() {
    const headers = ['Session Name', 'Total Pages', 'Average Time Per Page', 'Total Reading Time'];
    const totalTime = pageTimes.reduce((sum, page) => sum + page.time, 0);
    const data = [
        pageSessionName,
        pageTimes.length,
        formatTime(totalTime / pageTimes.length),
        formatTime(totalTime)
    ];

    let csvContent = headers.join(',') + '\n' + data.join(',') + '\n\n';
    
    csvContent += 'Page Details\n';
    csvContent += 'Page Number,Time Taken\n';
    
    pageTimes.forEach(page => {
        csvContent += `${page.page},${formatTime(page.time)}\n`;
    });

    downloadCSV(csvContent, `page_session_${pageSessionName}_${new Date().toISOString().split('T')[0]}.csv`);
}

// Add to export functions
function exportWritePageData() {
    const headers = ['Session Name', 'Total Pages Written', 'Average Time Per Page', 'Total Writing Time'];
    const totalTime = writePageTimes.reduce((sum, page) => sum + page.time, 0);
    const data = [
        writePageSessionName,
        writePageTimes.length,
        formatTime(totalTime / writePageTimes.length),
        formatTime(totalTime)
    ];

    let csvContent = headers.join(',') + '\n' + data.join(',') + '\n\n';
    
    csvContent += 'Page Details\n';
    csvContent += 'Page Number,Time Taken\n';
    
    writePageTimes.forEach(page => {
        csvContent += `${page.page},${formatTime(page.time)}\n`;
    });

    downloadCSV(csvContent, `writing_session_${writePageSessionName}_${new Date().toISOString().split('T')[0]}.csv`);
}



// Add event listeners for export buttons
document.getElementById('exportQuestionData').addEventListener('click', exportQuestionData);
document.getElementById('exportPageData').addEventListener('click', exportPageData);
// Add event listener for export button
document.getElementById('exportWritePageData').addEventListener('click', exportWritePageData);
