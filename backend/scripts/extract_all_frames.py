# -*- coding: utf-8 -*-
"""
This script extracts and rescales frames from all available videos
"""

import cv2
import json  
import re
import os
import glob

# open configuration file
with open('../config.json') as json_file:  
    config = json.load(json_file)

# get location to store frames
output_folder = config['csvLocation'] + '/Frames'

# get downscale factor
downscale_factor = config['downscaleFactor']

frame_sampling_rate = config['frameSamplingRate']
print('*** Extracting every {}th frame ***'.format(frame_sampling_rate))

regex = '(([A-Z][a-z]+)(\d+))\.avi'

# get sorted list of video files
video_files = glob.glob(config['videoLocation'] + '/*.avi')
video_files = sorted(video_files, key = lambda x: (re.search(regex, x).group(2), int(re.search(regex, x).group(3))))

# create directory for frames if not exists
if not os.path.exists(output_folder):
    os.mkdir(output_folder)
    print("Directory {} created".format(output_folder))

# iterate over video files
for path in video_files:
    # extract filename from path
    video_name = os.path.basename(path)
    video_name = re.search(regex, path).group(1)
    print('########## Processing {} ##########'.format(video_name))
    
    # capture video from file
    cap = cv2.VideoCapture(path)
    
    # get frame width and height
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    # calculate size of a downscaled frame
    dim = (frame_width // downscale_factor, frame_height // downscale_factor)

    # location to store frames of a specific video
    surgery_folder = output_folder + "/" + video_name
    
    # create folder for frames of a specific surgery if not exists
    if not os.path.exists(surgery_folder):
        os.mkdir(surgery_folder)
        print('Directory {} created'.format(surgery_folder))
    
    # read frames
    frame = 0
    while cap.isOpened():
        ret, image = cap.read()
        if ret == False:
            break
        if frame % frame_sampling_rate == 0:
            # scale down
            image = cv2.resize(image, dim)
            
            # save frame to disk
            cv2.imwrite('{}/frame{:06}.jpg'.format(surgery_folder, frame), image)
            print('{}: Saved frame {}'.format(video_name, frame))
        frame += 1

print()
print('Finished successfully')