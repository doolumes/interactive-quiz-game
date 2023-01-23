const MAX_QUESTIONS = 10;
const startButton = document.getElementById("start-btn");
const nextButton = document.getElementById("next-btn");
const score = document.getElementById("score");
const num_questions = document.getElementById("num-questions");
const controls = document.getElementById("controls");
const quizContainer = document.getElementById("container");
const timerElement = document.getElementById("timer");
const questionContainerElement = document.getElementById("question-container");
const questionElement = document.getElementById("question");
const answerButtonsElement = document.getElementById("answer-buttons");
const category = document.getElementById("category");
let shuffledQuestions, currentQuestionIndex, questions;
let SCORE = 0;
let questionSelected = false;
let timer;
let timeout;
document.body.addEventListener("click", function () {
	console.log(category.value);
});
function startTime() {
	timeout = false;
	let time = 10;
	timer = setInterval(() => {
		if (time === 0) {
			timerElement.innerHTML = `00:0${time}`;
			//trigger the correct/incorrect answer scene
			setStatusClass(document.body, false);
			setTimeout(() => {
				currentQuestionIndex++;
				setNextQuestion();
			}, 2000);
			timeout = true;
			clearInterval(timer);
		} else if (time === 10) timerElement.innerHTML = `00:${time}`;
		else timerElement.innerHTML = `00:0${time}`;
		time--;
	}, 1000);
}
startButton.addEventListener("click", startGame);
nextButton.addEventListener("click", () => {
	clearInterval(timer);
	timerElement.innerHTML = `00:10`;
	currentQuestionIndex++;
	setNextQuestion();
});

async function startGame() {
	//fetch data
	await fetch(
		`https://opentdb.com/api.php?amount=${
			(num_questions.value <= 50 ? num_questions.value : 49) || 10
		}&category=${category.value || 9}`,
		{
			method: "GET",
		}
	)
		.then((response) => response.json())
		.then((data) => {
			console.log(data);
			setQuestionArray(data.results);
		});
	SCORE = 0;
	score.innerHTML = ``;
	console.log("started");
	startButton.classList.add("hide");
	shuffledQuestions = questions.sort(() => Math.random() - 0.5);
	currentQuestionIndex = 0;
	questionContainerElement.classList.remove("hide");
	setNextQuestion();
}

function setNextQuestion() {
	startTime();
	questionSelected = false;
	resetState();
	setStatusClass(document.body, "default");
	showQuestion(shuffledQuestions[currentQuestionIndex]);
}

function showQuestion(question) {
	questionElement.innerHTML = `${currentQuestionIndex + 1}. ${
		question.question
	}`;
	question.answers.forEach((answer) => {
		const button = document.createElement("button");
		button.innerText = answer.text;
		button.classList.add("btn");
		if (answer.correct) {
			button.dataset.correct = answer.correct;
		}
		button.addEventListener("click", selectAnswer);
		answerButtonsElement.appendChild(button);
	});
}
function resetState() {
	nextButton.classList.add("hide");
	while (answerButtonsElement.firstChild) {
		answerButtonsElement.removeChild(answerButtonsElement.firstChild);
	}
}
function selectAnswer(e) {
	const selectedButton = e.target;
	const correct = selectedButton.dataset.correct;

	if (correct && questionSelected === false && timeout === false) {
		questionSelected = true;
		SCORE++;
		score.innerHTML = `${SCORE}`;
	}
	questionSelected = true;
	console.log(SCORE);
	setStatusClass(document.body, correct);
	//creates an array from chuildren of answerbutton
	//ohhh so basically after we select an answer, we set the status of the correct answer first as seen in the previous line of code, then below, we are turning all the incorrect answers into an array and turning them red
	Array.from(answerButtonsElement.children).forEach((button) => {
		setStatusClass(button, button.dataset.correct);
	});
	if (shuffledQuestions.length > currentQuestionIndex + 1) {
		nextButton.classList.remove("hide");
	} else {
		startButton.innerText = "Restart";
		startButton.classList.remove("hide");
	}
}

function setStatusClass(element, correct) {
	//correct will either be true or false
	clearStatusClass(element);
	if (correct === "default") return;
	if (correct) {
		element.classList.add("correct");
	} else {
		questionContainerElement.classList.remove("hide");
		element.classList.add("wrong");
	}
}

function clearStatusClass(element) {
	element.classList.remove("correct");
	element.classList.remove("wrong");
}

function setQuestionArray(jsonQuestions) {
	//jsonQuestions is our data.results from our fetch promise
	questions = jsonQuestions.map((question) => {
		//storing
		let tempQuestion = question.question;
		let answersArray = question.incorrect_answers;
		answersArray.push(question.correct_answer);
		let answersObj = answersArray
			.map((answer) => {
				if (answersArray.indexOf(answer) === 0)
					return {
						text: answer,
						correct: true,
					};
				return {
					text: answer,
					correct: false,
				};
			})
			.sort(() => Math.random() - 0.5);
		return {
			question: tempQuestion,
			answers: answersObj,
		};
	});
}
console.log(category.value);
