// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/frfrrFOeq/";
let model, webcam, ctx, labelContainer, maxPredictions;
const synth = window.speechSynthesis

async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // load the model and metadata
  // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
  // Note: the pose library adds a tmPose object to your window (window.tmPose)
  model = await tmPose.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // Convenience function to setup a webcam
  const size = 200;
  const flip = true; // whether to flip the webcam
  webcam = new tmPose.Webcam(size, size, flip); // width, height, flip
  await webcam.setup(); // request access to the webcam
  await webcam.play();
  window.requestAnimationFrame(loop);

  // append/get elements to the DOM
  const canvas = document.getElementById("canvas");
  canvas.width = size;
  canvas.height = size;
  ctx = canvas.getContext("2d");
  labelContainer = document.getElementById("label-container");
  for (let i = 0; i < maxPredictions; i++) { // and class labels
    labelContainer.appendChild(document.createElement("div"));
  }
}

let isAnimating = false; // 변수를 추가하여 애니메이션이 진행 중인지 확인합니다.
const selHanElement = document.querySelector(".selHan");
const camHanElement = document.querySelector(".camHan");

const jingle = new Audio('./static/jingle.mp3')

function hideCorrectElement() {
  const correctElement = document.querySelector(".correct");
  const selNumElement = document.querySelector(".selNum")
  correctElement.style.display = "none"
  selHanElement.style.color = "black"
  selNumElement.style.color = "black"
  isAnimating = false; // 애니메이션이 끝났음을 표시합니다.
  speakHan()
}

function showCorrectElement() {
  const correctElement = document.querySelector(".correct");
  const selNumElement = document.querySelector(".selNum")
  correctElement.style.display = "block"
  jingle.play()
  selHanElement.style.color = "white"
  selNumElement.style.color = "white"
  isAnimating = true; // 애니메이션이 진행 중임을 표시합니다.

  // Hide the element after 2 seconds
  setTimeout(hideCorrectElement, 3000);
}

async function checkNumbersAndAnimate() {
  const selNumElement = document.querySelector('.selNum')
  const camNumElement = document.querySelector('.camNum')
  if (!isAnimating && selNumElement.textContent === camNumElement.textContent) {
    setRandomNumberToElement(".selNum", 1, 5);
    showCorrectElement();
  }
}

async function loop(timestamp) {
  webcam.update(); // 웹캠 프레임 업데이트
  await predict();
  checkNumbersAndAnimate(); // 숫자 확인과 애니메이션 체크
  window.requestAnimationFrame(loop);
}

async function predict() {
  // Prediction #1: run input through posenet
  // estimatePose can take in an image, video or canvas html element
  const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
  // Prediction 2: run input through teachable machine classification model
  const prediction = await model.predict(posenetOutput);

  // 예측 결과를 저장할 배열
  const predictionsArray = [];

  // 예측 결과를 배열에 추가하는 로직
  for (let i = 0; i < maxPredictions; i++) {
      const classPrediction ={
        no : (prediction[i].className).slice(-1),
        per : prediction[i].probability.toFixed(2)
      }

      predictionsArray.push(classPrediction);
  }
        
  // 가장 높은 값을 찾는 로직
  if (predictionsArray.length > 0) {
    let highestProbability = 0;
    let highestIndex = -1;
    for (let i = 0; i < predictionsArray.length; i++) {
      const probability = parseFloat(predictionsArray[i].per);
      if (probability > highestProbability) {
        highestProbability = probability;
        highestIndex = i;
      }
    }
  
    const camNumElement = document.querySelector(".camNum"); // camNum 클래스를 가진 엘리먼트 선택
    if (highestIndex !== -1) {
      const highestClassPrediction = predictionsArray[highestIndex];
      const highestClassNumber = parseInt(highestClassPrediction.no, 10);
      camNumElement.textContent = (Number.isNaN(highestClassNumber) ? "?" : highestClassNumber)
       // 엘리먼트에 가장 높은 값을 넣어줍니다.
    }
  

    switch (parseInt(camNumElement.textContent)) {
      case 1:
        camHanElement.textContent = "하나";
        break;
      case 2:
        camHanElement.textContent = "둘";
        break;
      case 3:
        camHanElement.textContent = "삼";
        break;
      case 4:
        camHanElement.textContent = "넷";
        break;
      case 5:
        camHanElement.textContent = "오";
        break;
      case 6:
        camHanElement.textContent = "여섯";
        break;
      case 7:
        camHanElement.textContent = "칠";
        break;
      case 8:
        camHanElement.textContent = "팔";
        break;
      case 9:
        camHanElement.textContent = "아홉";
        break;
      case 0:
        camHanElement.textContent = "공";
        break;
      default:
        camHanElement.textContent = "미인식";
        break;
    }
  }

  // finally draw the poses
  drawPose(pose);
}

function drawPose(pose) {
  if (webcam.canvas) {
    ctx.drawImage(webcam.canvas, 0, 0);
    // draw the keypoints and skeleton
    if (pose) {
      const minPartConfidence = 0.5;
      tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
      tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
    }
  }
}

function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function setRandomNumberToElement(selector, min, max) {
  const selNumElement = document.querySelector(selector);
  const randomNumber = generateRandomNumber(min, max);
  selNumElement.textContent = randomNumber;

  switch (parseInt(selNumElement.textContent)) {
    case 1:
      selHanElement.textContent = "하나";
      break;
    case 2:
      selHanElement.textContent = "둘";
      break;
    case 3:
      selHanElement.textContent = "삼";
      break;
    case 4:
      selHanElement.textContent = "넷";
      break;
    case 5:
      selHanElement.textContent = "오";
      break;
    case 6:
      selHanElement.textContent = "여섯";
      break;
    case 7:
      selHanElement.textContent = "칠";
      break;
    case 8:
      selHanElement.textContent = "팔";
      break;
    case 9:
      selHanElement.textContent = "아홉";
      break;
    case 0:
      selHanElement.textContent = "공";
      break;
    default:
      selHanElement.textContent = "알 수 없음";
      break;
  }
}

function speakHan() {
  const utterThis = new SpeechSynthesisUtterance(selHanElement.textContent)
  utterThis.lang = "ko-KR"
  utterThis.volume = 1;
  utterThis.pitch = 1.1;
  utterThis.rate = 0.8;
  synth.speak(utterThis)
}

document.addEventListener("DOMContentLoaded", function () {
  setRandomNumberToElement(".selNum", 1, 5);
  speakHan()
});

window.onload = init();