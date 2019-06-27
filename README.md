# EndoVisWorkflow

## Required frameworks

- Node.js 8.11.1
- Angular CLI 1.7.4
- Python 3.7.3
- OpenCV 3.4.1

## Setting up the project

### Install dependencies

1. Install frontend dependencies with `npm install`
2. Navigate to backend folder `cd backend`
3. Install backend dependencies with `npm install`

### Define file locations

1. Open `backend/files.json` file
2. Define file locations (fields `csvLocation`, `mediaContent.videoData`, `mediaContent.output`)

### Extract frames

1. Run python script `scripts/extract_frames.py`

## Running the application

1. Navigate to backend folder `cd backend`
2. Start the node server with `npm start`
3. Navigate back to project root folder `cd ..`
4. Start the angular application with `npm start`
5. Navigate to `http://localhost:4200/`