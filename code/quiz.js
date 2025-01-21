function generateRandomNumber(max) {
    return Math.floor(Math.random() * max) + 1;
}


let IDQuestionNumber = generateRandomNumber(245);
let currentQuestionCount = 0;
const totalQuestions = 15; 
let score = 0; 

const token = localStorage.getItem('accessToken');


let templateIds = [1,1,1,1,1,2,2,2,2,2,3,3,3,3,3];
let countryIds = [];

let questionStrings = [];

let answerStrings = [];

let correctness = [];

const fetchPromises = [];


let lastQuizIdNumber = 0;

async function getLastQuizIdNumber() {
    try {
        const response = await fetch('http://localhost:3000/api/quiz');
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        const data = await response.json();

        if (data.length === 0) {
            lastQuizIdNumber = 0;
        } else {
            const lastQuiz = data[data.length - 1];
            const quizId = lastQuiz.quiz_id;

            if (typeof quizId === 'number') {
                lastQuizIdNumber = quizId;
            } else {
                throw new Error('quiz_id is not a number.');
            }
        }

        return lastQuizIdNumber;
    } catch (error) {
        console.error('Error fetching quizzes:', error.message);
        throw error;
    }
}


function generateRandomCountryIds(numIds, excludeIds) {
    const randomIds = [];
    const maxCountryId = 245; 

    while (randomIds.length < numIds) {
        const randomId = Math.floor(Math.random() * maxCountryId) + 1;
        if (!randomIds.includes(randomId) && !excludeIds.includes(randomId)) {
            randomIds.push(randomId);
        }
    }

    return randomIds;
}


async function fetchCapitalQuestionAndDisplay() {
    const apiTemplate = `http://localhost:3000/api/template/1`; 
    const apiCountry = `http://localhost:3000/api/country/${IDQuestionNumber}`;

    try {
        const [response1, response2] = await Promise.all([fetch(apiTemplate), fetch(apiCountry)]);
        
        if (!response1.ok || !response2.ok) {
            throw new Error('Network response was not ok');
        }

        const [jsonResponse1, jsonResponse2] = await Promise.all([response1.json(), response2.json()]);

        const questionText1 = Array.isArray(jsonResponse1) ? jsonResponse1[0].template : jsonResponse1.template;
        const questionText2 = Array.isArray(jsonResponse2) ? jsonResponse2[0].country : jsonResponse2.country;
        const questionString = `${questionText1} ${questionText2}?`;

        countryIds.push(IDQuestionNumber);
        questionStrings.push(questionString);

        document.getElementById('question').innerText = `${currentQuestionCount + 1}. ${questionText1} ${questionText2}?`;

        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.classList.remove('correct', 'incorrect');
            button.style.display = 'block';
        });

        document.getElementById('next-btn').style.display = 'none';
        document.getElementById('flag-container').style.display = 'none';
    } catch (error) {
        console.error('Error fetching question:', error);
        document.getElementById('question').innerText = `${currentQuestionCount + 1}. What is the capital city of Slovenia?`;
    }
}


async function fetchFlagQuestionAndDisplay() {
    const apiTemplate = `http://localhost:3000/api/template/2`; 

    try {
        const response1 = await fetch(apiTemplate);

        if (!response1.ok) {
            throw new Error('Network response was not ok');
        }

        const jsonResponse1 = await response1.json();

        let questionText1 = Array.isArray(jsonResponse1) ? jsonResponse1[0].template : jsonResponse1.template;
        const questionString = `${questionText1}?`;

        countryIds.push(IDQuestionNumber);
        questionStrings.push(questionString);
        
        document.getElementById('question').innerText = `${currentQuestionCount + 1}. ${questionText1}?`;
        
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.classList.remove('correct', 'incorrect');
            button.style.display = 'block';
        });

        document.getElementById('next-btn').style.display = 'none';
        document.getElementById('flag-container').style.display = 'block'; 

    } catch (error) {
        console.error('Error fetching question:', error);
        document.getElementById('question').innerText = `${currentQuestionCount + 1}. What country's flag is this?`;
    }
}


