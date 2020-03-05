# EndoVisWorkflow

## Required frameworks

- Node.js 10.16.0 - https://nodejs.org/download/release/v10.16.0/
- Angular CLI 8.3.25 - `npm install -g @angular/cli@8.3.25`
- Python 3
- OpenCV

## Setting up the project

### Install dependencies

1. Install frontend dependencies with `npm install`
2. Navigate to backend folder `cd backend`
3. Install backend dependencies with `npm install`

### Define file locations

1. Open `backend/config.json` file
2. Define file locations

### Extract frames and metadata

1. Run necessary python scripts in `backend/scripts` folder

## Running the application (development)

1. Navigate to the backend folder `cd backend`
2. Start the node server with `npm start`
3. Open new terminal tab
4. Start the angular application with `npm start`
5. Angular will open the project in default browser

## Running the application (production)
1. Run command `npm run build`
2. Navigate to the backend folder `cd backend`
3. Start the node server with `npm start`
4. Navigate to `http://localhost:8000/`