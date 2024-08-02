import {
  FaceDetector,
  FilesetResolver,
  Detection,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

export async function init(ctx, html) {
  ctx.importCSS("main.css");
  ctx.root.innerHTML = html;

  async function run() {
    console.log("Starting.....");
    const demosSection = document.getElementById("demos");

    // let faceDetector: FaceDetector;

    // Initialize the object detector
    const initializefaceDetector = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      faceDetector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
          delegate: "GPU"
        },
        runningMode: "IMAGE"
      });
      demosSection.classList.remove("invisible");
    };
    initializefaceDetector();
    
    
    const imageContainers = document.getElementsByClassName("detectOnClick");
    
    for (let imageContainer of imageContainers) {
      imageContainer.children[0].addEventListener("click", handleClick);
    }
    
    async function handleClick(event) {
      const highlighters = event.target.parentNode.getElementsByClassName(
        "highlighter"
      );
      while (highlighters[0]) {
        highlighters[0].parentNode.removeChild(highlighters[0]);
      }
    
      const infos = event.target.parentNode.getElementsByClassName("info");
      while (infos[0]) {
        infos[0].parentNode.removeChild(infos[0]);
      }
      const keyPoints = event.target.parentNode.getElementsByClassName("key-point");
      while (keyPoints[0]) {
        keyPoints[0].parentNode.removeChild(keyPoints[0]);
      }
    
      if (!faceDetector) {
        console.log("Wait for objectDetector to load before clicking");
        return;
      }
    
      const ratio = event.target.height / event.target.naturalHeight;
    
      // faceDetector.detect returns a promise which, when resolved, is an array of Detection faces
      const detections = faceDetector.detect(event.target).detections;
      console.log(detections);
    
      displayImageDetections(detections, event.target);
    }
    
    function displayImageDetections(detections: [], resultElement: HTMLElement) {
      const ratio = resultElement.height / resultElement.naturalHeight;
      console.log(ratio);
    
      for (let detection of detections) {
        // Description text
        const p = document.createElement("p");
        p.setAttribute("class", "info");
        p.innerText =
          "Confidence: " +
          Math.round(parseFloat(detection.categories[0].score) * 100) +
          "% .";
        // Positioned at the top left of the bounding box.
        // Height is whatever the text takes up.
        // Width subtracts text padding in CSS so fits perfectly.
        p.style =
          "left: " +
          detection.boundingBox.originX * ratio +
          "px;" +
          "top: " +
          (detection.boundingBox.originY * ratio - 30) +
          "px; " +
          "width: " +
          (detection.boundingBox.width * ratio - 10) +
          "px;" +
          "hight: " +
          20 +
          "px;";
        const highlighter = document.createElement("div");
        highlighter.setAttribute("class", "highlighter");
        highlighter.style =
          "left: " +
          detection.boundingBox.originX * ratio +
          "px;" +
          "top: " +
          detection.boundingBox.originY * ratio +
          "px;" +
          "width: " +
          detection.boundingBox.width * ratio +
          "px;" +
          "height: " +
          detection.boundingBox.height * ratio +
          "px;";
    
        resultElement.parentNode.appendChild(highlighter);
        resultElement.parentNode.appendChild(p);
        for (let keypoint of detection.keypoints) {
          const keypointEl = document.createElement("spam");
          keypointEl.className = "key-point";
          keypointEl.style.top = `${keypoint.y * resultElement.height - 3}px`;
          keypointEl.style.left = `${keypoint.x * resultElement.width - 3}px`;
          resultElement.parentNode.appendChild(keypointEl);
        }
      }
    }
  run();
}
