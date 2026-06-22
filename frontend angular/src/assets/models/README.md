# Face-API.js Models

To use face recognition, you need to download the face-api.js models:

1. Download the following models from the face-api.js GitHub repository:
   - tiny_face_detector_model-weights_manifest.json
   - tiny_face_detector_model-shard1
   - face_landmark_68_model-weights_manifest.json
   - face_landmark_68_model-shard1
   - face_recognition_model-weights_manifest.json
   - face_recognition_model-shard1
   - face_recognition_model-shard2

2. Place them in this directory: src/assets/models/

3. Or run this command to download them:
   ```bash
   # Create a script to download all models
   wget -P src/assets/models/ https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json
   wget -P src/assets/models/ https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1
   wget -P src/assets/models/ https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json
   wget -P src/assets/models/ https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1
   wget -P src/assets/models/ https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json
   wget -P src/assets/models/ https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1
   wget -P src/assets/models/ https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard2
   ```

Note: The component will work without models but face detection won't function until they are properly loaded.