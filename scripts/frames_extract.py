# -*- coding: utf-8 -*-
"""
This script extracts one frame per minute
Set variables in files.json first
"""

import cv2
import json  
import re
import os  

with open('../backend/files.json') as json_file:  
    videoArr = json.load(json_file)
    
cv2.waitKey(0)

outputFolder = videoArr['mediaContent']['output']
rate = videoArr['mediaContent']['rate']

if not os.path.exists(outputFolder):
    os.mkdir(outputFolder)
    print("Directory %s created" % outputFolder)
    
for i in videoArr['mediaContent']['videoData']:
    videoName = re.search('(Prokto|Sigma|Rektum){1}[6-8]{1}', i).group()

    
    print('########## Loading %s ##########' % videoName)
    cap = cv2.VideoCapture(i)
    
    numFrames = cap.get(cv2.CAP_PROP_FRAME_COUNT)
    print('Number of frames: %d' % numFrames)
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    print('FPS: %d' % fps)
    
    dur = numFrames / fps
    print('Video duration: ', dur)
    
    frameWidth = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
    frameHeight = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
    print('Video resolution: %d x %d' % (frameWidth, frameHeight))
    
    dim = (int(frameWidth / 10), int(frameHeight / 10))
    
    surgeryFolder = outputFolder + "/" + videoName
    
    if not os.path.exists(surgeryFolder):
        os.mkdir(surgeryFolder)
        print("Directory %s created" % surgeryFolder)
    
    print('*** Extracting every %dth frame ***' % rate)
    frame = 0
    while cap.isOpened():
        ret, image = cap.read()
        if ret == False:
            break
        if frame % rate == 0:
            image = cv2.resize(image, dim)
            cv2.imwrite('%s/frame%d.jpg' % (surgeryFolder, frame), image)
            print('%s: Saved frame %d' % (videoName, frame))
        frame += 1
print("Finished successfully")