async function fetchFlag() {
    const apiURL = `http://localhost:3000/api/country/${IDQuestionNumber}`; 

    try {
        const response = await fetch(apiURL);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const flagURL = data.flag;
        displayFlag(flagURL);
    } catch (error) {
        console.error('Error fetching the flag:', error);
    }
}


function displayFlag(flagURL) {
    const flagContainer = document.getElementById('flag-container');
    flagContainer.innerHTML = '';
    const img = document.createElement('img');
    img.src = flagURL;
    img.alt = 'Flag';
    img.style.width = '100%';
    img.style.display = 'block';
    img.style.margin = '0 auto';
    flagContainer.appendChild(img);
}


async function fetchRegionQuestionAndDisplay() {
    const apiTemplate = `http://localhost:3000/api/template/3`; 
    const apiCountry = `http://localhost:3000/api/country/${IDQuestionNumber}`;

    try {
        const [response1, response2] = await Promise.all([fetch(apiTemplate), fetch(apiCountry)]);
        
        if (!response1.ok || !response2.ok) {
            throw new Error('Network response was not ok');
        }

        const [jsonResponse1, jsonResponse2] = await Promise.all([response1.json(), response2.json()]);

        let questionText1 = Array.isArray(jsonResponse1) ? jsonResponse1[0].template : jsonResponse1.template;
        let questionText2 = Array.isArray(jsonResponse2) ? jsonResponse2[0].country : jsonResponse2.country;
        const questionString = `${questionText1}: ${questionText2}`;

        countryIds.push(IDQuestionNumber);
        questionStrings.push(questionString);

        document.getElementById('question').innerText = `${currentQuestionCount + 1}. ${questionText1}: ${questionText2}`;

        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.classList.remove('correct', 'incorrect');
            button.style.display = 'block';
        });

        document.getElementById('next-btn').style.display = 'none';
        document.getElementById('flag-container').style.display = 'none';

    } catch (error) {
        console.error('Error fetching question:', error);
        document.getElementById('question').innerText = `${currentQuestionCount + 1}. What is the capital city of Slovenia?`;
    }
}

async function fetchCountryAndDisplay(countryId, buttonElement) {
    const apiUrl = `http://localhost:3000/api/country/${countryId}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const countryName = data.country;

        buttonElement.textContent = countryName;
    } catch (error) {
        console.error('Error fetching country data:', error);
        buttonElement.textContent = 'Error: Failed to fetch data'; 
    }
}


async function fetchCapitalAndDisplay(countryId, buttonElement) {
    const apiUrl = `http://localhost:3000/api/capital/${countryId}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const capitalName = data.capital_city;

        buttonElement.textContent = capitalName;
    } catch (error) {
        console.error('Error fetching capital data:', error);
        buttonElement.textContent = 'Error'; 
    }
}


async function fetchRegionAndDisplay(countryId, buttonElement, usedNames, isCorrectAnswer) {
    const apiUrl = `http://localhost:3000/api/country/${countryId}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const regionName = data.region;

        if (!usedNames.includes(regionName)) {
            buttonElement.textContent = regionName;
            usedNames.push(regionName);
        } else {
            if (isCorrectAnswer) {
                const newRegionId = generateRandomCountryIds(1, [countryId])[0];
                await fetchRegionAndDisplay(newRegionId, buttonElement, usedNames, true);
            } else {
                let uniqueRegionName = await findUniqueRegionName(usedNames);
                buttonElement.textContent = uniqueRegionName;
                usedNames.push(uniqueRegionName);
            }
        }
    } catch (error) {
        console.error('Error fetching country data:', error);
        buttonElement.textContent = 'Unknown';
    }
}


async function findUniqueRegionName(usedNames) {
    const maxAttempts = 10;
    let attempt = 0;

    while (attempt < maxAttempts) {
        const randomId = generateRandomNumber(245);
        const apiUrl = `http://localhost:3000/api/country/${randomId}`;

        try {
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            const regionName = data.region;

            if (!usedNames.includes(regionName)) {
                return regionName;
            }
        } catch (error) {
            console.error(`Error fetching country data for ID ${randomId}:`, error);
        }

        attempt++;
    }

    return 'Unknown';
}

