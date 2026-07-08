let quiz = {
  titulo: "StudyPsico",
  descripcion: "",
  preguntas: []
};

const title = document.querySelector("#quiz-title");
const description = document.querySelector("#quiz-description");
const totalCount = document.querySelector("#total-count");
const answeredCount = document.querySelector("#answered-count");
const scoreCount = document.querySelector("#score-count");
const quizForm = document.querySelector("#quiz-form");
const results = document.querySelector("#results");
const template = document.querySelector("#question-template");
const resetButton = document.querySelector("#reset-button");
const gradeButton = document.querySelector("#grade-button");

function normalizeQuiz(data) {
  if (!data || !Array.isArray(data.preguntas)) {
    throw new Error("El JSON debe tener una lista llamada preguntas.");
  }

  data.preguntas.forEach((item, index) => {
    const questionNumber = index + 1;
    if (typeof item.pregunta !== "string" || !item.pregunta.trim()) {
      throw new Error(`La pregunta ${questionNumber} no tiene texto.`);
    }
    if (!Array.isArray(item.opciones) || item.opciones.length < 2) {
      throw new Error(`La pregunta ${questionNumber} debe tener al menos 2 opciones.`);
    }
    if (!Number.isInteger(item.respuesta) || item.respuesta < 0 || item.respuesta >= item.opciones.length) {
      throw new Error(`La respuesta de la pregunta ${questionNumber} debe ser el indice de una opcion valida.`);
    }
  });

  return {
    titulo: data.titulo || "Cuestionario",
    descripcion: data.descripcion || "",
    preguntas: data.preguntas
  };
}

function renderQuiz() {
  quizForm.innerHTML = "";
  results.hidden = true;
  results.innerHTML = "";
  scoreCount.textContent = "--";
  title.textContent = quiz.titulo;
  description.textContent = quiz.descripcion;
  totalCount.textContent = String(quiz.preguntas.length);
  answeredCount.textContent = "0";

  if (quiz.preguntas.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No hay preguntas cargadas.";
    quizForm.append(empty);
    return;
  }

  quiz.preguntas.forEach((question, questionIndex) => {
    const node = template.content.cloneNode(true);
    const fieldset = node.querySelector("fieldset");
    const legend = node.querySelector("legend");
    const options = node.querySelector(".options");

    fieldset.dataset.questionIndex = String(questionIndex);
    legend.textContent = `${questionIndex + 1}. ${question.pregunta}`;

    question.opciones.forEach((option, optionIndex) => {
      const id = `question-${questionIndex}-option-${optionIndex}`;
      const label = document.createElement("label");
      label.className = "option";
      label.dataset.optionIndex = String(optionIndex);
      label.htmlFor = id;

      const input = document.createElement("input");
      input.type = "radio";
      input.name = `question-${questionIndex}`;
      input.id = id;
      input.value = String(optionIndex);

      const text = document.createElement("span");
      text.textContent = option;

      label.append(input, text);
      options.append(label);
    });

    quizForm.append(node);
  });
}

function getAnswers() {
  return quiz.preguntas.map((_, index) => {
    const selected = quizForm.querySelector(`input[name="question-${index}"]:checked`);
    return selected ? Number(selected.value) : null;
  });
}

function updateAnsweredCount() {
  const answered = getAnswers().filter((answer) => answer !== null).length;
  answeredCount.textContent = String(answered);
}

function clearGradeStyles() {
  quizForm.querySelectorAll(".question-card").forEach((card) => {
    card.classList.remove("correct", "incorrect");
  });
  quizForm.querySelectorAll(".option").forEach((option) => {
    option.classList.remove("correct-answer", "wrong-answer");
  });
}

function gradeQuiz() {
  clearGradeStyles();
  const answers = getAnswers();
  let correct = 0;
  const mistakes = [];

  quiz.preguntas.forEach((question, index) => {
    const card = quizForm.querySelector(`[data-question-index="${index}"]`);
    const selected = answers[index];
    const correctOption = card.querySelector(`[data-option-index="${question.respuesta}"]`);

    correctOption.classList.add("correct-answer");

    if (selected === question.respuesta) {
      correct += 1;
      card.classList.add("correct");
      return;
    }

    card.classList.add("incorrect");
    if (selected !== null) {
      card.querySelector(`[data-option-index="${selected}"]`).classList.add("wrong-answer");
    }
    mistakes.push({
      number: index + 1,
      question: question.pregunta,
      selected,
      correct: question.respuesta,
      explanation: question.explicacion || ""
    });
  });

  const total = quiz.preguntas.length;
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
  scoreCount.textContent = `${correct}/${total}`;

  results.hidden = false;
  results.innerHTML = "";

  const heading = document.createElement("h2");
  heading.textContent = `Resultado: ${percent}%`;
  const summary = document.createElement("p");
  summary.textContent = `Respondiste correctamente ${correct} de ${total} preguntas.`;
  results.append(heading, summary);

  if (!mistakes.length) {
    const perfect = document.createElement("p");
    perfect.textContent = "Todo correcto.";
    results.append(perfect);
  } else {
    const intro = document.createElement("p");
    intro.textContent = "Errores para repasar:";
    const list = document.createElement("ul");

    mistakes.forEach((mistake) => {
      const question = quiz.preguntas[mistake.number - 1];
      const item = document.createElement("li");
      const strong = document.createElement("strong");
      strong.textContent = `${mistake.number}. ${mistake.question}`;
      const selectedText = mistake.selected === null ? "Sin responder" : question.opciones[mistake.selected];
      const correctText = question.opciones[mistake.correct];
      const detail = document.createElement("span");
      detail.append(
        document.createElement("br"),
        `Tu respuesta: ${selectedText}`,
        document.createElement("br"),
        `Correcta: ${correctText}.`
      );
      if (mistake.explanation) {
        detail.append(` ${mistake.explanation}`);
      }
      item.append(strong, detail);
      list.append(item);
    });

    results.append(intro, list);
  }

  results.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showLoadError(message) {
  quiz = {
    titulo: "StudyPsico",
    descripcion: "",
    preguntas: []
  };
  renderQuiz();
  const empty = quizForm.querySelector(".empty-state");
  if (empty) {
    empty.textContent = message;
  }
}

async function loadRootJson() {
  try {
    if (window.location.protocol === "file:") {
      throw new Error("Abrilo desde http://127.0.0.1:8000/. El navegador bloquea preguntas.json si abris index.html como archivo.");
    }

    const response = await fetch(`./preguntas.json?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("No se pudo cargar preguntas.json desde la carpeta raiz.");
    }
    quiz = normalizeQuiz(await response.json());
    renderQuiz();
  } catch (error) {
    showLoadError(error.message);
  }
}

quizForm.addEventListener("change", updateAnsweredCount);
resetButton.addEventListener("click", renderQuiz);
gradeButton.addEventListener("click", gradeQuiz);

loadRootJson();
