# face_verification.py

import numpy as np
from PIL import Image
from keras_facenet import FaceNet
from reco.modules.face_embedding import extract_face_embedding
import numpy as np
from PIL import Image
from mtcnn.mtcnn import MTCNN
import os
import pickle
# Initialize FaceNet
embedder = FaceNet()

def verify_faces(image_array1, image_array2):
    embedding1 = extract_face_embedding(image_array1)
    embedding2 = extract_face_embedding(image_array2)
    print("Shape of embedding1:", embedding1.shape)  # Should be (n,) for 1-D
    print("Shape of embedding2:", embedding2.shape)  # Should be (n,) for 1-D
    distance = embedder.compute_distance(embedding1, embedding2)
    
    return distance < 0.5

def get_face(filename): #This function is responsible for returning the face from the database
    image = Image.open(filename) # open the image
    image = image.convert('RGB') #Convert it to RGB
    face_array = np.asarray(image) #convert it to array
    return face_array # return the face array


def extract_face_embedding(image_array):
    detector = MTCNN()
    results = detector.detect_faces(image_array)

    if not results:
        raise ValueError("No face detected in the image.")

    x1, y1, width, height = results[0]['box']
    x1, y1 = abs(x1), abs(y1)
    x2, y2 = x1 + width, y1 + height
    face = image_array[y1:y2, x1:x2]

    embeddings = embedder.extract(face, threshold=0.95)
    if not embeddings:
        raise ValueError("Failed to extract face embeddings.")

    return embeddings[0]['embedding']

def save_embedding(image_array, output_path):
    embedding = extract_face_embedding(image_array)
    with open(output_path, 'wb') as file:
        pickle.dump(embedding, file)
    print(f"Embedding saved to {output_path}")