function handleButtonClick(button, buttons) {
    const answerString = button.element.textContent;
    const isCorrect = (button.id === IDQuestionNumber);


    if (isCorrect) {
        button.element.classList.add('correct');
        score++;
    } else {
        button.element.classList.add('incorrect');
        const correctButton = buttons.find(btn => btn.id === IDQuestionNumber);
        correctButton.element.classList.add('correct');
    }

    answerStrings.push(answerString);
    correctness.push(isCorrect ? "yes" : "no");

    buttons.forEach(btn => btn.element.removeEventListener('click', btn.clickHandler));
    document.getElementById('next-btn').style.display = 'block';
}


async function fetchAllDataAndDisplay(fetchFunction) {
    const numButtons = 4;
    const buttons = [];
    const randomIds = generateRandomCountryIds(numButtons - 1, [IDQuestionNumber]);

    randomIds.push(IDQuestionNumber);
    randomIds.sort(() => Math.random() - 0.5);

    const usedNames = [];

    await Promise.all(randomIds.map(async (id, index) => {
        buttons.push({
            id,
            element: document.getElementById(`button${index + 1}`)
        });

        await fetchFunction(id, buttons[index].element, usedNames, id === IDQuestionNumber);
        buttons[index].clickHandler = () => handleButtonClick(buttons[index], buttons);
        buttons[index].element.addEventListener('click', buttons[index].clickHandler);
    }));
}

async function postQuizHistory() {
    for (let i = 0; i < templateIds.length; i++) {
        const historyData = {
            quiz_id: lastQuizIdNumber + 1,
            template_id: templateIds[i],
            country_id: countryIds[i],
            question: questionStrings[i],
            answer: answerStrings[i],
            correct: correctness[i]
        };

        try {
            const response = await fetch("http://localhost:3000/api/details", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(historyData)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const jsonResponse = await response.json();
            console.log('History posted successfully:', jsonResponse);
        } catch (error) {
            console.error('Error posting history:', error);
        }
    }
    
}


async function initializeNewQuestion() {
    if (currentQuestionCount < totalQuestions) {
        IDQuestionNumber = generateRandomNumber(245);

        if (currentQuestionCount < 5) {
            await fetchCapitalQuestionAndDisplay();
            await fetchAllDataAndDisplay(fetchCapitalAndDisplay);
        } else if (currentQuestionCount < 10) {
            await fetchFlagQuestionAndDisplay();
            await fetchAllDataAndDisplay(fetchCountryAndDisplay);
            await fetchFlag();
        } else {
            await fetchRegionQuestionAndDisplay();
            await fetchAllDataAndDisplay(fetchRegionAndDisplay);
        }

        currentQuestionCount++;
    } else {
        document.getElementById('question').innerText = `Quiz Completed! You scored ${score} out of ${totalQuestions} points.`;
        document.getElementById('next-btn').style.display = 'none';
        document.getElementById('play-again-btn').style.display = 'block';
        document.getElementById('flag-container').style.display = 'none';

        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => button.style.display = 'none');
        
        if (token) {
            const decodedToken = parseJwt(token);
            
            if (decodedToken) {
            const username = decodedToken.username;
            const data = {
                username: username,
                result: Number(score)  
            };
    
            
            fetch("http://localhost:3000/api/quiz", {
                method: "POST",
                headers: {
                "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (!response.ok) {
                throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Data sent successfully:', data);
                
            })
            .catch(error => {
                console.error('Error sending data to database:', error);
                
            });
            } else {
            console.error('Error decoding token.');
            }
        } else {
            console.error('Token not found or invalid.');
        }
          
        await getLastQuizIdNumber();
        await postQuizHistory();
        
    }
}
function parseJwt(token) {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }

function resetQuiz() {
    currentQuestionCount = 0;
    score = 0;

    countryIds = [];
    questionStrings = [];
    answerStrings = [];
    correctness = [];

    document.getElementById('play-again-btn').style.display = 'none';
    document.getElementById('flag-container').style.display = 'none';
    initializeNewQuestion();
}

document.getElementById('next-btn').addEventListener('click', initializeNewQuestion);
document.getElementById('play-again-btn').addEventListener('click', resetQuiz);

document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('next-btn').style.display = 'none';
    document.getElementById('flag-container').style.display = 'none';
    await initializeNewQuestion();
});



