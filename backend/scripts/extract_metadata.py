# -*- coding: utf-8 -*-
"""
This script extracts metadata from videos
"""

import cv2
import json  
import re
import os
import csv
import glob

regex = '(([A-Z][a-z]+)(\d+))\.avi'

# open configuration file
with open('../config.json') as json_file:  
    config = json.load(json_file)
    
# get location to store frames    
output_folder = config['csvLocation'] + '/Frames'

# get sorted list of video files
video_files = glob.glob(config['videoLocation'] + '/*.avi')
video_files = sorted(video_files, key = lambda x: (re.search(regex, x).group(2), int(re.search(regex, x).group(3))))

# create directory for frames if not exists
if not os.path.exists(output_folder):
    os.mkdir(output_folder)
    print("Directory {} created".format(output_folder))

# add csv header
with open(output_folder + '/VideoMetadata.csv', 'w', newline='') as csv_file:
    prop_writer = csv.writer(csv_file, delimiter=',', quotechar='"')
    prop_writer.writerow(['name','type','numFrames','fps','duration','frameWidth','frameHeight'])

# iterate over video files
for path in video_files:
    # extract filename from path
    video_name = os.path.basename(path)
    video_name = re.search(regex, path).group(1)
    print('########## Processing {} ##########'.format(video_name))
    
    # TODO: remove
    surgery_type = None
    if 'Prokto' in video_name:
        surgery_type = 'Proctocolectomy'
    elif 'Sigma' in video_name:
        surgery_type = 'Sigmoid resection'
    elif 'Rektum' in video_name:
        surgery_type = 'Rectal resection'
    
    # capture video from file
    cap = cv2.VideoCapture(path)
    
    # get total number of frames
    num_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) + 1)
    print('Number of frames: %d' % num_frames)
    
    # get fps
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    print('FPS: %d' % fps)
    
    # calculate video duration
    duration_sec = num_frames / fps
    h = int(duration_sec / 3600)
    h = h if h > 10 else '0%d' % h
    m = int((duration_sec / 60) % 60)
    m = m if m > 10 else '0%d' % m
    s = int(duration_sec % 60)
    s = s if s > 10 else '0%d' % s
    duration = '{}:{}:{}'.format(h, m, s)
    print('Video duration: {}'.format(duration_sec))
    
    # get frame width and height
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    print('Video resolution: {}x{}'.format(frame_width, frame_height))
    
    # write data to a csv file
    with open(output_folder + '/VideoMetadata.csv', 'a', newline='') as csv_file:
        prop_writer = csv.writer(csv_file, delimiter=',', quotechar='"')
        prop_writer.writerow([video_name, surgery_type, num_frames, fps, duration, frame_width, frame_height])
        
print()
print('Finished successfully')